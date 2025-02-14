import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

const ApprovedPermit = () => {
    const [approved, setApproved] = useState([]);
    const navigate = useNavigate(); 
    const token = localStorage.getItem("adminToken"); 

    useEffect(() => {

        axios.get("http://localhost:5000/permit/approved", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setApproved(response.data))
        .catch(error => console.error("Error fetching approved visa:", error));

    }, [token]);
  return (
    <>
        <div className='container'>
            <div className='spacer'></div>
            <div className='col-12 overflow-scroll mb-4'>
                <h6>List of Approved Permit</h6>
                <table className='w-100'>
                    <thead>
                        <tr style={{fontSize: '0.8rem'}}>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Permit</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Applicant</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Fee</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approved.map((visa, index) => (
                            <tr key={index} className='p-2 mb-2' style={{fontSize: '0.8rem'}}>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.visa_destination}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.first_name} {visa.last_name}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>&#x20A6;{Number(visa.visa_fee).toLocaleString()}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.payment_status}</td>
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
        </div>
    </>
  )
}

export default ApprovedPermit