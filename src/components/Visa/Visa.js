// import axios from "axios";
import React, { useState, useEffect } from "react";

const Visa = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await fetch("http://localhost:5000/visa/destinations");
                if (!response.ok) {
                    throw new Error("Failed to fetch visa destinations");
                }
                const data = await response.json();
                console.log(data);
                setDestinations(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    if (loading) return <p>Loading visa destinations...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Visa Destinations</h2>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">#</th>
                        <th className="border border-gray-300 px-4 py-2">Country</th>
                        <th className="border border-gray-300 px-4 py-2">Fee ($)</th>
                        <th className="border border-gray-300 px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {destinations.length > 0 ? (
                        destinations.map((destination, index) => (
                            <tr key={index} className="text-center">
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">{destination.destination}</td>
                                <td className="border border-gray-300 px-4 py-2">{destination.visa_excerpt}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <button
                                        
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                                    >
                                        Apply
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center border border-gray-300 px-4 py-2">
                                No visa destinations found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Visa;
