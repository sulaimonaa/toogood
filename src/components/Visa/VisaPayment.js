import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const VisaPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { tracking_id, destination, price, first_name, last_name } = location.state || {};

    const handlePayment = async () => {
        try {
            // Assume payment is successful
            const response = await axios.post("http://localhost:5000/visa/update-payment", {
                tracking_id,
                payment_status: "Paid",
            });

            if (response.data.success) {
                alert("Payment successful!");
                navigate("/confirmation");
            } else {
                alert("Failed to update payment status");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment failed");
        }
    };

    return (
        <div className="container vw-100 vh-100 d-flex flex-column align-items-center justify-content-center">
            <h2 className="mb-3">Visa Payment</h2>
            <p className="text-center mb-4">You are about to make payment for your eVisa processing, confirm your details below, copy and save your tracking ID before proceed to make payment.</p>
            <div className="p-4 rounded shadow bg-white">
            <p><strong>Destination:</strong> {destination}</p>
            <p><strong>Applicant:</strong> {first_name} {last_name}</p>
            <p><strong>Tracking ID:</strong> {tracking_id}</p>
            <p><strong>Amount to Pay:</strong> &#x20A6;{price}</p>

            <button onClick={handlePayment} className="btn btn-primary border-0 fw-bold rounded-pill">
                Proceed with Payment
            </button>
            </div>
        </div>
    );
};

export default VisaPayment;
