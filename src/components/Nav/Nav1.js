import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import { IoMdLogOut } from "react-icons/io";
import Logo from '../../assets/images/tgt.png';
import '../Nav/Nav.css';


const Nav1 = () => {
    const [isLogin, setLogin] = useState(false);
    const [agentImage, setAgentImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setLogin(true);

            // Fetch agent profile image
            const fetchAgentImage = async () => {
                try {
                    const response = await fetch("http://localhost:5000/agents/agent-profile", {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    const data = await response.json();
                    if (data.agent_image) {
                        setAgentImage(`http://localhost:5000${data.agent_image}`); 
                    } else {
                        setAgentImage(null);
                    }

                } catch (error) {
                    console.error("Error fetching agent image:", error);
                }
            };

            fetchAgentImage();
        } else {
            setLogin(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setLogin(false);
        navigate("/login");
    };

    return (
        <>
            <div className='w-100 py-2 px-2 px-md-4'>
                <div className='w-100 mx-auto d-flex justify-content-between align-items-center bg-dark-subtle rounded-pill p-2'>
                    {/* Show Agent Image if Logged In, Otherwise Show Dummy Image */}
                    <div className='d-flex items-center w-10 h-10 rounded-full border-blue-900 border-2'>
                    {isLogin && agentImage ? (
                        <img src={agentImage} alt="Agent Profile" className="profile-img" />
                    ) : (
                        <FaUserCircle size={30} />
                    )}
                    </div>
                    <div className='brand'>
                        <Link to="../">
                        <img src={Logo} alt='logo' className='w-100'/>
                        </Link>
                    </div>
                    <div className='d-flex gap-2 items-center'>
                        {isLogin ? (
                            <div onClick={handleLogout} style={{cursor: 'pointer'}}><IoMdLogOut size={30}/></div>
                        ) : (
                            <Link to='/login' className='text-decoration-none text-dark fs-6'><IoMdLogIn size={30}/></Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Nav1;
