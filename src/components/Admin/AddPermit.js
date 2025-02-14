import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AddPermit = () => {
    
    const [formData, setFormData] = useState({
        destination: "",
        visa_price: "",
        available_country: "",
    })

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const navigate = useNavigate()

    useEffect(() => {
        const verifyAdmin = async () => {
            const token = localStorage.getItem("adminToken");
    
            if (!token) {
                setMessage("Unauthorized: Please log in.");
                setLoading(false);
                setTimeout(() => navigate('/admin/login'), 2000);
                return;
            }
    
            setTimeout(() => setLoading(false), 2000);
        };
    
        verifyAdmin();
    }, [navigate]);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleAddVisa = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
    
        try {
            const token = localStorage.getItem("adminToken");
    
            const response = await axios.post(
                "https://toogood-1.onrender.com/permit/add_permit",
                formData,
                {
                    headers: { "Authorization": `Bearer ${token}` }
                }
            );
    
            setSuccess(response.data.success);
            setTimeout(() => navigate("../admin/dashboard"), 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to add permit destination");
        }
    };
    

    if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className='container-fluid py-4'>
        <div className='container vw-100 vh-100 d-flex align-items-center justify-content-center flex-column gap-2'>
             <h2>Add Permit Destination</h2>
            {message && <p className="text-center text-red-500">{message}</p>}
            {error && <p className="error text-danger">{error}</p>}
            {success && <p className="success text-success">{success}</p>}
            <form onSubmit={handleAddVisa} className='p-4 shadow rounded d-flex flex-column gap-2 w-100'>
                <div className='d-flex flex-column gap-1'>
                    <label>Permit Destination</label>
                    <input type='text' name='destination' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Permit Price</label>
                    <input type='number' name='visa_price' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Available Passport Holders Countries - separate with |</label>
                    <input type='text' name='available_country' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <button type="submit" className="border-0 rounded-pill p-2 bg-primary text-white mt-3">Add Permit</button>
            </form>
        </div>
    </div>
  )
}

export default AddPermit