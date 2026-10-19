import { useEffect, useState } from 'react';
import { API_URL } from './utils/constants';
import AgentTable from './components/AgentTable';

const App = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(API_URL);
        const json = await data.json();

        if (!data.ok) {
          throw new Error(json.error?.message || 'Failed to load agents');
        }

        setAgents(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <h2 className="container">Loading...</h2>;
  if (error) return <p className="container error">{error}</p>;

  return (
    <div className="container">
      <h1>Delivery Agents</h1>

      {agents.length === 0 ? (
        <p>No agents found.</p>
      ) : (
        <AgentTable agents={agents} />
      )}
    </div>
  );
};

export default App;