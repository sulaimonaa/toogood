import React, { useState, useEffect } from "react";
import Nav1 from "./Nav/Nav1";
import Footer from "./Footer";
import VisaInfo from "./Visa/VisaInfo";
import { Link, useNavigate } from "react-router-dom";
import Loading from "./Loading";

const Visa = () => {
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const token = localStorage.getItem("token"); 
    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            <div>You need to login as agent to access page</div>
            setTimeout(navigate('../login'), 5000);
        }
        const fetchDestinations = async () => {
            try {
                const response = await fetch("https://toogood-1.onrender.com/visa/destinations");
                if (!response.ok) {
                    throw new Error("Failed to fetch visa destinations");
                }
                const data = await response.json();
                setDestinations(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, [token, navigate]);

    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = destinations.filter((destination) =>
            destination.destination.toLowerCase().includes(term) ||
            destination.visa_agent_price.toString().includes(term)
        );

        setFilteredDestinations(filtered);
    };

    if (loading) return <Loading message="Loading visa destinations..."/>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <div className="hero2 py-4">
                <Nav1 />
            </div>
            <div className="container-fluid rounded-top-4 bg-white self-section">
             <div className="spacer"></div>
                <div className="container mb-3 d-flex gap-3 align-items-center">
                    <h6 className="text-secondary">Need a Permit?</h6>
                    <Link to="../permit-agent" className="bg-secondary-subtle py-2 px-4 rounded-pill text-decoration-none fw-bold text-dark">Apply here</Link>
                </div>
                <div className="container pt-4">
                    <h2 className="text-xl fw-bold mb-4" style={{fontSize: '1.2rem'}}>Apply for eVisa in a few clicks</h2>
                    <VisaInfo />
                </div>
                <div className="spacer"></div>
                <div className="container">
                    <input
                        type="text"
                        placeholder="Search visa destinations..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-100 px-3 py-2 mb-4 border border-gray-300 rounded-pill bg-dark-subtle"
                    />
                    
                    {/* Show results only if the user has typed something */}
                    {searchTerm && filteredDestinations.length > 0 ? (
                        filteredDestinations.map((destination, index) => (
                            <div key={index} className="p-4 d-flex flex-column rounded shadow bg-white mb-4">
                                <div className="fw-bold mb-2">{destination.destination}</div>
                                <div className="fw-bold mb-2 d-flex justify-content-between">
                                    <div>{destination.visa_excerpt}</div>
                                    <div className="d-flex flex-column">
                                        <div className="text-dark fw-bold" style={{fontSize: '0.5rem'}}>available to this passport holders:</div>
                                        <div className="text-secondary" style={{fontSize: '0.7rem', fontStyle: 'italic'}}>{destination.available_country}</div>
                                    </div>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex flex-column">
                                        <span className="font-italics text-secondary-subtle" style={{fontSize: '0.6rem', fontStyle: 'italic'}}>visa processing fee</span>
                                        <span className="fw-bold text-dark" style={{fontSize: '1.1rem'}}> &#x20A6;{Number(destination.visa_agent_price).toLocaleString()}</span>
                                    </div>
                                    <Link to={`/visa-agent/${destination.id}`} className="text-decoration-none">
                                        <div className="border-0 py-2 px-3 fw-bold rounded-pill bg-primary text-white cursor-pointer" style={{fontSize: '0.8rem'}}>Apply Now</div>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : searchTerm ? (
                        <div className="p-4 text-center">No visa destinations found.</div>
                    ) : null} 
                    {/* Hide everything when searchTerm is empty */}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Visa;
