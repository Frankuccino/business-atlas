import { NavLink, Route, Routes } from 'react-router-dom';
import { domains, entries } from './content';
import { DomainNav } from './components/DomainNav';
import { SearchBox } from './components/SearchBox';
import { Home } from './pages/Home';
import { EntryPage } from './pages/Entry';
import { GuidePage } from './pages/Guide';
import { DashboardPage } from './pages/Dashboard';
import { SessionPage } from './pages/Session';
import { ProgressPage } from './pages/Progress';
import { LoginPage } from './pages/Login';

export function App() {
  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Business Atlas
        </NavLink>

        <nav className="topnav" aria-label="Primary">
          <NavLink
            to="/guide"
            className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
          >
            Guide
          </NavLink>
          <NavLink
            to="/session"
            className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
          >
            Session
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
          >
            Progress
          </NavLink>
        </nav>

        <SearchBox />
        <span className="count">
          {entries.length} entries · {domains.length} domains
        </span>
      </header>

      <div className="layout">
        <aside className="sidenav">
          <DomainNav />
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/entries/:id" element={<EntryPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
