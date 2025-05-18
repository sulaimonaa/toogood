import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VisaPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [transfer, setTransfer] = useState(false);

    const { tracking_id, destination, price, first_name, last_name } = location.state || {};

    const handlePayment =  () => {
        setTransfer(true)    
    };

    const paymentComplete = () => {
        setTransfer(false)
        navigate('../')
    }
    return (
        <>
        <div className="spacer"></div>
        <div className="container d-flex flex-column align-items-center justify-content-center">
            <h2 className="mb-3">Visa Payment</h2>
            <p className="text-center mb-4">You are about to make payment for your eVisa processing, confirm your details below, copy and save your tracking ID before proceeding to make payment.</p>
            <div className="p-4 rounded shadow bg-white">
            <p><strong>Destination:</strong> {destination}</p>
            <p><strong>Applicant:</strong> {first_name} {last_name}</p>
            <p><strong>Tracking ID:</strong> {tracking_id}</p>
            <p><strong>Amount to Pay:</strong> &#x20A6;{price}</p>

            <button onClick={handlePayment} className="btn btn-primary border-0 fw-bold rounded-pill mb-4">
                Proceed with Payment
            </button>
            </div>
            {transfer ? (<div className="d-flex flex-column gap-2 p-4 rounded shadow mt-4 mb-4">
                <h6>You are about to complete application process for <span className="fw-bold" style={{fontStyle: 'italic'}}>{destination} Visa</span></h6>
                <h6>Amount to pay: &#x20A6;{price}</h6>
                <h5>Account Details:</h5>
                <h5>Bank Name: FCMB</h5>
                <h5>Account Name: TOO GOOD TRAVELS LTD</h5>
                <h5>Account Number: 3614024018</h5>
                <p>Please send your proof of payment to the email: sales@toogoodtravels.com or sales@toogoodtravels.net.<br/>You can also send as WhatsApp to +234-8035969519</p>
                <button onClick={paymentComplete} className="border-0 rounded-pill p-2 bg-success text-white fw-bold">Payment Complete</button>
                </div>) : (<div className="d-none">Testing</div>)}
        </div>
        <div className="spacer"></div>
        </>
        
    );
};

export default VisaPayment;
