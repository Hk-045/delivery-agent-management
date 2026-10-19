import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../utils/constants';

const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
  serviceArea: '',
  status: 'active',
};

const AgentFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchAgent = async () => {
      try {
        const data = await fetch(`${API_URL}/${id}`);
        const json = await data.json();

        if (!data.ok) {
          throw new Error(json.error?.message || 'Failed to load agent');
        }

        setForm({
          fullName: json.fullName,
          phone: json.phone,
          email: json.email,
          serviceArea: json.serviceArea,
          status: json.status,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(isEdit ? `${API_URL}/${id}` : API_URL, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || 'Failed to save agent');
      }

      if (isEdit) {
        navigate(`/agents/${id}`, { state: { message: 'Agent updated' } });
      } else {
        navigate('/', { state: { message: 'Agent created' } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="muted">Loading agent...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>{isEdit ? 'Edit agent' : 'Add agent'}</h2>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Ravi Kumar"
            maxLength={100}
            required
          />
        </label>

        <label>
          Phone
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="98765 43210"
            required
          />
          <span className="hint">10-digit Indian mobile number</span>
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />
        </label>

        <label>
          Service area
          <input
            name="serviceArea"
            value={form.serviceArea}
            onChange={handleChange}
            placeholder="Koramangala"
            maxLength={100}
            required
          />
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <div className="actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <Link to={isEdit ? `/agents/${id}` : '/'} className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AgentFormPage;