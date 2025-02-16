import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import Loading from "./Loading";

const Register = () => {
    const [formData, setFormData] = useState({
        agent_name: "",
        agent_phone: "",
        agent_email: "",
        agent_password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [ loading, setLoading ] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true)
        setError("");
        setSuccess("");

        try {
            const response = await axios.post("https://toogood-1.onrender.com/agents/register", formData);
            setSuccess(response.data.success);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Loading message='Registering as agent...'/> }
            <div className="container vw-100 vh-100 d-flex align-items-center justify-content-center flex-column gap-2">
            <div className="text-secondary fs-6 mb-4 text-center">
                <Link to='../' className="text-decoration-none text-secondary"><FaHome  size={25}/><h6 className="m-0">Back to Home</h6></Link>
            </div>
            <h2>Agent Registration</h2>
            {error && <p className="error text-danger">{error}</p>}
            {success && <p className="success text-success">{success}</p>}
            <form onSubmit={handleRegister} className="p-4 bg-white shadow rounded d-flex flex-column gap-2">
                <input type="text" className="border-0 bg-secondary-subtle rounded p-2 focus-0" name="agent_name" placeholder="Full Name" onChange={handleChange} required />
                <input type="text" className="border-0 bg-secondary-subtle rounded p-2 focus-0" name="agent_phone" placeholder="Phone Number" onChange={handleChange} required />
                <input type="email" className="border-0 bg-secondary-subtle rounded p-2 focus-0" name="agent_email" placeholder="Email" onChange={handleChange} required />
                <input type="password" className="border-0 bg-secondary-subtle rounded p-2 focus-0" name="agent_password" placeholder="Password" onChange={handleChange} required />
                <button type="submit" className="border-0 rounded-pill p-2 bg-primary text-white">Register</button>
            </form>
        </div>
        </>
    );
};

export default Register;
