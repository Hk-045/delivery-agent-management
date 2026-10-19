import { Link, Outlet } from 'react-router-dom';

const App = () => {
  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="logo">Delivery Agents</Link>
        <Link to="/agents/new" className="btn">+ Add agent</Link>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default App;