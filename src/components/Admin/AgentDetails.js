import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { LuView } from "react-icons/lu";
import { Link } from 'react-router-dom';

const AgentDetails = () => {
    const [approved, setApproved] = useState([]);
    const [pending, setPending] = useState([]);
    const [allAgent, setAllAgent] = useState([]);
    const token = localStorage.getItem("adminToken"); 

    useEffect(() => {
        axios.get("http://localhost:5000/agents/approved", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setApproved(response.data))
        .catch(error => console.error("Error fetching approved agents:", error));

        axios.get("http://localhost:5000/agents/pending", {
            headers: { Authorization: `Bearer ${token}`}
        })
        .then(response => setPending(response.data))
        .catch(error => console.error("Error fetching pending agents:", error));

        axios.get("http://localhost:5000/agents/all-agent", {
            headers: { Authorization: `Bearer ${token}`}
        })
        .then(response => setAllAgent(response.data))
        .catch(error => console.error("Error fetching pending agents:", error));
    }, [token]);
  return (
    <>
    <h4 className='mb-3 py-2 px-4 rounded' style={{background: '#f8f8f8'}}>Agent Information</h4>
    <div className="col-12 d-md-flex">
                <div className="p-4 col-12 col-md-4 mb-3">
                    <div className="bg-white shadow rounded p-4 text-center d-flex flex-column gap-2">
                        <h4 className="fw-bold">All Agent</h4>
                        <div className="fw-bold text-dark mb-2">{allAgent.length}</div>
                        <Link to='../agent-status' className='text-decoration-none'>
                        <div className="d-flex gap-1 py-2 px-3 rounded-pill text-secondary align-items-center justify-content-center" style={{cursor: 'pointer', background: '#f8f8f8'}}>
                            <LuView  size={20}/>
                            <span>View</span>
                        </div>
                        </Link>
                    </div>
                </div>
                <div className="p-4 col-12 col-md-4 mb-3">
                    <div className="bg-white shadow rounded p-4 text-center d-flex flex-column gap-2">
                        <h4 className="fw-bold">Approved Agent</h4>
                        <div className="fw-bold text-dark mb-2">{approved.length}</div>
                        <Link to='../approved-agent' className='text-decoration-none'>
                        <div className="d-flex gap-1 py-2 px-3 rounded-pill text-secondary align-items-center justify-content-center" style={{cursor: 'pointer', background: '#f8f8f8'}}>
                            <LuView  size={20}/>
                            <span>View</span>
                        </div>
                        </Link>
                    </div>
                </div>
                <div className="p-4 col-12 col-md-4 mb-3">
                    <div className="bg-white shadow rounded p-4 text-center d-flex flex-column gap-2">
                        <h4 className="fw-bold">Pending Agent</h4>
                        <div className="fw-bold text-dark mb-2">{pending.length}</div>
                        <Link to='../update-agent-status' className='text-decoration-none'>
                        <div className="d-flex gap-1 py-2 px-3 rounded-pill text-secondary align-items-center justify-content-center" style={{cursor: 'pointer', background: '#f8f8f8'}}>
                            <LuView  size={20}/>
                            <span>View</span>
                        </div>
                        </Link>
                    </div>
                </div>
            </div>
    </>
  )
}

export default AgentDetails