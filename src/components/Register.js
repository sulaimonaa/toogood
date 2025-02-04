import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [formData, setFormData] = useState({
        agent_name: "",
        agent_phone: "",
        agent_email: "",
        agent_password: "",
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
            const response = await axios.post("http://localhost:5000/agents/register", formData);
            setSuccess(response.data.success);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="container">
            <h2>Agent Registration</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <form onSubmit={handleRegister}>
                <input type="text" name="agent_name" placeholder="Full Name" onChange={handleChange} required />
                <input type="text" name="agent_phone" placeholder="Phone Number" onChange={handleChange} required />
                <input type="email" name="agent_email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="agent_password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
