import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { domains, byDomain } from '../content';

export function CategoriesDropdown() {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const active = params.get('domain');
  const populated = domains.filter((d) => byDomain(d.id).length > 0);

  const activeName = active
    ? (populated.find((d) => d.id === active)?.name ?? 'Categories')
    : 'Categories';

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
            className={`categories-item${!active ? ' active' : ''}`}
            onClick={() => { setParams({}); setOpen(false); }}
          >
            All domains
          </button>
          {populated.map((d) => (
            <button
              key={d.id}
              className={`categories-item${active === d.id ? ' active' : ''}`}
              onClick={() => { setParams({ domain: d.id }); setOpen(false); }}
            >
              {d.name}
              <span className="categories-count">{byDomain(d.id).length}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
