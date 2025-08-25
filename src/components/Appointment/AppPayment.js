import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import Loading from "../Loading";


const AppPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentInitialized, setPaymentInitialized] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const { tnx_id, phone_number, amount_to_pay, first_name, last_name, contact_email } = location.state || {};

    const verifyPayment = async (transactionId) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/visa/app-payment-verification`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        transaction_id: transactionId,
                        booking_id: tnx_id,
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
        amount: amount_to_pay,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: contact_email,
            name: first_name + ' ' + last_name,
            phone_number: phone_number,
        },
        customizations: {
            title: 'Appointment Schedule Payment',
            description: 'Payment for appointment schedule',
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
        }finally {
          setPaymentProcessing(false);
      }
  }},
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
            <h2 className="mb-3">Appointment Schedule Payment</h2>
            <p className="text-center mb-4">You are about to make payment for your appointment schedule processing, confirm your details below before proceeding to make payment.</p>
            <div className="p-4 rounded shadow bg-white">
            <p><strong>Applicant:</strong> {first_name} {last_name}</p>
            <p><strong>Amount to Pay:</strong> &#x20A6;{amount_to_pay}</p>

        
            {paymentInitialized && fwConfig && (
                <div className="alert alert-success d-flex flex-column gap-2 justify-content-center align-items-center w-100" style={{ zIndex: '1', top: '0', left: '0', width: '100%'}}>
                    <p>Please complete your payment:</p>
                    <div className="d-flex flex-column align-items-center justify-content-center">
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
            )}
        </div>
        </div>
        <div className="spacer"></div>
        </>
        
    );
};

export default AppPayment;
