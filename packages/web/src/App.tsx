import { Route, Routes } from 'react-router-dom';
import { domains, entries } from './content';
import { DomainNav } from './components/DomainNav';
import { SearchBox } from './components/SearchBox';
import { Home } from './pages/Home';
import { EntryPage } from './pages/Entry';

export function App() {
  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="/">
          Business Atlas
        </a>
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
            <Route path="/entries/:id" element={<EntryPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
