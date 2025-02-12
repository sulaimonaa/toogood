import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import AgentDetails from "./AgentDetails";
import VisaDetails from "./VisaDetails";
import Accounting from "./Accounting";

const AdminDashboard = () => {
    const [isLogin, setLogin] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAdmin = async () => {

            const token = localStorage.getItem("adminToken");

            if (token) {
                setLogin(true);
            }else{
                setLogin(false);
                setTimeout(navigate("/admin/login"), 2000);
            }
        }

        verifyAdmin();

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setLogin(false);
        navigate("../admin/login");
    };

    return (
        <> < div className = "container-fluid" > 
                <div className="spacer"></div>
                <div className="container">
                    <div className="d-flex justify-content-between">
                    <h2 className="mb-4">Welcome to Admin Dashboard</h2>
                    {isLogin ? (<div onClick={handleLogout} style={{cursor: 'pointer'}}><IoMdLogOut size={30}/></div>) : (<div onClick={handleLogout} className='d-none'><IoMdLogOut size={30}/></div>)}
                    
                    </div>
                
                <p className="mb-4">You are accessing this page because you're an admin to the project owned by
                    toogood travels, you can perform a CRUD on visa, check & modify status, confirm
                    & modify payment status etc.
                </p>
                <AgentDetails />
                <div className="spacer"></div>
                <VisaDetails />
                <div className="spacer"></div>
                <Accounting />
                </div>
            </div>
</>
    )
};

export default AdminDashboard;
