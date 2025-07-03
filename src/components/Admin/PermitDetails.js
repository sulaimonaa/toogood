import React from 'react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { FaEye, FaTrash } from 'react-icons/fa'

const PermitDetails = () => {
    const [allVisa, setAllVisa] = useState([]);
    const [approved, setApproved] = useState([]);
    const [pending, setPending] = useState([]);
    const [deniedVisa, setDeniedVisa] = useState([]);
    const token = localStorage.getItem("adminToken"); 

    useEffect(() => {
        axios.get("https://toogood-1.onrender.com/permit/first-ten", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAllVisa(response.data))
        .catch(error => console.error("Error fetching approved visa:", error));

        axios.get("https://toogood-1.onrender.com/permit/approved", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setApproved(response.data))
        .catch(error => console.error("Error fetching approved visa:", error));

        axios.get("https://toogood-1.onrender.com/permit/pending", {
            headers: { Authorization: `Bearer ${token}`}
        })
        .then(response => setPending(response.data))
        .catch(error => console.error("Error fetching pending visa:", error));

        axios.get("https://toogood-1.onrender.com/permit/denied", {
            headers: { Authorization: `Bearer ${token}`}
        })
        .then(response => setDeniedVisa(response.data))
        .catch(error => console.error("Error fetching denied visa:", error));
    }, [token]);

    const handleDelete = (visaId) => {
        if (!window.confirm("Are you sure you want to delete this permit application?")) return;

        axios.delete(`https://toogood-1.onrender.com/admin/delete-permit/${visaId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setAllVisa(allVisa.filter(visa => visa.id !== visaId));
        })
        .catch(error => console.error("Error deleting permit application:", error));
    };

  return (
    <>
        <div className='container d-md-flex gap-2'>
            <div className='col-12 col-md-6 overflow-scroll mb-4'>
                <h6>List of Permit Applications</h6>
                <table className='w-100'>
                    <thead>
                        <tr style={{fontSize: '0.8rem'}}>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Permit</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Applicant</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Fee</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Payment</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Status</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allVisa.map((visa, index) => (
                            <tr key={index} className='p-2 mb-2' style={{fontSize: '0.8rem'}}>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.visa_destination}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.first_name} {visa.last_name}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>&#x20A6;{Number(visa.visa_fee).toLocaleString()}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.payment_status}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.visa_status}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>
                                    <Link to={`../visa-status/${visa.id}`} className='border-0 p-2 bg-primary text-white text-decoration-none rounded-pill'>
                                        <FaEye className='text-white' />
                                    </Link>
                                    <button onClick={() => handleDelete(visa.id)} style={{ background: 'red', color: "#fff", fontSize: '0.8rem' }} className="border-0 py-1 px-2 rounded mx-1">
                                        <FaTrash className='text-white' />
                                    </button>
                                </td>
                            </tr>
                        ))

                        }
                    </tbody>
                </table>
                <Link to='../admin/permit-list' className='text-dark text-decoration-none'>
                    <div style={{background: '#f8f8f8', fontSize: '1rem', width: '320px'}} className='rounded-pill py-2 px-4 text-center mt-3 shadow'>
                        View all
                    </div>
                    </Link>
            </div>
            <div className='col-12 col-md-6 p-2'>
                <div className='d-flex flex-column gap-2 bg-white shadow p-4 rounded'>
                    <h5 className='text-center'>Permit Status</h5>
                    <div className='d-flex justify-content-between align-items-center border-bottom py-3'>
                        <div>Approved</div>
                        <div className='d-flex gap-1 align-items-center'>
                            <div className='py-2 px-3 rounded-circle bg-secondary-subtle'>{approved.length}</div>
                            <Link to='../approved-permit' className='text-decoration-none'>
                            <span style={{fontSize: '12px', fontStyle: 'italic', cursor: 'pointer', color: 'GrayText'}}>View</span>
                            </Link>
                        </div>
                    </div>
                    <div className='d-flex justify-content-between align-items-center border-bottom py-3'>
                        <div>Pending</div>
                        <div className='d-flex gap-1 align-items-center'>
                            <div className='py-2 px-3 rounded-circle bg-secondary-subtle'>{pending.length}</div>
                            <Link to='../pending-permit' className='text-decoration-none text-secondary-subtle'>
                            <span style={{fontSize: '12px', fontStyle: 'italic', cursor: 'pointer', color: 'GrayText'}}>View</span>
                            </Link>
                        </div>
                    </div>
                    <div className='d-flex justify-content-between align-items-center border-bottom py-3'>
                        <div>Denied</div>
                        <div className='d-flex gap-1 align-items-center'>
                            <div className='py-2 px-3 rounded-circle bg-secondary-subtle'>{deniedVisa.length}</div>
                            <Link to='../denied-permit' className='text-decoration-none text-secondary-subtle'>
                            <span style={{fontSize: '12px', fontStyle: 'italic', cursor: 'pointer', color: 'GrayText'}}>View</span>
                            </Link>
                        </div>
                    </div>
                </div>
                    <Link to='../admin/add_permit' className='text-dark text-decoration-none text-secondary-subtle'>
                    <div style={{background: '#f8f8f8', fontSize: '1rem', width: '320px'}} className='rounded-pill py-2 px-4 text-center mt-3 shadow'>
                        Create permit destination
                    </div>
                    </Link>
                    <Link to="../admin/permit" className='text-dark text-decoration-none text-secondary-subtle'>
                <div style={{background: '#f8f8f8', fontSize: '1rem', width: '320px'}} className='rounded-pill py-2 px-4 text-center mt-3 shadow'>
                Update permit destinations
                </div></Link>
            </div>
        </div>
    </>
  )
}

export default PermitDetails