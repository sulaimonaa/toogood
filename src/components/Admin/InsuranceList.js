import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';

const InsuranceList = () => {
    const [allInsur, setAllInsur] = useState([]);
    const token = localStorage.getItem("adminToken"); 
    const navigate = useNavigate();
    

    useEffect(() => {
        const token = localStorage.getItem("adminToken"); 
        if (!token) {
            console.warn("No admin token found, skipping API call.");
            return;
        }
        axios.get("https://toogood-1.onrender.com/insurance/all", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAllInsur(response.data))
        .catch(error => console.error("Error fetching approved visa:", error));

    }, []);
    const updatePayment = (visa_id, newPayStatus) => {
        axios.put(`https://toogood-1.onrender.com/admin/insurance-payment-update/${visa_id}`, { payment_status: newPayStatus }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            // Update the specific visa's payment status in the allVS array
            setAllInsur(prevVS => prevVS.map(visa => 
                visa.id === visa_id ? {...visa, payment_status: newPayStatus} : visa
            ));
        })
        .catch(error => console.error("Error updating status:", error));
    };
  return (
    <>
        <div className='container d-md-flex gap-2 flex-column'>
            <div className='col-12 col-md-12 overflow-scroll mb-4'>
                <h6>List of Insurance Applications</h6>
                <table className='w-100'>
                    <thead>
                        <tr style={{fontSize: '0.8rem'}}>
                       
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Applicant</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Contact Email</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Contact Phone</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Data Page</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Payment Status</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Update Payment</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allInsur.map((visa, index) => (
                            <tr key={index} className='p-2 mb-2' style={{fontSize: '0.8rem'}}>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.first_name} {visa.last_name}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.contact_email}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.phone_number}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.upload_signature}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.payment_status}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>
                                {visa.payment_status === 'Pending' && (
                                            <button 
                                                className='border-0 bg-primary rounded-pill text-white px-2 ms-3' 
                                                onClick={() => updatePayment(visa.id, "Paid")}
                                            >
                                                Change to Paid
                                            </button>
                                        )}
                                </td>
                                <td className='p-2 border-secondary-subtle border text-center'>
                                    <Link to={`../insurance-status/${visa.id}`} className='border-0 p-2 bg-primary text-white text-decoration-none rounded-pill'>
                                        Check
                                    </Link>
                                </td>
                            </tr>
                        ))
                        }
                    </tbody>
                </table>
            </div>
            <div className='spacer'></div>
                <div>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
                </div>
                <div className='spacer'></div>
        </div>
    </>
  )
}

export default InsuranceList