import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { byDomain, domains } from '../content';

/**
 * Left navigation: every domain, collapsed until opened.
 *
 * Structurally this mirrors the Platform Atlas sidebar — a "Browse" title, a
 * section per domain separated by a rule, a head row carrying the name and a
 * count, then nested rows.
 *
 * The nested rows sit behind a dropdown. A domain can hold dozens of entries
 * once the catalog is filled in, and fourteen fully-expanded lists would bury
 * the content they exist to navigate. Collapsed, the sidebar is a table of
 * contents; opened, it is a menu.
 *
 * The domain named in the URL opens itself, so a shared link lands with its
 * context already visible.
 */
export function DomainNav() {
  const [params] = useSearchParams();
  const active = params.get('domain');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (active) {
      setOpen((prev) => ({ ...prev, [active]: true }));
    }
  }, [active]);

  const toggle = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <nav className="sidebar" aria-label="Browse the atlas">
      <h2 className="sidebar-title">Browse</h2>

      <section className="nav-domain">
        <NavLink
          to="/guide"
          className={({ isActive }) => `nav-guide${isActive ? ' active' : ''}`}
        >
          <span className="nav-domain-name">How the catalog is organised</span>
        </NavLink>
      </section>

      {domains.map((d) => {
        const entries = byDomain(d.id);
        const isOpen = !!open[d.id];

        return (
          <section className="nav-domain" key={d.id}>
            <button
              type="button"
              className={`nav-domain-head${isOpen ? ' open' : ''}`}
              onClick={() => toggle(d.id)}
              aria-expanded={isOpen}
              aria-controls={`nav-rows-${d.id}`}
            >
              <span className="nav-domain-name">{d.name}</span>
              <span className="nav-count">{entries.length}</span>
              <svg className="nav-caret" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            {isOpen && entries.length > 0 && (
              <ul className="nav-rows" id={`nav-rows-${d.id}`}>
                {entries.map((e) => (
                  <li key={e.id}>
                    <NavLink
                      to={`/entries/${e.id}`}
                      className={({ isActive }) =>
                        `nav-row${isActive ? ' active' : ''}`
                      }
                    >
                      <span className="nav-row-name">{e.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </nav>
  );
}
