import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { domains, byDomain } from '../content';

interface CategoryGroup {
  name: string;
  domains: string[];
}

const GROUPS: CategoryGroup[] = [
  { name: 'Foundations', domains: ['foundations'] },
  { name: 'Finance', domains: ['finance-accounting', 'unit-economics-metrics'] },
  { name: 'Growth', domains: ['marketing-growth', 'sales', 'product-innovation'] },
  { name: 'Strategy', domains: ['strategy', 'operations-supply-chain', 'economics-macro'] },
  { name: 'People', domains: ['people-organization', 'leadership-decision-making'] },
  { name: 'Legal & Risk', domains: ['legal-risk-governance'] },
  { name: 'Capital & Deals', domains: ['entrepreneurship-capital', 'negotiation-communication'] },
];

export function CategoriesDropdown() {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const active = params.get('domain');

  const activeName = active
    ? (domains.find((d) => d.id === active)?.name ?? 'Categories')
    : 'Categories';

  const domainById = new Map(domains.map((d) => [d.id, d]));

  return (
    <div
      className="categories-dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`topnav-link${active ? ' active' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {activeName} ▾
      </button>
      {open && (
        <div className="categories-menu">
          <button
            className={`categories-item categories-all${!active ? ' active' : ''}`}
            onClick={() => { setParams({}); setOpen(false); }}
          >
            All domains
          </button>
          <div className="categories-grid">
            {GROUPS.map((group) => {
              const groupDomains = group.domains
                .map((id) => domainById.get(id))
                .filter(Boolean);
              if (groupDomains.length === 0) return null;
              return (
                <div className="categories-group" key={group.name}>
                  <div className="categories-group-name">{group.name}</div>
                  {groupDomains.map((d) => (
                    <button
                      key={d!.id}
                      className={`categories-item${active === d!.id ? ' active' : ''}`}
                      onClick={() => { setParams({ domain: d!.id }); setOpen(false); }}
                    >
                      {d!.name}
                      <span className="categories-count">{byDomain(d!.id).length}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
