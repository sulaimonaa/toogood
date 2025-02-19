import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AddVisa = () => {
    
    const [formData, setFormData] = useState({
        destination: "",
        visa_excerpt: "",
        visa_description: "",
        visa_price: "",
        visa_agent_price: "",
        process_time: "", 
        process_type: "",
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
                "https://toogood-1.onrender.com/visa/add_visa",
                formData,
                {
                    headers: { "Authorization": `Bearer ${token}` }
                }
            );
    
            setSuccess(response.data.success);
            setTimeout(() => navigate("../admin/dashboard"), 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to add visa destination");
        }
    };
    

    if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className='container-fluid py-4'>
        <div className='container vw-100 vh-100 d-flex align-items-center justify-content-center flex-column gap-2'>
             <h2>Add Visa Destination</h2>
            {message && <p className="text-center text-red-500">{message}</p>}
            {error && <p className="error text-danger">{error}</p>}
            {success && <p className="success text-success">{success}</p>}
            <form onSubmit={handleAddVisa} className='p-4 shadow rounded d-flex flex-column gap-2 w-100'>
                <div className='d-flex flex-column gap-1'>
                    <label>Visa Destination</label>
                    <input type='text' name='destination' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Visa Entry</label>
                    <input type='text' name='visa_excerpt' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Visa Description</label>
                    <textarea type='text' name='visa_description' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' rows='5' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Visa Price</label>
                    <input type='number' name='visa_price' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Visa Agent Price</label>
                    <input type='number' name='visa_agent_price' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Processing Time</label>
                    <input type='text' name='process_time' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Processing Type</label>
                    <input type='text' name='process_type' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <div className='d-flex flex-column gap-1'>
                    <label>Available Countries - separate with |</label>
                    <input type='text' name='available_country' onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2 focus-0 rounded' />
                </div>
                <button type="submit" disabled={loading} className="border-0 rounded-pill p-2 bg-primary text-white mt-3">Add Visa</button>
            </form>
        </div>
    </div>
  )
}

export default AddVisa