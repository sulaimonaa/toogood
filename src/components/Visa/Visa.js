// import axios from "axios";
import React, { useState, useEffect } from "react";
import Nav1 from "../Nav/Nav1";
import Footer from "../Footer";
import VisaInfo from "./VisaInfo";
import { Link } from "react-router-dom";

const Visa = () => {
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await fetch("http://localhost:5000/visa/destinations");
                if (!response.ok) {
                    throw new Error("Failed to fetch visa destinations");
                }
                const data = await response.json();
                setDestinations(data.data);
                setFilteredDestinations(data.data); 
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = destinations.filter((destination) =>
            destination.destination.toLowerCase().includes(term) ||
            destination.visa_price.toString().includes(term)
        );

        setFilteredDestinations(filtered);
    };

    if (loading) return <p>Loading visa destinations...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
        <div className="hero2 py-4">
        <Nav1 />
        </div>
        <div className="container-fluid rounded-top-4 bg-white self-section">
        <div className="container pt-4">
        <h2 className="text-xl font-bold mb-4">Apply for eVisa in a few clicks</h2>
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
            {filteredDestinations.length > 0 ? (
                filteredDestinations.map((destination, index) => (
                    <div key={index} className="p-4 d-flex flex-column rounded shadow bg-white mb-4">
                        <div className="fw-bold mb-2">{destination.destination}</div>
                        <div className="fw-bold mb-2">{destination.visa_excerpt}</div>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex flex-column">
                                <span className="font-italics text-secondary-subtle" style={{fontSize: '0.6rem', fontStyle: 'italic'}}>visa processing fee</span>
                                <span className="fw-bold text-dark" style={{fontSize: '1.1rem'}}> &#x20A6;{destination.visa_price}</span>
                            </div>
                            <Link to={`/visa/${destination.id}`} className="text-decoration-none">
                            <div className="border-0 py-2 px-3 fw-bold rounded-pill bg-primary text-white cursor-pointer" style={{fontSize: '0.8rem'}}>Apply Now</div>
                            </Link>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center">No visa destinations found.</div>
            )}
        </div>
        </div>
        <Footer />
        </>
    );
};

export default Visa;
