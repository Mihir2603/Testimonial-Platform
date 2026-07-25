import { Routes, Route, NavLink } from 'react-router-dom';
import SubmitPage from './pages/SubmitPage';
import DashboardPage from './pages/DashboardPage';
import WallPage from './pages/WallPage';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="logo">
            <span className="logo-mark">✦</span>
            PraiseWall
          </NavLink>
          <nav className="nav">
            <NavLink to="/submit" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Submit
            </NavLink>
            <NavLink to="/wall" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Wall
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<WallPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/wall" element={<WallPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>PraiseWall — collect, review, and showcase customer love.</p>
      </footer>
    </div>
  );
}
