import { Link } from 'react-router-dom';

const AgentTable = ({ agents, onDelete }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Service area</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {agents.map((agent) => (
          <tr key={agent.id}>
            <td data-label="Name">
              <Link to={`/agents/${agent.id}`}>{agent.fullName}</Link>
            </td>
            <td data-label="Phone">{agent.phone}</td>
            <td data-label="Email">{agent.email}</td>
            <td data-label="Service area">{agent.serviceArea}</td>
            <td data-label="Status">
              <span className={`status status-${agent.status}`}>{agent.status}</span>
            </td>
            <td data-label="Actions">
              <div className="actions">
                <Link to={`/agents/${agent.id}/edit`}>Edit</Link>
                <button className="link-danger" onClick={() => onDelete(agent.id)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AgentTable;