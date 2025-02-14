import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        admin_name: "",
        admin_email: "",
        admin_password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await axios.post("https://toogood-1.onrender.com/admin/register", formData);
            setSuccess(response.data.success);
            setTimeout(() => navigate("../admin/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="container vw-100 vh-100 d-flex align-items-center justify-content-center flex-column gap-2">
            <h2>Agent Registration</h2>
            {error && <p className="error text-danger">{error}</p>}
            {success && <p className="success text-success">{success}</p>}
            <form onSubmit={handleRegister} className="p-4 bg-white shadow rounded d-flex flex-column gap-2">
                <input type="text" className="border-0 bg-secondary-subtle rounded p-2 focus-0" name="admin_name" placeholder="Name" onChange={handleChange} required />
                <input type="email" className="border-0 bg-secondary-subtle rounded p-2 focus-0" name="admin_email" placeholder="Email" onChange={handleChange} required />
                <input type="password" className="border-0 bg-secondary-subtle rounded p-2 focus-0" name="admin_password" placeholder="Password" onChange={handleChange} required />
                <button type="submit" className="border-0 rounded-pill p-2 bg-primary text-white">Register</button>
            </form>
        </div>
    );
};

export default AdminRegister;
