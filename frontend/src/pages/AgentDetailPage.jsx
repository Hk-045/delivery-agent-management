import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../utils/constants';

const AgentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const message = location.state?.message;

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const data = await fetch(`${API_URL}/${id}`);
        const json = await data.json();

        if (!data.ok) {
          throw new Error(json.error?.message || 'Failed to load agent');
        }

        setAgent(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this agent? This cannot be undone.')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error?.message || 'Failed to delete agent');
      }

      navigate('/', { state: { message: 'Agent deleted' } });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="muted">Loading agent...</p>;

  if (!agent) {
    return (
      <div>
        <p className="error" role="alert">{error}</p>
        <Link to="/">Back to agents</Link>
      </div>
    );
  }

  return (
    <div>
      {message && <p className="notice" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <div className="card">
        <h2>{agent.fullName}</h2>

        <dl className="details">
          <dt>Phone</dt>
          <dd>{agent.phone}</dd>

          <dt>Email</dt>
          <dd>{agent.email}</dd>

          <dt>Service area</dt>
          <dd>{agent.serviceArea}</dd>

          <dt>Status</dt>
          <dd>
            <span className={`status status-${agent.status}`}>{agent.status}</span>
          </dd>

          <dt>Created</dt>
          <dd>{new Date(agent.createdAt).toLocaleString()}</dd>

          <dt>Last updated</dt>
          <dd>{new Date(agent.updatedAt).toLocaleString()}</dd>
        </dl>

        <div className="actions">
          <Link to={`/agents/${id}/edit`} className="btn">Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          <Link to="/">Back to list</Link>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;