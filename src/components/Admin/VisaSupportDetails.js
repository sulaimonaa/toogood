import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';

const VisaSupportDetails = () => {
    const [allVS, setAllVS] = useState([]);
    const [status, setStatus] = useState(null); 
    const token = localStorage.getItem("adminToken"); 
    

    useEffect(() => {
        const token = localStorage.getItem("adminToken"); 
        if (!token) {
            console.warn("No admin token found, skipping API call.");
            return;
        }
        axios.get("https://toogood-1.onrender.com/bookings/all", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAllVS(response.data))
        .catch(error => console.error("Error fetching approved visa:", error));

    }, []);

    const updatePayment = (visa_id, newPayStatus) => {
        axios.put(`https://toogood-1.onrender.com/admin/visa-payment-update/${visa_id}`, { status: newPayStatus }, {
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
  return (
    <>
        <div className='container d-md-flex gap-2'>
            <div className='col-12 col-md-12 overflow-scroll mb-4'>
                <h6>List of Insurance Applications</h6>
                <table className='w-100'>
                    <thead>
                        <tr style={{fontSize: '0.8rem'}}>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Name</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Contact Email</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Contact Phone</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Payment Status</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Amount to Pay</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allVS.map((visa, index) => (
                            <tr key={index} className='p-2 mb-2' style={{fontSize: '0.8rem'}}>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.first_name} {visa.last_name}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.email}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.phone_number}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.payment_status}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.amount_to_pay}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>
                                <div className='bg-secondary-subtle p-2 w-75'>
                                    {status?.payment_status} {(status?.payment_status === 'Pending') ? (<button className='border-0 bg-primary rounded-pill text-white px-2 ms-3' onClick={() => updatePayment(status?.visa.id, "Paid")}>Change to Paid</button>) : ('')}
                                </div>
                                </td>
                            </tr>
                        ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    </>
  )
}

export default VisaSupportDetails