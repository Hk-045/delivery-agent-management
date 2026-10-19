import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/constants';

const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
  serviceArea: '',
  status: 'active',
};

const AgentFormPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || 'Failed to save agent');
      }

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Add agent</h2>

      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
        </label>

        <label>
          Phone
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Service area
          <input name="serviceArea" value={form.serviceArea} onChange={handleChange} required />
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default AgentFormPage;