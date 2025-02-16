import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const [agentEmail, setAgentEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post("https://toogood-1.onrender.com/agents/reset-password", {
                agent_email: agentEmail,
                new_password: newPassword,
            });

            setMessage(response.data.success || "Password reset successful!");
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 vw-100 bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
                
                {message && <p className="text-center text-sm text-red-500 mb-2">{message}</p>}

                <form onSubmit={handleResetPassword}>
                    <div className="mb-4 d-flex flex-column gap-1">
                        <label className="block text-gray-600 text-sm mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-100 border-0 bg-secondary-subtle px-3 py-2 border rounded-pill focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            value={agentEmail}
                            onChange={(e) => setAgentEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4  d-flex flex-column gap-1">
                        <label className="block text-gray-600 text-sm mb-1">New Password</label>
                        <input 
                            type="password" 
                            className="w-100 border-0 bg-secondary-subtle px-3 py-2 border rounded-pill focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-100 border-0 bg-primary text-white py-2 rounded-pill hover:bg-blue-600 transition"
                        disabled={loading}
                    >
                        {loading ? "Resetting password..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
