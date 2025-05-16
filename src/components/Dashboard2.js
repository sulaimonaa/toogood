import React, { useEffect } from "react";
import Nav1 from "./Nav/Nav1";
import Footer from "./Footer";
import { Link, useNavigate } from "react-router-dom";

const Dashboard2 = () => {
    
    const token = localStorage.getItem("token"); 
    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            <div>You need to login as agent to access page</div>
            setTimeout(navigate('../login'), 5000);
        }
        
    }, [token, navigate]);

    return (
        <>
            <div className="hero2 py-4">
            <Nav1 />
            </div>
            <div div className = 'container-fluid result-bg' > 
                <div className='container'>
                    <div className="max-w-6xl mx-auto p-6">
                        <div className="rounded-lg shadow-md p-6 mb-8 d-flex flex-column gap-3 align-items-center justify-content-center" style={{height: '16rem'}}>
                            <h1 className="text-3xl font-bold text-white mb-2 text-capitalize">Welcome to your dashboard</h1>
                            <div className="d-flex flex-wrap gap-4 align-items-start">
                                <Link to='/visa-agent-application'>
                                <div className="bg-light px-4 py-2 rounded" style={{height: '12rem'}}>
                                    Apply for Visa
                                </div>
                                </Link>
                                <Link to='permit-agent-application'>
                                <div className="bg-light px-4 py-2 rounded" style={{height: '12rem'}}>
                                    Apply for Permit
                                </div>
                                </Link>
                            </div>
                        </div>
                    </div>
            </div>
            </div>
        <Footer />
        </>
    );
};

export default Dashboard2;
