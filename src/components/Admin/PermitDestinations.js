import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

const PermitDestinations = () => {
    const [allVisa, setAllVisa] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    useEffect(() => {
        if (!token) {
            setIsAuthenticated(false);
            navigate('../admin/login', { replace: true });
        }
    }, [token, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchDestinations = async () => {
                try {
                    const response = await fetch("https://toogood-1.onrender.com/admin/permit", {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (!response.ok) {
                        throw new Error("Failed to fetch permit destinations");
                    }
                    const data = await response.json();
                    setAllVisa(data.data);
                } catch (error) {
                    <p>Unable to fetch destinations</p>
                }
            }

            fetchDestinations();
        }   

            
    }, [token, isAuthenticated]);

    const handleDelete = (visaId) => {
        if (!window.confirm("Are you sure you want to delete this permit destination?")) return;

        axios.delete(`https://toogood-1.onrender.com/admin/delete-permit/${visaId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setAllVisa(allVisa.filter(visa => visa.id !== visaId));
        })
        .catch(error => console.error("Error deleting permit destination:", error));
    };
  return (
    <>
        <div className='container'>
            <div className='spacer'></div>
                <h6>List of Permit Destinations</h6>
                <table className='w-100'>
                    <thead>
                        <tr style={{fontSize: '0.8rem'}}>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Permit</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Permit Description</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Permit Price</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Available Countries</th>
                        <th className="text-center border border-secondary-subtle bg-dark text-white p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allVisa.map((visa, index) => (
                            <tr key={index} className='p-2 mb-2' style={{fontSize: '0.8rem'}}>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.destination}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.visa_description}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>&#x20A6;{Number(visa.visa_price).toLocaleString()}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>{visa.available_country}</td>
                                <td className='p-2 border-secondary-subtle border text-center'>
                                    <Link to={`../admin/permit-update/${visa.id}`} className='border-0 p-2 bg-primary text-white text-decoration-none rounded-pill'>
                                       Edit
                                    </Link>
                                    <button onClick={() => handleDelete(visa.id)} className='border-0 p-2 bg-danger mt-2 text-white text-decoration-none rounded-pill'>
                                        Delete
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

export default PermitDestinations