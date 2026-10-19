import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_URL } from '../utils/constants';
import AgentTable from '../components/AgentTable';

const emptyFilters = { search: '', serviceArea: '', status: '' };

const AgentListPage = () => {
  const location = useLocation();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [status, setStatus] = useState('');
  const [filters, setFilters] = useState(emptyFilters);

  const [refreshKey, setRefreshKey] = useState(0);

  const hasFilters = filters.search || filters.serviceArea || filters.status;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({ page, limit: 10 });
        if (filters.search) params.append('search', filters.search);
        if (filters.serviceArea) params.append('serviceArea', filters.serviceArea);
        if (filters.status) params.append('status', filters.status);

        const data = await fetch(`${API_URL}?${params}`);
        const json = await data.json();

        if (!data.ok) {
          throw new Error(json.error?.message || 'Failed to load agents');
        }

        setAgents(json.data);
        setTotal(json.pagination.total);
        setTotalPages(json.pagination.totalPages || 1);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, filters, refreshKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setFilters({ search: search.trim(), serviceArea: serviceArea.trim(), status });
  };

  const handleClear = () => {
    setSearch('');
    setServiceArea('');
    setStatus('');
    setPage(1);
    setFilters(emptyFilters);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this agent? This cannot be undone.')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error?.message || 'Failed to delete agent');
      }

      setMessage('Agent deleted');

      if (agents.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefreshKey(refreshKey + 1);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="muted">Loading agents...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Agents</h2>
        <span className="muted">{total} total</span>
      </div>

      {message && <p className="notice" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <form className="filters" onSubmit={handleSearch}>
        <input
          placeholder="Search by name"
          aria-label="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          placeholder="Service area"
          aria-label="Service area"
          value={serviceArea}
          onChange={(e) => setServiceArea(e.target.value)}
        />
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="btn">Search</button>
        <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
      </form>

      {agents.length === 0 ? (
        <div className="empty">
          {hasFilters ? (
            <>
              <p>No agents match your filters.</p>
              <button className="btn-secondary" onClick={handleClear}>Clear filters</button>
            </>
          ) : (
            <>
              <p>No agents yet.</p>
              <Link to="/agents/new" className="btn">Add your first agent</Link>
            </>
          )}
        </div>
      ) : (
        <AgentTable agents={agents} onDelete={handleDelete} />
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="muted">Page {page} of {totalPages}</span>
          <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentListPage;