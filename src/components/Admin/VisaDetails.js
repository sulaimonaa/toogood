import React from 'react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

const VisaDetails = () => {
    const [allVisa, setAllVisa] = useState([]);
    const [approved, setApproved] = useState([]);
    const [pending, setPending] = useState([]);
    const [deniedVisa, setDeniedVisa] = useState([]);
    const token = localStorage.getItem("adminToken"); 

    useEffect(() => {
        axios.get("http://localhost:5000/visa/first-ten", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAllVisa(response.data))
        .catch(error => console.error("Error fetching approved visa:", error));

        axios.get("http://localhost:5000/visa/approved", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setApproved(response.data))
        .catch(error => console.error("Error fetching approved visa:", error));

        axios.get("http://localhost:5000/visa/pending", {
            headers: { Authorization: `Bearer ${token}`}
        })
        .then(response => setPending(response.data))
        .catch(error => console.error("Error fetching pending visa:", error));

        axios.get("http://localhost:5000/visa/denied", {
            headers: { Authorization: `Bearer ${token}`}
        })
        .then(response => setDeniedVisa(response.data))
        .catch(error => console.error("Error fetching denied visa:", error));
    }, [token]);
  return (
    <>
        <div className='container d-md-flex gap-2'>
            <div className='col-12 col-md-6 overflow-scroll mb-4'>
                <h6>List of Visa Applications</h6>
                <table className='w-100'>
                    <thead>
                        <tr style={{fontSize: '0.8rem'}}>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Visa</th>
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
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.visa_fee}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.payment_status}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.visa_status}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>
                                    <Link to={`../visa-status/${visa.id}`} className='border-0 p-2 bg-primary text-white text-decoration-none rounded-pill'>
                                        Check
                                    </Link>
                                </td>
                            </tr>
                        ))

                        }
                    </tbody>
                </table>
                <Link to='../admin/visa-list' className='text-dark text-decoration-none'>
                    <div style={{background: '#f8f8f8', fontSize: '1rem', width: '320px'}} className='rounded-pill py-2 px-4 text-center mt-3 shadow'>
                        View all
                    </div>
                    </Link>
            </div>
            <div className='col-12 col-md-6 p-2'>
                <div className='d-flex flex-column gap-2 bg-white shadow p-4 rounded'>
                    <h5 className='text-center'>Visa Status</h5>
                    <div className='d-flex justify-content-between align-items-center border-bottom py-3'>
                        <div>Approved</div>
                        <div className='d-flex gap-1 align-items-center'>
                            <div className='py-2 px-3 rounded-circle bg-secondary-subtle'>{approved.length}</div>
                            <Link to='../approved-visa' className='text-decoration-none'>
                            <span style={{fontSize: '12px', fontStyle: 'italic', cursor: 'pointer', color: 'GrayText'}}>View</span>
                            </Link>
                        </div>
                    </div>
                    <div className='d-flex justify-content-between align-items-center border-bottom py-3'>
                        <div>Pending</div>
                        <div className='d-flex gap-1 align-items-center'>
                            <div className='py-2 px-3 rounded-circle bg-secondary-subtle'>{pending.length}</div>
                            <Link to='../pending-visa' className='text-decoration-none text-secondary-subtle'>
                            <span style={{fontSize: '12px', fontStyle: 'italic', cursor: 'pointer', color: 'GrayText'}}>View</span>
                            </Link>
                        </div>
                    </div>
                    <div className='d-flex justify-content-between align-items-center border-bottom py-3'>
                        <div>Denied</div>
                        <div className='d-flex gap-1 align-items-center'>
                            <div className='py-2 px-3 rounded-circle bg-secondary-subtle'>{deniedVisa.length}</div>
                            <Link to='../denied-visa' className='text-decoration-none text-secondary-subtle'>
                            <span style={{fontSize: '12px', fontStyle: 'italic', cursor: 'pointer', color: 'GrayText'}}>View</span>
                            </Link>
                        </div>
                    </div>
                </div>
                <Link to='../admin/add_visa' className='text-dark text-decoration-none text-secondary-subtle'>
                    <div style={{background: '#f8f8f8', fontSize: '1rem', width: '320px'}} className='rounded-pill py-2 px-4 text-center mt-3 shadow'>
                        Create new visa destination
                    </div>
                    </Link>
            </div>
        </div>
    </>
  )
}

export default VisaDetails