import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { domains, byDomain } from '../content';

interface CategoryGroup {
  name: string;
  domains: string[];
}

const GROUPS: CategoryGroup[] = [
  { name: 'Foundations', domains: ['foundations'] },
  { name: 'Finance', domains: ['finance', 'unit-economics'] },
  { name: 'Growth', domains: ['marketing', 'sales', 'product'] },
  { name: 'Strategy', domains: ['strategy', 'operations', 'economics'] },
  { name: 'People', domains: ['people', 'leadership'] },
  { name: 'Legal & Risk', domains: ['legal'] },
  { name: 'Capital & Deals', domains: ['capital', 'negotiation'] },
];

export function CategoriesDropdown() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const active = location.pathname.startsWith('/domains/')
    ? location.pathname.split('/')[2]
    : null;

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
        {activeName} <span style={{ fontSize: '10px', marginLeft: '2px' }}>▾</span>
      </button>
      {open && (
        <div className="categories-menu">
          <button
            className={`categories-item categories-all${!active ? ' active' : ''}`}
            onClick={() => { navigate('/'); setOpen(false); }}
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
                      onClick={() => { navigate('/domains/' + d!.id); setOpen(false); }}
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
