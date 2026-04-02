import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios";
import Loading from "../Loading";

export default function VisaReceipt() {
    const { id } = useParams();
    const token = localStorage.getItem("adminToken");
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        if (!id || !token) {
            console.log("No ID or token found");
            setLoading(false);
            return;
        }

        console.log("Fetching visa status for ID:", id);
        axios.get(`https://toogood-1.onrender.com/visa/status/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                console.log("Visa status response:", response.data);
                setStatus(response.data);
            })
            .catch(error => {
                console.error("Error fetching visa details for receipt:", error);
                alert('Failed to load receipt data');
            })
            .finally(() => setLoading(false));

    }, [id, token]);

    const sendReceiptToEmail = async () => {
        if (!status?.contact_email) {
            alert('No email address found for this application');
            return;
        }

        setSendingEmail(true);
        try {
            const response = await axios.post(
                `https://toogood-1.onrender.com/visa/send-receipt-email`,
                {
                    visaData: status,
                    to: status.contact_email
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                alert(`✅ Receipt sent successfully to ${status.contact_email}`);
            } else {
                alert('❌ Failed to send receipt: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error sending receipt email:', error);
            alert('❌ Failed to send receipt. Please try again.');
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <>
            <div className="container-fluid">
                <div className="container">
                    {loading ? (
                        <Loading message="Loading receipt..." />
                    ) : (
                        <div className="d-flex flex-column justify-content-center">
                            {/* Send Email Button */}
                            <div className="text-center mb-4 mt-4">
                                <button
                                    onClick={sendReceiptToEmail}
                                    disabled={sendingEmail || !status}
                                    className="btn btn-success px-4 py-3 d-flex align-items-center gap-2 mx-auto"
                                    style={{ fontSize: '18px', minWidth: '250px' }}
                                >
                                    {sendingEmail ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm" role="status"></div>
                                            Sending Receipt...
                                        </>
                                    ) : (
                                        <>
                                            📧 Send Receipt to Email
                                        </>
                                    )}
                                </button>
                                {status?.contact_email && (
                                    <p className="text-muted mt-2">
                                        Will be sent to: <strong>{status.contact_email}</strong>
                                    </p>
                                )}
                            </div>

                            {status ? (
                                <>
                                    {/* Receipt Preview */}
                                    <div style={{
                                        padding: '20px',
                                        background: 'white',
                                        width: '210mm',
                                        margin: 'auto',
                                        minHeight: '297mm',
                                        border: '1px solid #ddd',
                                        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <img
                                                        src="https://toogoodtravels.net/static/media/tgt.7dbe67b2cd1d73dd1a15.png"
                                                        alt="TooGood Travels Logo"
                                                        style={{ maxWidth: '150px' }}
                                                    />
                                                    <p style={{ color: '#666', margin: 0, fontSize: '0.8rem', textAlign: 'center' }}>
                                                        Visa Support Services
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <h2 style={{ color: '#28a745', margin: 0 }}>INVOICE</h2>
                                                    <p style={{ color: '#666', margin: 0 }}>#{status.tracking_id}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '30px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div>
                                                    <p><strong>Invoice Date:</strong> {status.created_at ? new Date(status.created_at).toLocaleDateString() : "N/A"}</p>
                                                    <p><strong>Due Date:</strong> {status.created_at ? new Date(new Date(status.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : "N/A"}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <h3 style={{ color: '#28a745' }}>₦{parseFloat(status.visa_fee).toLocaleString()}</h3>
                                                    <p>Total Amount Due</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '30px' }}>
                                            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Personal Information</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                <div style={{ flex: '1', minWidth: '200px' }}>
                                                    <p><strong>Name:</strong><br />{status.first_name} {status.last_name}</p>
                                                </div>
                                                <div style={{ flex: '1', minWidth: '200px' }}>
                                                    <p><strong>Phone:</strong><br />{status.phone_number}</p>
                                                </div>
                                                <div style={{ flex: '1', minWidth: '200px' }}>
                                                    <p><strong>Email:</strong><br />{status.contact_email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '30px' }}>
                                            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Application Information</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                <div style={{ flex: '1', minWidth: '200px' }}>
                                                    <p><strong>Passport Number:</strong><br />{status.passport_number}</p>
                                                </div>
                                                <div style={{ flex: '1', minWidth: '200px' }}>
                                                    <p><strong>Destination:</strong><br />{status.visa_destination}</p>
                                                </div>
                                                <div style={{ flex: '1', minWidth: '200px' }}>
                                                    <p><strong>Tracking ID:</strong><br />{status.tracking_id}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {status.payment_status && (
                                            <div style={{ marginBottom: '30px' }}>
                                                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Payment Information</h3>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <p><strong>Payment Status:</strong><br />
                                                            <span style={{
                                                                color: status.payment_status === 'Paid' ? '#28a745' : '#dc3545',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {status.payment_status}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    {status.payment_date && (
                                                        <div>
                                                            <p><strong>Payment Date:</strong><br />
                                                                {new Date(status.payment_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
                                            <p style={{ color: '#666', fontSize: '12px' }}>
                                                This is a computer-generated invoice. No signature required.<br />
                                                Thank you for choosing Too Good Travels!
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <h3>No receipt data found!</h3>
                                    <p>Unable to load receipt information for the provided ID.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}