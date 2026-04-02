import React, { useEffect, useState } from 'react'
import '../Popular/Popular.css';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { FaBroom, FaSearch } from 'react-icons/fa';


const HotDeals = () => {
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchDestinations = async (search = "") => {
        try {
            setLoading(true);
            const base = "https://toogood-1.onrender.com/visa";
            // use server search endpoint when search provided
            const url = search
                ? `${base}/available-destinations?search=${encodeURIComponent(search)}`
                : `${base}/selected-destinations`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch visa destinations");
            const data = await response.json();
            const list = data.data || [];
            setDestinations(list);
            setFilteredDestinations(list);
        } catch (err) {
            setError(err.message);
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDestinations();
    }, [navigate]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        await fetchDestinations(searchTerm.trim());
    };

    const handleClear = async () => {
        setSearchTerm("");
        await fetchDestinations();
    };

    if (loading) return <Loading />;
    if (error) return <p className="text-red-500">{error}</p>;

    const list = filteredDestinations.length ? filteredDestinations : destinations;

    return (
        <div className="container py-4">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-2">
                <h3 className="m-0">Hot Deals</h3>
                <form onSubmit={handleSearchSubmit} className="d-flex gap-0">
                    <input
                        type="search"
                        placeholder="Search destinations..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="form-control"
                        style={{ minWidth: 200, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ marginRight: 5, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}><FaSearch /></button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleClear}><FaBroom /></button>
                </form>
            </div>

            {list.length === 0 ? (
                <p>No deals available</p>
            ) : (
                <div className="row g-3">
                    {list.map(dest => (
                        <div className="col-12 col-md-6 col-lg-4" key={dest.id}>
                            <div className="card h-100">
                                <img
                                    src={dest.visa_img || '/placeholder-visa.png'}
                                    className="card-img-top"
                                    alt={dest.destination}
                                    style={{ objectFit: 'cover', height: 180 }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{dest.destination}</h5>
                                    <p className="card-text" style={{ flex: '0 0 auto' }}>
                                        {dest.visa_excerpt || ((dest.visa_description || '').slice(0, 120) + ((dest.visa_description || '').length > 120 ? '...' : ''))}
                                    </p>
                                    <div className="mt-auto shadow" style={{ padding: '0.75rem', borderRadius: '0.25rem' }}>
                                        <div className="d-flex gap-2 align-items-center justify-content-between">
                                            <p className="mb-0"><strong>From: </strong>&#x20A6;{Number(dest.visa_price).toLocaleString()}</p>
                                            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/visa/${dest.id}`)}>Apply Now</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default HotDeals