import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [agent_email, setEmail] = useState("");
    const [agent_password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://localhost:5000/agents/login", { agent_email, agent_password });
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard"); // Redirect to dashboard after login
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="container">
            <h2>Agent Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={agent_email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={agent_password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
