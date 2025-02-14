import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PermitStatus = () => {
    const { id } = useParams();
    const [status, setStatus] = useState(null); 
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("adminToken"); 
    const navigate = useNavigate();

    useEffect(() => {
        if (!id || !token) return; 
        
        console.log("Fetching visa status for ID:", id);
        axios.get(`http://localhost:5000/permit/status/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            console.log("Visa status response:", response.data);
            setStatus(response.data);
        })
        .catch(error => console.error("Error fetching approved permit details:", error))
        .finally(() => setLoading(false)); 
        
    }, [id, token]);

    const updatePayment = (visa_id, newPayStatus) => {
        axios.put(`http://localhost:5000/admin/permit-payment-update/${visa_id}`, { status: newPayStatus }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setStatus(prevStatus => ({
                ...prevStatus, 
                payment_status: newPayStatus
            }));
        })
        .catch(error => console.error("Error updating status:", error));
    };

    const visaStatus = (visa_id, newStatus) => {
        axios.put(`http://localhost:5000/admin/permit-update/${visa_id}`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setStatus(prevStatus => ({
                ...prevStatus, 
                visa_status: newStatus
            }));
        })
        .catch(error => console.error("Error updating status:", error));
    };

    return (
        <>
            <div className='container-fluid'>
                <div className='spacer'></div>
                <div className='container'>
                    {loading ? ( 
                        <p>Loading permit status...</p> 
                    ) : status ? (
                        <div className='d-flex flex-column gap-2'>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Permit Application</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.visa_destination}
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Full Name</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.first_name} {status?.last_name}
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Contact Number</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.phone_number} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Email</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.contact_email} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Date of Birth</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.date_of_birth ? new Date(status.date_of_birth).toLocaleDateString() : "N/A"} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Passport Number</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.passport_number} 
                                </div>
                            </div>
                            {['data_page', 'passport_photograph', 'utility_bill', 'supporting_document', 'other_document'].map((key) => (
                            status?.[key] && (
                                <div key={key} className='d-flex gap-0 align-items-center'>
                                    <div className='bg-dark text-white p-2 w-25'>{key.replace('_', ' ').toUpperCase()}</div>
                                    <div className='bg-secondary-subtle p-2 w-75'>
                                        <a href={`http://localhost:5000/uploads/${status[key]}`} target='_blank' rel="noopener noreferrer" className='text-decoration-none'>
                                            View/Download
                                        </a>
                                    </div>
                                </div>
                            )
                        ))}
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Payment Status</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.payment_status} {(status?.payment_status === 'Not Paid') ? (<button className='border-0 bg-primary rounded-pill text-white px-2 ms-3' onClick={() => updatePayment(status?.id, "Paid")}>Change to Paid</button>) : ('')}
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Visa Fee</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                &#x20A6;{Number(status?.visa_fee).toLocaleString()}
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Visa Status</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.visa_status} 
                                </div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                {(status?.visa_status === 'Pending') ? (<div className='d-flex gap-2'><button className='border-0 bg-success rounded-pill text-white px-2 ms-3' onClick={() => visaStatus(status?.id, "Approved")}>Change to Approved</button><button className='border-0 bg-danger rounded-pill text-white px-2 ms-3' onClick={() => visaStatus(status?.id, "Denied")}>Change to Denied</button></div>) : ('')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No visa status found.</p> 
                    )}
                    <div className='spacer'></div>
                    <div>
                        <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PermitStatus;
