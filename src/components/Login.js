import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import Loading from "./Loading";

const Login = () => {
    const [agent_email, setEmail] = useState("");
    const [agent_password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [ loading, setLoading ] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post("https://toogood-1.onrender.com/agents/login", { agent_email, agent_password });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("agentId", response.data.id);
            navigate("/dashboard"); // Redirect to dashboard after login
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        {loading && <Loading message='Logging in as agent...'/> }
        <div className="container vw-100 vh-100 d-flex align-items-center justify-content-center flex-column gap-2">
            <div className="text-secondary fs-6 mb-4 text-center">
                <Link to='../' className="text-decoration-none text-secondary"><FaHome  size={25}/><h6 className="m-0">Back to Home</h6></Link>
            </div>
            <h2>Agent Login</h2>
            {error && <p className="error text-danger">{error}</p>}
            <form onSubmit={handleLogin} className="p-4 bg-white shadow rounded d-flex flex-column gap-2">
                <input className="border-0 bg-secondary-subtle rounded p-2 focus-0" type="email" placeholder="Email" value={agent_email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="border-0 bg-secondary-subtle rounded p-2 focus-0" type="password" placeholder="Password" value={agent_password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" className="border-0 rounded-pill p-2 bg-primary text-white">Login</button>
            </form>
            <div className="d-flex gap-2 mt-4 mb-2 align-items-center justify-content-center">
                <h6 className="text-dark m-0" style={{fontSize: '0.8rem'}}>Forgotten  password?</h6>
                <Link to='../reset-password' className="text-decoration-none font-italic text-danger" style={{fontSize: '0.8rem'}}>Reset password</Link>
                </div>
            <div className="d-flex gap-2 mb-2 align-items-center justify-content-center">
                <h6 className="text-dark m-0" style={{fontSize: '0.8rem'}}>Don't have an account?</h6>
                <Link to='../register' className="text-decoration-none font-italic" style={{fontSize: '0.8rem'}}>Register here</Link>
                </div>
        </div>
        </>
        
    );
};

export default Login;
