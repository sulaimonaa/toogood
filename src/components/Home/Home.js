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
import Slider from '../Slider';

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
                    const response = await fetch("https://toogood-1.onrender.com/agents/agent-profile", {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    const data = await response.json();
                    if (data.agent_image) {
                      setAgentImage(`https://toogood-1.onrender.com${data.agent_image}`); 
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
    <Slider />
    <div className='search-container' style={{position: 'absolute', zIndex: '1', top: '5rem', width: '100%'}}>
    <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-3' style={{height: '100vh'}}>
      <h2 className='fs-4 text-center text-white'>Your travel starts here!</h2>
      <div className='container relative p-0 px-md-2'>
        <div className='w-100 absolute top-0'>
          <div className='d-flex flex-column service-list-container'>
          <div className='d-flex align-items-center justify-content-center gap-1'>
            <Link to='/evisa' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l4'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <GiPoliceOfficerHead />
                E-visa</div>
                </Link>
                <Link to='/track-visa' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l2'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <GiPassport />
                Visa Status</div>
                </Link>
                <Link to='/epermit' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l3'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <FaCheckToSlot />
                Permit</div>
                </Link>
            </div>
            
            <div className='d-flex align-items-center justify-content-center gap-1'>
            <Link to='/flight' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l1'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <MdOutlineFlightTakeoff />
                Flight</div>
                </Link>
                <Link to='https://toogoodtravels.com/hotels' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l6'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <FaHotel />
                Hotel Booking</div>
                </Link>
                <Link to='/e-sim' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l5'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <BsFillSimFill />
                E-sim</div>
                </Link>
            </div>
            
            <div className='d-flex align-items-center justify-content-center gap-1'>
            <Link to='https://toogoodtravels.com/tours/search?txtSearch=&type=&checkin=10%2F05%2F2025&adults=1&module_type=&slug=&searching=&modType=' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l7'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <HiMiniBuildingOffice2 />
                Packages</div>
                </Link>
              <Link to='/insurance' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l8'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <MdSecurity />
                Insurance</div>
                </Link>
              <Link to='/travel-itinerary' className='service-list p-2 p-md-3 mb-1 d-flex justify-content-center align-items-center shadow text-white fw-bold text-decoration-none l9'>
              <div className='d-flex flex-column align-items-center gap-2'>
                <MdTravelExplore />
                Visa Support</div>
              </Link>
            </div>
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