import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import Loading from "../Loading";

const VisaPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentInitialized, setPaymentInitialized] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const { booking_id, tracking_id, barcode_filename, destination, phone_number, passport_number, passport_photograph, price, first_name, last_name, contact_email, created_at } = location.state || {};

    const verifyPayment = async (transactionId) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/visa/payment-verification`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        transaction_id: transactionId,
                        booking_id: booking_id,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Payment verification failed");
            }

            return await response.json();
        } catch (error) {
            console.error("Verification Error:", error);
            throw error;
        }
    };

    const fwConfig = {
        public_key: process.env.REACT_APP_API_FLW_PUBLIC_KEY,
        tx_ref: Date.now(),
        amount: price,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: contact_email,
            name: first_name + ' ' + last_name,
            phone_number: phone_number,
        },
        customizations: {
            title: 'Visa Application Payment',
            description: 'Payment for visa application',
            logo: 'https://toogoodtravels.net/tg-favicon.png',
        },
        callback: async (response) => {
            console.log(response);
            closePaymentModal();
            if (response.status === 'successful') {
                setPaymentProcessing(true);
                try {
                    const verification = await verifyPayment(response.transaction_id);
                    console.log('Verification result:', verification);

                    if (verification.success) {
                        navigate('/success', {
                            state: {
                                transactionId: response.transaction_id,
                                fromPayment: true,
                            },
                            replace: true
                        });
                    } else {
                        alert('Payment verification failed. Please contact support.');
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    alert('Payment was successful but verification failed. Please check your email for confirmation.');
                } finally {
                    setPaymentProcessing(false);
                }
            }
        },
        onclose: () => {
            setPaymentInitialized(false);
        },
        text: 'Make Payment Now',
    };

    const cancelPayment = () => {
        setPaymentInitialized(false);
        navigate(-1);
    };

    return (
        <>
            <div className="spacer"></div>
            <div className="container d-flex flex-column align-items-center justify-content-center">
                <div className="d-flex justify-content-between align-items-center w-100 mb-4">
                    <div>
                        <img src="https://toogoodtravels.net/static/media/tgt.7dbe67b2cd1d73dd1a15.png" alt="TooGood Travels Logo" style={{ maxWidth: '150px' }} />
                    </div>
                    <div className="d-flex flex-column align-items-center">
                        {paymentProcessing ? (
                            <Loading message="Verifying payment..." />
                        ) : (
                            <FlutterWaveButton
                                {...fwConfig}
                                className="btn btn-primary w-100 py-3"
                            />
                        )}
                        <button
                            onClick={cancelPayment}
                            className="btn border-0 mt-3 bg-danger text-white"
                        >
                            Cancel Payment
                        </button>
                    </div>
                </div>
                <h2 className="mb-3 mt-3 fs-3 text-green">Visa Confirmation</h2>
                <p className="text-center mb-4">You are about to make payment for your eVisa processing, confirm your details below, copy and save your tracking ID before proceeding to make payment.</p>
                <div className="d-flex flex-column gap-2 bg-light p-4 rounded shadow mb-4" style={{ maxWidth: '500px', width: '100%' }}>
                    <h4>Invoice Number: {tracking_id}</h4>
                    <h4>Invoice Date: {created_at}</h4>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column gap-2">
                        <h4 className="fw-bold">Name</h4>
                        <p>{first_name} {last_name}</p>
                    </div>
                    <div className="d-flex flex-column gap-2">
                        <h4 className="fw-bold">Phone Number</h4>
                        <p>{phone_number}</p>
                    </div>
                    <div className="d-flex flex-column gap-2">
                        <h4 className="fw-bold">Email</h4>
                        <p>{contact_email}</p>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column gap-2">
                        <h4 className="fw-bold">Passport</h4>
                        <p>{passport_number}</p>
                    </div>
                    <div className="d-flex flex-column gap-2">
                        <h4 className="fw-bold">Visa Destination</h4>
                        <p>{destination}</p>
                    </div>
                    <div className="d-flex flex-column gap-2">
                        <h4 className="fw-bold">Tracking ID</h4>
                        <p>{tracking_id}</p>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <img src={`https://toogood-1.onrender.com/uploads/${barcode_filename}`} alt="Barcode" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
                    </div>
                    <div>
                        <div style={{ width: '120px', height: '164px' }}>
                            <img src={`https://toogood-1.onrender.com/uploads/${passport_photograph}`} alt="Barcode" className="img-fluid mb-3 w-100" />
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-4">
                    <button className="btn border-0 bg-secondary text-white px-4 py-2">Download</button>
                    <button className="btn border-0 bg-primary text-white px-4 py-2">Send invoice to mail</button>
                </div>
            </div>
            <div className="spacer"></div>
        </>

    );
};

export default VisaPayment;
