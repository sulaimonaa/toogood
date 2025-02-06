import React, { useEffect, useState } from 'react'
import Nav1 from '../Nav/Nav1'
import '../Home/Home.css'
import { LiaUserEditSolid } from "react-icons/lia";
import { Link } from 'react-router-dom';
import { MdOutlineFlightTakeoff } from "react-icons/md";
import { GiPassport } from "react-icons/gi";
import { GiPoliceOfficerHead } from "react-icons/gi";
import { FaCheckToSlot } from "react-icons/fa6";
import { BsFillSimFill } from "react-icons/bs";
import { FaHotel } from "react-icons/fa";
import { HiMiniBuildingOffice2 } from "react-icons/hi2";
import { MdSecurity } from "react-icons/md";
import { MdTravelExplore } from "react-icons/md";
import PopularDeals from '../Popular/PopularDeals';
import Footer from '../Footer';
import { FaPersonWalkingDashedLineArrowRight } from "react-icons/fa6";

const Home = () => {
  const [isLogin, setLogin] = useState(false);
    const [agentImage, setAgentImage] = useState(null);

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

  return (
    <>
    <Nav1 />
    <div className='hero container-fluid'>
      <h2 className='fs-4 text-center text-white'>Your travel starts here!</h2>
      <div className='container relative'>
        <div className='w-100 absolute top-0'>
          <div className='d-flex flex-column bg-light-subtle'>
            <div className='d-flex align-items-center justify-content-center gap-1'>
            <Link to='/flight' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l1'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <MdOutlineFlightTakeoff />
                Flight</div>
                </Link>
                <Link to='/check-visa' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l2'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <GiPassport />
                Visa Check</div>
                </Link>
                <Link to='/permit' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l3'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <FaCheckToSlot />
                Permit</div>
                </Link>
            </div>
            
            <div className='d-flex align-items-center justify-content-center gap-1'>
            <Link to='/e-visa' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l4'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <GiPoliceOfficerHead />
                E-visa</div>
                </Link>
                <Link to='/e-sim' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l5'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <BsFillSimFill />
                E-sim</div>
                </Link>
                <Link to='/hotel' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l6'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <FaHotel />
                Hotel Booking</div>
                </Link>
            </div>
            
            <div className='d-flex align-items-center justify-content-center gap-1'>
            <Link to='/embassy' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l7'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <HiMiniBuildingOffice2 />
                Embassy</div>
                </Link>
              <Link to='/insurance' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l8'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <MdSecurity />
                Insurance</div>
                </Link>
              <Link to='/travel-itinerary' className='p-3 bg-white mb-1 col-4 shadow text-dark text-decoration-none l9'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <MdTravelExplore />
                Travel Itinerary</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className='edit-container'>
    <div className='edit-profile container d-flex justify-content-between align-items-center rounded-pill p-2 bg-danger-subtle'>
    {isLogin && agentImage ? (
                        <img src={agentImage} alt="Agent Profile" className="profile-img" />
                    ) : (
                      <FaPersonWalkingDashedLineArrowRight size={30} />
                    )}
    {isLogin ? (
      <Link to='/update-profile' className='text-dark'><LiaUserEditSolid size={30} /></Link>
    ) : (
      <div className='text-white-50' disabled><LiaUserEditSolid size={30} /></div>
    )}
    </div>
    </div>
    <PopularDeals />
    <Footer />
    </>
  )
}

export default Home