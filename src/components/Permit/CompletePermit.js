import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import Loading from "../Loading";

const CompletePermit = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentInitialized, setPaymentInitialized] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const pdfRef = useRef(null);



    const downloadPDF = async () => {
        setLoading(true);
        try {
            // Check if ref exists
            if (!pdfRef.current) {
                throw new Error("PDF element not found");
            }

            // Dynamically import the libraries
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const element = pdfRef.current;

            // Show the element temporarily for capture
            element.style.display = 'block';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.top = '0';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: true,
                backgroundColor: '#ffffff',
            });

            // Hide the element again
            element.style.display = 'none';
            element.style.position = '';
            element.style.left = '';
            element.style.top = '';

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`invoice-${new Date(created_at).getDate().toString().padStart(2, '0') + (new Date(created_at).getMonth() + 1).toString().padStart(2, '0') + new Date(created_at).getFullYear()}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            // Fallback: Generate simple text PDF
            await generateSimplePDF();
        } finally {
            setLoading(false);
        }
    };

    const generateSimplePDF = async () => {
        try {
            const jsPDF = (await import("jspdf")).default;
            const pdf = new jsPDF();

            // Add content
            pdf.setFontSize(20);
            pdf.text('TOO GOOD TRAVELS', 20, 20);
            pdf.setFontSize(16);
            pdf.text('INVOICE', 160, 20);
            pdf.setFontSize(10);
            pdf.text(`#${new Date(created_at).getDate().toString().padStart(2, '0') + (new Date(created_at).getMonth() + 1).toString().padStart(2, '0') + new Date(created_at).getFullYear()}`, 160, 28);

            // Invoice details
            pdf.setFontSize(12);
            pdf.text('Invoice Details:', 20, 50);
            pdf.setFontSize(10);
            pdf.text(`Date: ${new Date(created_at).toLocaleDateString()}`, 20, 60);
            pdf.text(`Amount: ₦${parseFloat(price).toLocaleString()}`, 20, 67);

            // Customer info
            pdf.setFontSize(12);
            pdf.text('Customer Information:', 20, 85);
            pdf.setFontSize(10);
            pdf.text(`Name: ${first_name} ${last_name}`, 20, 95);
            pdf.text(`Phone: ${phone_number}`, 20, 102);
            pdf.text(`Email: ${contact_email}`, 20, 109);

            // Application info
            pdf.setFontSize(12);
            pdf.text('Application Details:', 20, 125);
            pdf.setFontSize(10);
            pdf.text(`Passport: ${passport_number}`, 20, 135);
            pdf.text(`Destination: ${destination}`, 20, 142);
            pdf.text(`Tracking ID: ${new Date(created_at).getDate().toString().padStart(2, '0') + (new Date(created_at).getMonth() + 1).toString().padStart(2, '0') + new Date(created_at).getFullYear()}`, 20, 149);

            pdf.save(`invoice-${new Date(created_at).getDate().toString().padStart(2, '0') + (new Date(created_at).getMonth() + 1).toString().padStart(2, '0') + new Date(created_at).getFullYear()}.pdf`);

        } catch (error) {
            console.error('Simple PDF also failed:', error);
            alert('PDF generation failed. Please contact support for your invoice.');
        }
    };


    const { booking_id, qr_code_filename, destination, phone_number, passport_number, passport_photograph, price, first_name, last_name, contact_email, created_at, payment_status } = location.state || {};

    const verifyPayment = async (transactionId) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/permit/payment-verification`,
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
            title: 'Permit Application Payment',
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
        text: 'Pay Now',
    };

    const cancelPayment = () => {
        setPaymentInitialized(false);
        navigate(-1);
    };

    return (
        <>
            <div className="spacer"></div>
            <div className="container d-flex flex-column justify-content-center">
                {/* Hidden PDF Content */}
                <div
                    ref={pdfRef}
                    style={{
                        display: 'none',
                        padding: '20px',
                        background: 'white',
                        width: '210mm', // A4 width
                        minHeight: '297mm' // A4 height
                    }}
                >
                    {/* Simple PDF Content */}
                    <div style={{ borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <img src="https://toogoodtravels.net/static/media/tgt.7dbe67b2cd1d73dd1a15.png" alt="TooGood Travels Logo" style={{ maxWidth: '150px' }} />
                                <p style={{ color: '#666', margin: 0 }}>Permit Support Services</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ color: '#28a745', margin: 0 }}>INVOICE</h2>
                                <p style={{ color: '#666', margin: 0 }}>#{new Date(created_at).getDate().toString().padStart(2, '0') + (new Date(created_at).getMonth() + 1).toString().padStart(2, '0') + new Date(created_at).getFullYear()}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p><strong>Invoice Date:</strong> {new Date(created_at).toLocaleDateString()}</p>
                                <p><strong>Due Date:</strong> {new Date(new Date(created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h3 style={{ color: '#28a745' }}>₦{parseFloat(price).toLocaleString()}</h3>
                                <p>Total Amount Due</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Personal Information</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p><strong>Name:</strong><br />{first_name} {last_name}</p>
                            </div>
                            <div>
                                <p><strong>Phone:</strong><br />{phone_number}</p>
                            </div>
                            <div>
                                <p><strong>Email:</strong><br />{contact_email}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Application Information</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p><strong>Passport Number:</strong><br />{passport_number}</p>
                            </div>
                            <div>
                                <p><strong>Destination:</strong><br />{destination}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-even' }}>
                            <div>
                                <img src={`https://toogood-1.onrender.com/uploads/${qr_code_filename}`} alt="Barcode" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
                            </div>
                            <div>
                                <img src={`https://toogood-1.onrender.com/uploads/${passport_photograph}`} alt="Passport" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '12px' }}>
                            This is a computer-generated invoice. No signature required.<br />
                            Thank you for choosing Too Good Travels!
                        </p>
                    </div>
                </div>
            </div>
            <div className="spacer"></div>
            <div className="container d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-between align-items-center w-100 mb-4">
                    <div>
                        <img src="https://toogoodtravels.net/static/media/tgt.7dbe67b2cd1d73dd1a15.png" alt="TooGood Travels Logo" style={{ maxWidth: '150px' }} />
                    </div>
                    <div className="d-flex flex-column align-items-end">
                        <h3 style={{ color: '#28a745', fontWeight: 'bolder' }}>₦{parseFloat(price).toLocaleString()}</h3>
                        <div className="d-flex flex-column flex-md-row mb-2 align-items-center">
                            <span className="fw-bold me-2">Payment Status:</span>
                            {payment_status === 'Paid' ? (
                                <span className="badge bg-success text-white p-2">Paid</span>
                            ) : (
                                <span className="badge bg-warning text-dark p-2">Pending Payment</span>
                            )}
                        </div>
                        {paymentInitialized && fwConfig && (
                            <div className="d-md-flex gap-1 align-items-center w-100">
                                {paymentProcessing ? (
                                    <Loading message="Verifying payment..." />
                                ) : (
                                    <FlutterWaveButton
                                        {...fwConfig}
                                        className="btn bg-primary text-white border-0 w-100 p-2 payment-btn-font-size mb-2 mb-md-0"
                                    />
                                )}
                                <button
                                    onClick={cancelPayment}
                                    className="btn border-0 bg-danger w-100 text-white p-2 payment-btn-font-size"
                                >
                                    Cancel Payment
                                </button>
                            </div>)}
                    </div>
                </div>
                <h2 className="mb-5 mt-5 fs-3 text-success fw-bold text-center">Visa Confirmation</h2>
                <p className="text-start mb-4 text-center text-md-start">{first_name}, you are about to make payment for your eVisa permit processing, confirm your details below before proceeding to make payment.</p>
                <div className="d-flex flex-column gap-2 bg-secondary-subtle p-4 mb-4" style={{ width: '100%' }}>
                    <h5 className="fs-5 fw-bold">Invoice Number: {new Date(created_at).getDate().toString().padStart(2, '0') + (new Date(created_at).getMonth() + 1).toString().padStart(2, '0') + new Date(created_at).getFullYear()}</h5>
                    <h5 className="fs-5">
                        Invoice Date: {new Date(created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h5>
                </div>
                <h4 className="mb-0 fw-bold text-decoration-underline mb-4 text-center text-md-start">Personal Information</h4>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4" style={{ width: '100%' }}>

                    <div className="d-flex flex-column gap-1 mb-3 text-center">
                        <h5 className="fw-bold">Name</h5>
                        <p className="fw-thin">{first_name} {last_name}</p>
                    </div>
                    <div className="d-flex flex-column gap-1 mb-3 text-center">
                        <h5 className="fw-bold">Phone Number</h5>
                        <p className="fw-thin">{phone_number}</p>
                    </div>
                    <div className="d-flex flex-column gap-1 mb-3 text-center">
                        <h5 className="fw-bold">Email</h5>
                        <p className="fw-thin">{contact_email}</p>
                    </div>
                </div>
                <h4 className="mb-0 fw-bold text-decoration-underline mb-4 text-center text-md-start">Application Information</h4>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4" style={{ width: '100%' }}>

                    <div className="d-flex flex-column gap-1 mb-3 text-center">
                        <h5 className="fw-bold">Passport Number</h5>
                        <p className="fw-thin">{passport_number}</p>
                    </div>
                    <div className="d-flex flex-column gap-1 mb-3 text-center">
                        <h5 className="fw-bold">Visa Permit Destination</h5>
                        <p className="fw-thin">{destination}</p>
                    </div>
                </div>
                <div className="d-md-flex gap-3 align-items-center text-center ">
                    <div>
                        <img src={`https://toogood-1.onrender.com/uploads/${qr_code_filename}`} alt="Barcode" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
                    </div>
                    <div>
                        <div style={{ width: '120px', height: '164px', margin: '0 auto' }}>
                            <img src={`https://toogood-1.onrender.com/uploads/${passport_photograph}`} alt="Passport" className="img-fluid mb-3 w-100" />
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-2 mt-4 justify-content-center justify-content-md-start">
                    <button
                        onClick={downloadPDF}
                        disabled={loading}
                        className="btn btn-primary px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                        style={{ minWidth: '200px' }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-border spinner-border-sm" role="status"></div>
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                📄 Download PDF Invoice
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="spacer"></div>
        </>

    );
};

export default CompletePermit;
