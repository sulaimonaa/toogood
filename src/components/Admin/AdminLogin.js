import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); 

        try {
            const response = await axios.post("https://toogood-1.onrender.com/admin/login", {
                admin_email: email,
                admin_password: password
            });

            localStorage.setItem("adminToken", response.data.token);
            navigate("../admin/dashboard"); 
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="container-fluid">
            <div className="vw-100 vh-100 p-0 d-flex align-items-center justify-content-center flex-column gap-2">
                <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded d-flex flex-column gap-2">
                    <div className="d-flex flex-column gap-1">
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-0 bg-secondary-subtle rounded p-2 focus-0"
                            required
                        />
                    </div>
                    <div className="d-flex flex-column gap-1">
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-0 bg-secondary-subtle rounded p-2 focus-0"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="border-0 rounded-pill p-2 bg-primary text-white"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
