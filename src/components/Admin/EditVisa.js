import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../Loading';

const EditVisa = () => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        visa_id: "",
        destination: "",
        visa_excerpt: "",
        visa_description: "",
        visa_price: "",
        visa_agent_price: "",
        service_charge: "",
        process_time: "",
        process_type: "",
        available_country: "",
        visa_img: null,           // added: file when user selects a new image
        visa_img_url: "",         // added: existing image URL from server
    });

    useEffect(() => {
        const fetchVisaDetails = async () => {
            try {
                const token = localStorage.getItem("adminToken");

                if (!token) {
                    setMessage("Unauthorized: Please log in.");
                    setLoading(false);
                    setTimeout(() => navigate('/admin/login'), 2000);
                    return;
                }

                if (!id) {
                    setMessage("No ID found");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`https://toogood-1.onrender.com/admin/destinations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.data) {
                    throw new Error("Invalid response from server");
                }

                setFormData({
                    visa_id: response.data.id,
                    destination: response.data.destination || "",
                    visa_excerpt: response.data.visa_excerpt || "",
                    visa_description: response.data.visa_description || "",
                    visa_price: response.data.visa_price || "",
                    visa_agent_price: response.data.visa_agent_price || "",
                    service_charge: response.data.service_charge || "",
                    process_time: response.data.process_time || "",
                    process_type: response.data.process_type || "",
                    available_country: response.data.available_country || "",
                    visa_img: null,                          // keep null by default
                    visa_img_url: response.data.visa_img || "" // store existing url for preview/submit
                });

                setLoading(false);
            } catch (error) {
                console.error("Error fetching visa details:", error);
                setMessage(error.response?.data?.message || "Error fetching visa details");
                setLoading(false);
            }
        };

        fetchVisaDetails();
    }, [navigate, id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        setFormData({ ...formData, visa_img: file });
    };


    const handleUpdateVisa = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("adminToken");

            if (!token) {
                setError("Unauthorized: Please log in.");
                return;
            }

            const data = new FormData();
            data.append('visa_id', formData.visa_id);
            data.append('destination', formData.destination);
            data.append('visa_excerpt', formData.visa_excerpt);
            data.append('visa_description', formData.visa_description);
            data.append('visa_price', formData.visa_price);
            data.append('visa_agent_price', formData.visa_agent_price);
            data.append('service_charge', formData.service_charge);
            data.append('process_time', formData.process_time);
            data.append('process_type', formData.process_type);
            data.append('available_country', formData.available_country);

            if (formData.visa_img) {
                data.append('visa_img', formData.visa_img);
            } else if (formData.visa_img_url) {
                data.append('visa_img', formData.visa_img_url);
            }

            const response = await axios.put(
                "https://toogood-1.onrender.com/visa/update",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // let axios set the Content-Type boundary for FormData
                    }
                }
            );

            setSuccess(response.data.success || "Visa updated successfully");
            setTimeout(() => navigate("../admin/dashboard"), 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update visa destination");
        }
    };

    if (loading) return <Loading />;

    return (
        <>
            <div className='container-fluid py-4'>
                <div className='spacer'></div>
                <div className='container vw-100 vh-100 d-flex align-items-center justify-content-center flex-column gap-2'>
                    <h2>Edit Visa Destination</h2>
                    {message && <p className="text-center text-danger">{message}</p>}
                    {error && <p className="error text-danger">{error}</p>}
                    {success && <p className="success text-success">{success}</p>}

                    <form onSubmit={handleUpdateVisa} className='p-4 shadow rounded d-flex flex-column gap-2 w-100'>
                        <div className='d-flex flex-column gap-1'>
                            <label>Visa Destination</label>
                            <input type='text' name='destination' value={formData.destination} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Visa Entry</label>
                            <input type='text' name='visa_excerpt' value={formData.visa_excerpt} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Visa Description</label>
                            <textarea name='visa_description' value={formData.visa_description} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' rows='5' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Visa Price</label>
                            <input type='number' name='visa_price' value={Number(formData.visa_price)} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Visa Agent Price</label>
                            <input type='number' name='visa_agent_price' value={Number(formData.visa_agent_price)} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Service Charge</label>
                            <input type='number' name='service_charge' value={Number(formData.service_charge)} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Processing Time</label>
                            <input type='text' name='process_time' value={formData.process_time} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Processing Type</label>
                            <input type='text' name='process_type' value={formData.process_type} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Available Countries - separate with |</label>
                            <input type='text' name='available_country' value={formData.available_country} onChange={handleChange} className='border-0 bg-secondary-subtle rounded p-2' />
                        </div>
                        <div className='d-flex flex-column gap-1'>
                            <label>Visa Image</label>
                            <input type='file' name='visa_img' accept='image/*' onChange={handleFileChange} className='border-0 bg-secondary-subtle rounded p-2' />
                            {formData.visa_img && (
                                <img src={URL.createObjectURL(formData.visa_img)} alt="preview" style={{ maxWidth: 200, marginTop: 8 }} />
                            )}
                            {!formData.visa_img && formData.visa_img_url && (
                                <img src={formData.visa_img_url} alt="current" style={{ maxWidth: 200, marginTop: 8 }} />
                            )}
                        </div>
                        <input type='hidden' name='visa_id' value={formData.visa_id} />
                        <button type="submit" disabled={loading} className="border-0 rounded-pill p-2 bg-primary text-white mt-3">Update Visa Destination</button>
                    </form>
                </div>
                <div className='spacer'></div>
            </div>
        </>
    );
};

export default EditVisa;
