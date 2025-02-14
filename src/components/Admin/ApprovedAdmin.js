import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const ApprovedAgent = () => {
    const [agents, setAgents] = useState([]);
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        axios.get("https://toogood-1.onrender.com/agents/approved", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAgents(response.data))
        .catch(error => console.error("Error fetching agents:", error));
    }, [token]);

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
        <div className="container-fluid">
            <div className="spacer"></div>
            <div className="container overflow-scroll">
            <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-3">All Approved Agents</h2>
            <Link to='../admin/dashboard'>
            <FaHome size={25} className="text-secondary" />
            </Link>
            </div>  
            <table className="w-100">
                <thead>
                    <tr>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Name</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Email</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {agents.map(agent => (
                        <tr key={agent.id}>
                            <td className="p-2 border-secondary-subtle border text-center">{agent.agent_name}</td>
                            <td className="p-2 border-secondary-subtle border text-center">{agent.agent_email}</td>
                            <td className="p-2 border-secondary-subtle border text-center">
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

export default ApprovedAgent;
