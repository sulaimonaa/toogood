import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";

const AllAgent = () => {
    const [agents, setAgents] = useState([]);
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        axios.get("https://toogood-1.onrender.com/agents/all-agent", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAgents(response.data))
        .catch(error => console.error("Error fetching agents:", error));
    }, [token]);

    const handleApproval = (agentId, status) => {
        axios.put(`https://toogood-1.onrender.com/admin/approve-agent/${agentId}`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setAgents(agents.filter(agent => agent.id !== agentId));
        })
        .catch(error => console.error("Error updating status:", error));
    };

    const handleDelete = (agentId) => {
        if (!window.confirm("Are you sure you want to delete this agent?")) return;

        axios.delete(`https://toogood-1.onrender.com/admin/delete-agent/${agentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setAgents(agents.filter(agent => agent.id !== agentId));
        })
        .catch(error => console.error("Error deleting agent:", error));
    };

    return (
        <div className="container-fluid overflow-scroll">
            <div className="spacer"></div>
            <div className="container">
            <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-3">All Registered Agents</h2>
            <Link to='../admin/dashboard'>
            <FaHome size={25} className="text-secondary" />
            </Link>
            </div>         
            <table className="w-100">
                <thead>
                    <tr>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Name</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Email</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Status</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {agents.map(agent => (
                        <tr key={agent.id}>
                            <td className="p-2 border-secondary-subtle border text-center">{agent.agent_name}</td>
                            <td className="p-2 border-secondary-subtle border text-center">{agent.agent_email}</td>
                            <td className="p-2 border-secondary-subtle border text-center">{agent.status}</td>
                            <td className="p-2 border-secondary-subtle border text-center">
                                {(agent.status) === 'approved' ? (
                                    <button onClick={() => handleApproval(agent.id, "approved")} style={{background: '#000000', color: '#fff', fontSize: '0.8rem'}} disabled className="border-0 py-1 px-2 rounded mx-1">
                                    Approve
                                </button>
                                ) : (
                                    <button onClick={() => handleApproval(agent.id, "approved")} style={{background: '#00008B', color: '#fff', fontSize: '0.8rem'}} className="border-0 py-1 px-2 rounded mx-1">
                                    Approve
                                </button>
                                )}
                                
                                <button onClick={() => handleApproval(agent.id, "pending")} style={{background: '#ffcc00', fontSize: '0.8rem'}} className="border-0 py-1 px-2 rounded mx-1">
                                    Reject
                                </button>
                                <button onClick={() => handleDelete(agent.id)} style={{ background: 'red', color: "#fff", fontSize: '0.8rem' }} className="border-0 py-1 px-2 rounded mx-1">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default AllAgent;
