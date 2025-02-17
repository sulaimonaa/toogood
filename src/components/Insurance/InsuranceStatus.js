import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const InsuranceStatus = () => {
    const { id } = useParams();
    const [status, setStatus] = useState(null); 
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("adminToken"); 
    const navigate = useNavigate();

    useEffect(() => {
        if (!id || !token) return; 
        
        console.log("Fetching visa status for ID:", id);
        axios.get(`https://toogood-1.onrender.com/insurance/status/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            console.log("Insurance status response:", response.data);
            setStatus(response.data);
        })
        .catch(error => console.error("Error fetching approved insurance details:", error))
        .finally(() => setLoading(false)); 
        
    }, [id, token]);

    return (
        <>
            <div className='container-fluid'>
                <div className='spacer'></div>
                <div className='container'>
                    {loading ? ( 
                        <p>Loading insurance status...</p> 
                    ) : status ? (
                        <div className='d-flex flex-column gap-2'>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Insurance Application</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.visa_destination}
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Full Name</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.first_name} {status?.middle_name} {status?.last_name}
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
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Address</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.address} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Occupation</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.occupation} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Gender</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.gender} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Marital Status</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.marital_status} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Travel Type</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.travel_type} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Purpose of Travel</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.purpose_travel} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Other Reason(s)</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.other_reason} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Next of Kin</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.next_of_kin} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Address</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.next_of_kin_address} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Relationship</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.relationship} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Coverage Begin</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.coverage_begin} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Coverage End</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.coverage_end} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Staying Beyond 90days?</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.more_ninety} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Medical Condition</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.medical_condition} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>If yes, State</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.more_medical_condition} 
                                </div>
                            </div>
                            <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Where did hear from us?</div>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.heard_policy} 
                                </div>
                            </div>
                            {['upload_signature'].map((key) => (
                            status?.[key] && (
                                <div key={key} className='d-flex gap-0 align-items-center'>
                                    <div className='bg-dark text-white p-2 w-25'>{key.replace('_', ' ').toUpperCase()}</div>
                                    <div className='bg-secondary-subtle p-2 w-75'>
                                        <a href={`https://toogood-1.onrender.com/uploads/${status[key]}`} target='_blank' rel="noopener noreferrer" className='text-decoration-none'>
                                            View/Download
                                        </a>
                                    </div>
                                </div>
                            )
                        ))}
                        </div>
                    ) : (
                        <p>No insurance status found.</p> 
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

export default InsuranceStatus;
