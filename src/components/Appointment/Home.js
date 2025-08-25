import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function Appointment() {

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email_address: '',
        phone_number: '',
        how_to_contact: '',
        appointment_date: '',
        reason: '',
        payment_status: '50000'
    })

    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, type, value} = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "number"
                ? (
                    value === ""
                        ? ""
                        : Number(value)
                )
                : value
        }));
    };

    const subAppointment = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "https://toogood-1.onrender.com/visa/appointment",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setFormData({
                    first_name: '',
                    last_name: '',
                    email_address: '',
                    phone_number: '',
                    how_to_contact: '',
                    appointment_date: '',
                    reason: '',
                    payment_status: '50000'
                })
            }

            if (response.ok) {
                navigate(`/apt-payment`, {
                    state: {
                        tnx_id: data.id,
                        last_name: formData.last_name,
                        first_name: formData.first_name,
                        phone_number: formData.phone_number,
                        contact_email: formData.email_address,
                        amount_to_pay: formData.payment_status
                    }
                });
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {}
    }
    return (
        <> < div className = "container-fluid appointment-banner p-0" > <div
            className='container vh-100 vw-100 d-flex justify-content-center align-items-center'>
            <div className="d-flex flex-column p-5 bg-light-subtle opacity-75">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0">Schedule an appointment</h4>
                    <h4 className="fw-bold mb-0">&#x20A6;50,000</h4>
                </div>
                <p className="text-gray-100 mb-0">Your details are safe with us</p>
                <hr/>
                <form onSubmit={subAppointment}>
                    <div className="d-flex flex-column gap-2">
                        <h4 className="text-dark fw-bold text-capitalize">Enter customer details</h4>
                        <div className="d-md-flex gap-3 mb-3">
                            <input
                                className="form-control p-3 rounded shadow mb-3"
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                required="required"
                                onChange={handleChange}
                                value={formData.first_name}/>
                            <input
                                className="form-control p-3 rounded shadow mb-3"
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                required="required"
                                onChange={handleChange}
                                value={formData.last_name}/>
                        </div>
                        <div className="d-md-flex gap-3 mb-3">
                            <input
                                className="form-control p-3 rounded shadow mb-3"
                                type="email"
                                name="email_address"
                                placeholder="Email Address"
                                required="required"
                                onChange={handleChange}
                                value={formData.email_address}/>
                            <input
                                className="form-control p-3 rounded shadow mb-3"
                                type="text"
                                name="phone_number"
                                placeholder="Phone Number"
                                required="required"
                                onChange={handleChange}
                                value={formData.phone_number}/>
                        </div>
                        <h4 className="text-dark fw-bold text-capitalize">Choose Your method of appointment</h4>
                        <div className="d-md-flex gap-3 mb-3">
                            <select
                                className="form-control p-3 rounded shadow mb-3"
                                value={formData.how_to_contact}
                                name="how_to_contact"
                                onChange={handleChange}>
                                <option value="">How can we contact you?</option>
                                <option value="WhatsApp Call">WhatsApp Call</option>
                                <option value="Zoom">Zoom</option>
                            </select>
                            <select
                                className="form-control p-3 rounded shadow mb-3"
                                value={formData.reason}
                                name="reason"
                                onChange={handleChange}>
                                <option value="">Reason for the appointment</option>
                                <option value="Visa">Visa</option>
                                <option value="Permit">Permit</option>
                                <option value="Others">Others</option>
                            </select>
                            <input
                                className="form-control p-3 rounded shadow"
                                type="date"
                                name="appointment_date"
                                required="required"
                                onChange={handleChange}
                                value={formData.appointment_date}/>
                        </div>
                        <input type="hidden" value={formData.payment_status} name="payment_status"/>
                        <button type="submit" className="border-0 p-3 bg-primary text-white rounded">Schedule Now</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</>
    )
}