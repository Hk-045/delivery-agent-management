import { Link, Outlet } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';

const App = () => {
  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="logo">Delivery Agents</Link>
        <div className="header-actions">
          <ThemeToggle />
          <Link to="/agents/new" className="btn">+ Add agent</Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default App;