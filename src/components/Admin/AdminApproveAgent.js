import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminApproveAgents = () => {
    const [agents, setAgents] = useState([]);
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        axios.get("http://localhost:5000/agents/pending", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAgents(response.data))
        .catch(error => console.error("Error fetching agents:", error));
    }, [token]);

    const handleApproval = (agentId, status) => {
        axios.put(`http://localhost:5000/admin/approve-agent/${agentId}`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setAgents(agents.filter(agent => agent.id !== agentId));
        })
        .catch(error => console.error("Error updating status:", error));
    };

    const handleDelete = (agentId) => {
        if (!window.confirm("Are you sure you want to delete this agent?")) return;

        axios.delete(`http://localhost:5000/admin/delete-agent/${agentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setAgents(agents.filter(agent => agent.id !== agentId));
        })
        .catch(error => console.error("Error deleting agent:", error));
    };

    return (
        <div>
            <h2>Pending Agents</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {agents.map(agent => (
                        <tr key={agent.id}>
                            <td>{agent.agent_name}</td>
                            <td>{agent.agent_email}</td>
                            <td>
                                <button onClick={() => handleApproval(agent.id, "approved")}>
                                    Approve
                                </button>
                                <button onClick={() => handleApproval(agent.id, "pending")}>
                                    Reject
                                </button>
                                <button onClick={() => handleDelete(agent.id)} style={{ color: "red" }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminApproveAgents;
