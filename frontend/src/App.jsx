import { Link, Outlet } from 'react-router-dom';

const App = () => {
  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="logo">Delivery Agents</Link>
        <div className="header-actions">

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