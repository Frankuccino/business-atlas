import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { domains, entries, type Entry } from '../content';

/**
 * The map view.
 *
 * A force-directed SVG graph of the catalog: nodes are entries, edges are the
 * symmetric `related` links, and nodes are coloured by domain.
 *
 * Why hand-rolled rather than a charting library: the graph is small (63 nodes),
 * the layout is a few dozen lines of Verlet integration, and a dependency here
 * would ship a layout engine to render 63 circles. The physics is also the part
 * that is fun to get wrong, so keeping it visible is worth more than the
 * convenience.
 *
 * The layout runs in a `useEffect` and writes to a ref, not state. Re-running
 * the simulation on every render would restart it, so the graph would never
 * settle — the same class of bug as re-rolling a queue in a component body.
 */

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  domain: string;
  type: string;
}

interface Edge {
  source: string;
  target: string;
}

const WIDTH = 900;
const HEIGHT = 620;

/** Repulsion between every pair, attraction along edges, and a centre pull. */
const REPULSION = 9000;
const SPRING = 0.012;
const SPRING_LENGTH = 90;
const CENTER_PULL = 0.006;
const DAMPING = 0.85;
const SETTLE = 400;

export function MapView() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('entry') ?? null;
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { nodes, edges } = useMemo(() => {
    const byId = new Map<string, Node>(
      entries.map((e, i) => {
        // Seed on a circle rather than at the origin. Starting every node at
        // (0,0) makes the first frames a single exploding point.
        const angle = (i / entries.length) * Math.PI * 2;
        return [
          e.id,
          {
            id: e.id,
            x: WIDTH / 2 + Math.cos(angle) * 220,
            y: HEIGHT / 2 + Math.sin(angle) * 220,
            vx: 0,
            vy: 0,
            domain: e.domain,
            type: e.type,
          },
        ];
      }),
    );

    const edgeList: Edge[] = [];
    const seen = new Set<string>();

    for (const e of entries) {
      for (const target of e.related) {
        if (!byId.has(target)) continue;
        // The graph is undirected after closure, so each pair appears twice.
        // Dedupe on the sorted pair or every edge is drawn twice.
        const key = [e.id, target].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        edgeList.push({ source: e.id, target });
      }
    }

    return { nodes: byId, edges: edgeList };
  }, []);

  useEffect(() => {
    const step = () => {
      const list = [...nodes.values()];

      // Repulsion: every pair pushes apart. O(n^2), which is fine at 63 nodes
      // and would need a spatial index long before it needed a library.
      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const a = list[i]!;
          const b = list[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy || 1;
          const force = REPULSION / distSq;
          const dist = Math.sqrt(distSq);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // Attraction along edges, toward the ideal spring length.
      for (const edge of edges) {
        const a = nodes.get(edge.source);
        const b = nodes.get(edge.target);
        if (!a || !b) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - SPRING_LENGTH;
        const fx = (dx / dist) * displacement * SPRING;
        const fy = (dy / dist) * displacement * SPRING;

        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // Centre pull and integration. Damping is what makes it settle rather
      // than oscillate forever.
      for (const n of list) {
        n.vx += (WIDTH / 2 - n.x) * CENTER_PULL;
        n.vy += (HEIGHT / 2 - n.y) * CENTER_PULL;

        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;

        // Keep nodes inside the viewport. Without this a strong repulsion can
        // fling one off-canvas and it never comes back.
        n.x = Math.max(30, Math.min(WIDTH - 30, n.x));
        n.y = Math.max(30, Math.min(HEIGHT - 30, n.y));
      }
    };

    // Run the whole simulation synchronously, then render once.
    //
    // Not requestAnimationFrame. rAF is throttled to zero in a background tab
    // and in headless browsers, so an animated layout silently never runs — the
    // graph renders frozen at its seed positions with no error. A fixed number
    // of iterations is deterministic, costs the same either way, and the result
    // is identical on every load.
    for (let i = 0; i < SETTLE; i += 1) {
      step();
    }
  }, [nodes, edges]);

  const selected = selectedId ? nodes.get(selectedId) : null;
  const neighbours = useMemo(() => {
    if (!selectedId) return new Set<string>();
    return new Set(
      edges
        .filter((e) => e.source === selectedId || e.target === selectedId)
        .map((e) => (e.source === selectedId ? e.target : e.source)),
    );
  }, [selectedId, edges]);

  const domainColor = (domainId: string) => {
    const index = domains.findIndex((d) => d.id === domainId);
    return `hsl(${(index * 47) % 360} 60% 55%)`;
  };

  const select = (id: string) => {
    setParams(id === selectedId ? {} : { entry: id });
  };

  return (
    <div>
      <header className="dash-header">
        <h1>Map</h1>
        <p>
          {entries.length} entries, {edges.length} links. Click a node to see its neighbours. Layout is
          computed in the browser.
        </p>
      </header>

      <div className="map-legend">
        {domains.map((d) => (
          <span className="legend-item" key={d.id}>
            <span className="legend-dot" style={{ background: domainColor(d.id) }} />
            {d.name}
          </span>
        ))}
      </div>

<div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="map"
        role="img"
        aria-label="Knowledge graph of the catalog"
      >
        {edges.map((e) => {
          const a = nodes.get(e.source);
          const b = nodes.get(e.target);
          if (!a || !b) return null;

          const highlighted =
            selectedId !== null && (e.source === selectedId || e.target === selectedId);

          return (
            <line
              key={`${e.source}-${e.target}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={highlighted ? 'map-edge map-edge-active' : 'map-edge'}
            />
          );
        })}

        {[...nodes.values()].map((n) => {
          const isSelected = n.id === selectedId;
          const isNeighbour = neighbours.has(n.id);
          const dimmed = selectedId !== null && !isSelected && !isNeighbour;
          const entry = entries.find((e) => e.id === n.id);

          return (
            <g key={n.id} onClick={() => select(n.id)} style={{ cursor: 'pointer' }}>
              <circle
                cx={n.x}
                cy={n.y}
                r={isSelected ? 9 : 6}
                fill={domainColor(n.domain)}
                className={dimmed ? 'map-node map-node-dim' : 'map-node'}
              />
              <title>{entry?.title ?? n.id}</title>
            </g>
          );
        })}
      </svg>

      {selected ? <NodePanel entry={entries.find((e) => e.id === selected.id) ?? null} position={selected} /> : null}
    </div>
    </div>
  );
}

function NodePanel({ entry, position }: { entry: Entry | null; position: { x: number; y: number } }) {
  if (!entry) return null;

  // Position the card near the node. The SVG preserves its 900:620 aspect ratio,
  // so both axes scale by (containerWidth / 900). Use WIDTH for both to stay aligned.
  const left = Math.min(position.x + 16, WIDTH - 280);
  const top = Math.max(position.y - 40, 10);

  return (
    <div
      className="node-panel"
      style={{
        position: 'absolute',
        left: `${(left / WIDTH) * 100}%`,
        top: `${(top / WIDTH) * 100}%`,
        zIndex: 10,
      }}
    >
      <h3>{entry.title}</h3>
      <p className="muted">
        {entry.type} · {entry.domain}
      </p>
      <p>{entry.one_line_definition}</p>
      <a href={`/entries/${entry.id}`}>Open entry →</a>
    </div>
  );
}
