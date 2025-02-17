import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import AgentDetails from "./AgentDetails";
import VisaDetails from "./VisaDetails";
import Accounting from "./Accounting";
import PermitDetails from "./PermitDetails";
import InsuranceDetails from "./InsuranceDetails";

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
    const [ showInsur, setShowInsur] = useState(false);
    const [ showBtn, setShowBtn ] = useState(true);
    const showInsurance = () => {
        setShowInsur(true)
        setShowBtn(false)
    }
    const closeIns = () => {
        setShowInsur(false)
        setShowBtn(true)
    }

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
                <PermitDetails />
                <div className="spacer"></div>
                {
                    showBtn ? (
                        <div className="bg-secondary-subtle p-2 rounded-pill w-50 text-center" onClick={showInsurance} style={{cursor: 'pointer'}}>Check Insurance Applications</div>
                    ) : ('')
                }
                <div className="spacer"></div>
                    {showInsur ? (
                        <div>
                            <InsuranceDetails />
                            <div className="bg-danger rounded-pill text-white p-2 w-50 mt-3 mb-3 text-center" onClick={closeIns} style={{cursor: 'pointer'}}>Close</div>
                        </div>
                    ) : ('')}
                <Accounting />
                </div>
            </div>
</>
    )
};

export default AdminDashboard;
