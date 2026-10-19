const AgentTable = ({ agents }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Service area</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {agents.map((agent) => (
          <tr key={agent.id}>
            <td>{agent.fullName}</td>
            <td>{agent.phone}</td>
            <td>{agent.email}</td>
            <td>{agent.serviceArea}</td>
            <td>
              <span className={`status status-${agent.status}`}>
                {agent.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AgentTable;