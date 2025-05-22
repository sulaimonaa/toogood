import { Link, useLocation } from "react-router-dom";

export default function SuccessfulPayments() {
    const location = useLocation(); 
    const { transaction_id, bookingData } = location.state || {};
    return (
        <>
            <div className="spacer"></div>
            <div className="container d-flex flex-column align-items-center justify-content-center">
                <h2 className="mb-3">Successful Payments</h2>
                <p className="text-center mb-4">{bookingData.last_name} You have successfully completed your payment. Your application is being processed.</p>
                <div className="p-4 rounded shadow bg-white mb-3">
                    <p>Thank you for your payment!</p>
                    <p>Transaction ID: {transaction_id}</p>
                    <p>Your application is being processed.</p>
                </div>
                <Link to="/" className="btn btn-primary border-0 p-1 fw-bold rounded-pill mb-4">Back to the home page!</Link>
            </div>
            <div className="spacer"></div>
        </>
    )
}