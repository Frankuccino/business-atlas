import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CategoriesDropdown } from './CategoriesDropdown';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="mobile-nav-overlay" onClick={() => setOpen(false)}>
          <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
            <CategoriesDropdown />
            <NavLink to="/guide" className="mobile-nav-link" onClick={() => setOpen(false)}>Guide</NavLink>
            <NavLink to="/map" className="mobile-nav-link" onClick={() => setOpen(false)}>Map</NavLink>
            <NavLink to="/playbooks" className="mobile-nav-link" onClick={() => setOpen(false)}>Playbooks</NavLink>
            <NavLink to="/session" className="mobile-nav-link" onClick={() => setOpen(false)}>Session</NavLink>
            <NavLink to="/dashboard" className="mobile-nav-link" onClick={() => setOpen(false)}>Progress</NavLink>
          </nav>
        </div>
      )}
    </>
  );
}
