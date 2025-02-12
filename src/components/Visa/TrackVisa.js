import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TrackVisa = () => {
    const [trackingID, setTrackingId] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!trackingID) {
            alert("Please enter a tracking ID");
            return;
        }
    
        setLoading(true);
        
        axios.post("http://localhost:5000/visa/track-visa", { tracking_id: trackingID })
            .then(response => {
                setStatus(response.data);
            })
            .catch(error => console.error("Error fetching visa details:", error))
            .finally(() => setLoading(false));
    };

    return (
        <div className='container-fluid'>
            <div className='spacer'></div>
            <div className='container'>
            <form onSubmit={handleSubmit} className='mb-4'>
                <div className='d-flex flex-column gap-2'>
                    <h4 className='text-center'>Enter Tracking Number</h4>
                    <input
                        className='p-2 rounded-pill bg-secondary-subtle'
                        name='tracking_id'
                        value={trackingID}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder='Enter Tracking ID'
                    />
                    <input type='submit' className='bg-primary border-0 text-white rounded-pill shadow p-2' value='Track Visa' />
                </div>
            </form>
            </div>
            <div className='container'>
                {loading ? ( 
                    <p>Loading visa status...</p> 
                ) : status ? (
                    <div className='d-flex flex-column gap-2'>
                        <div className='d-flex gap-0 align-items-center'>
                                <div className='bg-dark text-white p-2 w-25'>Visa Application</div>
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
                            <div className='d-flex gap-0 align-items-center'>
                            <div className='bg-dark text-white p-2 w-25'>Payment Status</div>
                            <div className='bg-secondary-subtle p-2 w-75'>{status?.payment_status}</div>
                        </div>
                            <div className='d-flex gap-0 align-items-center'>
                            <div className='bg-dark text-white p-2 w-25'>Visa Fee</div>
                            <div className='bg-secondary-subtle p-2 w-75'>{status?.visa_fee}</div>
                        </div>
                        <div className='d-flex gap-0 align-items-center'>
                            <div className='bg-dark text-white p-2 w-25'>Visa Status</div>
                            <div className='bg-secondary-subtle p-2 w-75'>{status?.visa_status}</div>
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
                    </div>
                ) : (
                    <p>No status available, please enter a valid tracking ID</p>
                )}
            </div>

            <div className='spacer'></div>
            <div className='container'>
                <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
            </div>
        </div>
    );
};

export default TrackVisa;
