import React from 'react';
import {useLocation, Link} from 'react-router-dom';
import Nav1 from '../Nav/Nav1';
import Footer from '../Footer';

const PermitAR = () => {
    const location = useLocation();
    const {originCountry, destination, searchResults} = location.state || {};

    if (!originCountry || !destination || !searchResults) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">No search data found</h2>
                <Link to="/permit-agent-application" className="text-blue-600 hover:underline">
                    Go back to search
                </Link>
            </div>
        );
    }

    return (
        <> 
        <Nav1 />
        <div div className = 'container-fluid result-bg' > <div className='container'>
            <div className="max-w-6xl mx-auto p-6">
                <div className="rounded-lg shadow-md p-6 mb-8 d-flex flex-column gap-3 align-items-center justify-content-center" style={{height: '16rem'}}>
                    <h1 className="text-3xl font-bold text-white mb-2">Permit Search Results</h1>
                    <div className="d-flex flex-wrap gap-4 align-items-start">
                        <div className="bg-light px-4 py-2 rounded-pill">
                            <span className="font-medium me-1">From:</span>
                            {originCountry}
                        </div>
                        <div className="bg-light px-4 py-2 rounded-pill">
                            <span className="font-medium me-1">To:</span>
                            {destination}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <div className='spacer'></div>
        <div className='container'>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    searchResults.map((destination, index) => (
                        <div
                            key={index}
                            className="p-4 d-flex flex-column rounded shadow bg-white mb-4">
                            <div className="fw-bold mb-2">{destination.destination}</div>
                            <div className="fw-bold mb-2 d-flex justify-content-between">
                                <div>{destination.visa_excerpt}</div>
                                <div className="d-flex flex-column">
                                    <div
                                        className="text-dark fw-bold"
                                        style={{
                                            fontSize: '0.5rem'
                                        }}>available to this passport holders:</div>
                                    <div
                                        className="text-secondary"
                                        style={{
                                            fontSize: '0.7rem',
                                            fontStyle: 'italic'
                                        }}>{destination.available_country}</div>
                                </div>
                            </div>
                            <hr/>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex flex-column">
                                    <span
                                        className="font-italics text-secondary-subtle"
                                        style={{
                                            fontSize: '0.6rem',
                                            fontStyle: 'italic'
                                        }}>visa processing fee</span>
                                    <span
                                        className="fw-bold text-dark"
                                        style={{
                                            fontSize: '1.1rem'
                                        }}>
                                        &#x20A6;{Number(destination.visa_agent_price).toLocaleString()}</span>
                                </div>
                                <Link to={`/permit-agent/${destination.id}`} className="text-decoration-none">
                                    <div
                                        className="border-0 py-2 px-3 fw-bold rounded-pill bg-primary text-white cursor-pointer"
                                        style={{
                                            fontSize: '0.8rem', backgroundColor: 'rgb(76, 175, 80)'
                                        }}>Apply Now</div>
                                </Link>
                            </div>
                        </div>
                    ))
                }
            </div>

            <div className="mt-8 text-center">
                <Link
                    to="/permit-agent-application"
                    className="inline-block px-4 text-decoration-none py-2 bg-light text-secondary rounded-md hover:bg-gradient transition">
                    New Search
                </Link>
            </div>
        </div>
        <Footer />
</>

    );
};

export default PermitAR;