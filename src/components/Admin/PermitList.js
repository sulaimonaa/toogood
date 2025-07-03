import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { FaEye, FaTrash } from 'react-icons/fa6'

const PermitList = () => {
    const [allVisa, setAllVisa] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken"); 

    useEffect(() => {
        axios.get("https://toogood-1.onrender.com/permit/all", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAllVisa(response.data))
        .catch(error => console.error("Error fetching approved agents:", error));
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
        <div className='container'>
            <div className='spacer'></div>
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
                                    <Link to={`../permit-status/${visa.id}`} className='border-0 p-2 bg-primary text-white text-decoration-none rounded-pill'>
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
                <div className='spacer'></div>
                <div>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
                </div>
        </div>
    </>
  )
}

export default PermitList