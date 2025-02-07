import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAdmin = async () => {
            
            const token = localStorage.getItem("adminToken");
            console.log("Admin Token:", token);

            if (!token) {
                setTimeout(navigate("/admin/login"), 2000);
            }
        }

        verifyAdmin();
        
    }, [navigate]);

    return <h1>Welcome, Admin</h1>;
};

export default AdminDashboard;
