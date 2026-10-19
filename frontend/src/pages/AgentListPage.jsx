import { useEffect, useState } from 'react';
import { API_URL } from '../utils/constants';
import AgentTable from '../components/AgentTable';

const AgentListPage = () => {
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>All agents</h2>

      {agents.length === 0 ? (
        <p>No agents found.</p>
      ) : (
        <AgentTable agents={agents} />
      )}
    </div>
  );
};

export default AgentListPage;