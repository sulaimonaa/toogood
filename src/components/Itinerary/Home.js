import React, { useEffect, useState, useCallback } from 'react';
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import BookingPng from '../../assets/images/vb.png';

const Home = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [flightForm, setFlightForm] = useState(false);
    const [hotelForm, setHotelForm] = useState(false);
    const [supportForm, setSupportForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [paymentInitialized, setPaymentInitialized] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const [formData, setFormData] = useState({
        // Basic info
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        coverage_begin: "",
        coverage_end: "",
        destination: "",

        // Flight info
        title: "",
        traveler_first_name: "",
        traveler_last_name: "",
        trip_type: "",
        flight_details: "",

        // Hotel info
        hotel_title: "",
        hotel_first_name: "",
        hotel_last_name: "",
        visa_interview_date: "",
        check_in_date: "",
        check_out_date: "",
        visa_embassy: "",
        hotel_details: "",

        // Support docs
        upload_signature: null,
        amount_to_pay: 0
    });

    // Calculate based on services selected
    const calculateAmount = useCallback(() => {
      let amount = 0;
      if (flightForm) amount += 20000;
      if (hotelForm) amount += 25000;
      if (supportForm) amount += 250000;
      return amount;
    }, [flightForm, hotelForm, supportForm]);

    // Calculate amount whenever service selections change
    useEffect(() => {
        const newAmount = calculateAmount();
        setFormData(prev => ({
            ...prev,
            amount_to_pay: newAmount
        }));
    }, [calculateAmount, flightForm, hotelForm, supportForm]);

    // Clear fields when forms are toggled off
    useEffect(() => {
        if (!flightForm) {
            setFormData(prev => ({
                ...prev,
                title: "",
                traveler_first_name: "",
                traveler_last_name: "",
                trip_type: "",
                flight_details: ""
            }));
        }
        if (!hotelForm) {
            setFormData(prev => ({
                ...prev,
                hotel_title: "",
                hotel_first_name: "",
                hotel_last_name: "",
                visa_interview_date: "",
                check_in_date: "",
                check_out_date: "",
                visa_embassy: "",
                hotel_details: ""
            }));
        }
        if (!supportForm) {
            setFormData(prev => ({
                ...prev,
                upload_signature: null
            }));
        }
    }, [flightForm, hotelForm, supportForm]);

    const handleChange = (e) => {
        const { name, type, value, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "file" ? (files.length > 0 ? files[0] : null) :
                   type === "checkbox" ? (checked ? value : "") : 
                   value,
        }));
    };

    const toggleFlightForm = () => setFlightForm(!flightForm);
    const toggleHotelForm = () => setHotelForm(!hotelForm);
    const toggleSupportForm = () => setSupportForm(!supportForm);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('Submitting with amount:', formData.amount_to_pay);
        // Ensure amount is up to date
        const currentAmount = calculateAmount();
        const updatedFormData = {
            ...formData,
            amount_to_pay: currentAmount
        };
        console.log(currentAmount);
        const formDataObj = new FormData();
        
        // Append all form data (including files)
        for (const key in updatedFormData) {
            if (updatedFormData[key] !== null && updatedFormData[key] !== "") {
                if (key === 'upload_signature' && updatedFormData[key] instanceof File) {
                    formDataObj.append(key, updatedFormData[key], updatedFormData[key].name);
                } else {
                    formDataObj.append(key, updatedFormData[key]);
                }
            }
        }

        if (!updatedFormData.email || !updatedFormData.phone_number) {
            alert('Please complete your contact information first');
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("https://toogood-1.onrender.com/bookings/app", {
                method: "POST",
                body: formDataObj,
                headers: {
                    "Accept": "application/json"
                }
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Server returned: ${text.substring(0, 100)}...`);
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Request failed");
            }
            
            // Reset form
            setFormData({
                first_name: "",
                middle_name: "",
                last_name: "",
                email: "",
                phone_number: "",
                date_of_birth: "",
                coverage_begin: "",
                coverage_end: "",
                destination: "",
                title: "",
                traveler_first_name: "",
                traveler_last_name: "",
                trip_type: "",
                flight_details: "",
                hotel_title: "",
                hotel_first_name: "",
                hotel_last_name: "",
                visa_interview_date: "",
                check_in_date: "",
                check_out_date: "",
                hotel_details: "",
                visa_embassy: "",
                upload_signature: null,
                amount_to_pay: 0
            });
            
            setBookingData(data);
            setPaymentInitialized(true);
            setFlightForm(false);
            setHotelForm(false);
            setSupportForm(false);
            setPaymentInitialized(true);
            console.log(data);
            
        } catch (error) {
            console.error("Submission Error:", error);
            let errorMessage = error.message;
            
            if (error.message.includes('<!DOCTYPE')) {
                errorMessage = "Server returned an error page. Please check the server status.";
            }
            
            setMessage(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (transactionId) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/payment/verify`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        transaction_id: transactionId,
                        booking_id: bookingData.booking_id,
                        tx_ref: bookingData.payment_info.tx_ref,
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

    const fwConfig = bookingData?.payment_info ? {
      public_key: process.env.REACT_APP_API_FLW_PUBLIC_KEY, 
      tx_ref: bookingData.payment_info.tx_ref,
      amount: bookingData.payment_info.amount,
      currency: bookingData.payment_info.currency || 'NGN',
      payment_options: 'card,mobilemoney,ussd',
      customer: {
          email: bookingData.payment_info.customer_email,
          name: bookingData.payment_info.customer_name,
          phone_number: bookingData.payment_info.customer_phone || formData.phone_number,
      },
      customizations: {
          title: 'Visa Support Booking',
          description: 'Payment for visa support services',
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
                            bookingData: bookingData,
                            fromPayment: true 
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
  } : null;

  const cancelPayment = () => {
    setPaymentInitialized(false);
    navigate(-1); 
  };

    if (loading) {
        return <Loading message='Submitting visa support application...' />;
    }

    return (
        <div className='container py-4'>
            <h2 className='mb-4'>Visa Support and Bookings</h2>
            
            <div className='d-md-flex flex-reverse justify-content-center align-items-center mb-4'>
                <div className='d-flex flex-column gap-1'>
                    <div className='d-flex gap-1 text-italic p-2 rounded bg-secondary-subtle align-items-center justify-content-center mb-4' 
                         style={{width: '16rem', fontSize: '1rem', color: 'GrayText'}}>
                        <h4 className='m-0' style={{fontSize: '1rem'}}>Amount to Pay: </h4>
                        <span className='text-primary fw-bold'>&#x20A6;{formData.amount_to_pay.toLocaleString()}</span>
                    </div>
                    <img src={BookingPng} alt="Booking" className='w-100' />
                </div>
                <div className='p-2'>
                    <p>
                        Embassy and consulates recommend purchasing an actual flight ticket only after visa officer 
                        approves your visa application. If you attach an actual flight ticket and your visa application 
                        gets rejected, you'll lose greater chunk of your hard-earned money. Therefore, always attach 
                        a confirmed flight Itinerary for visa application.
                    </p>
                    <h5>Dominant Features Regarding Our Flight Itinerary for Visa Service:</h5>
                    <p>
                        Our flight reservations are with the sustainable PNR code, these flight bookings provable via 
                        airline websites directly, you can find them perfectly acceptable for all countries visas and 
                        provide extensive validity.
                    </p>
                </div>
            </div>
            
            {message && <p className="text-center text-red-500">{message}</p>}
         < form style = {{fontSize: '0.8rem'}}onSubmit = {
            handleSubmit
        } > <div className='d-md-flex mb-3 bg-white rounded shadow'>
            <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                <label>First Name</label>
                <input
                    name='first_name'
                    value={formData.first_name}
                    type='text'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'
                    required="required"/>
            </div>
            <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                <label>Middle Name</label>
                <input
                    name='middle_name'
                    value={formData.middle_name}
                    type='text'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'/>
            </div>
            <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                <label>Last Name</label>
                <input
                    name='last_name'
                    value={formData.last_name}
                    type='text'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'
                    required="required"/>
            </div>
        </div>
        <div className='d-md-flex mb-4 bg-white rounded shadow'>
            <div className='col-12 col-md-6 d-flex flex-column gap-1 py-4 px-2'>
                <label>Email Address</label>
                <input
                    name='email'
                    value={formData.email}
                    type='email'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'
                    required="required"/>
            </div>
            <div className='col-12 col-md-6 d-flex flex-column gap-1 py-4 px-2'>
                <label>Phone Number</label>
                <input
                    name='phone_number'
                    value={formData.phone_number}
                    type='text'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'
                    required="required"/>
            </div>
        </div>
        <div className='d-md-flex mb-4 bg-white rounded shadow'>
            <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                <label>Date of Birth</label>
                <input
                    name='date_of_birth'
                    value={formData.date_of_birth}
                    type='date'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'
                    required="required"/>
            </div>
            <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                <label>Traveling To</label>
                <input
                    name='destination'
                    value={formData.destination}
                    type='text'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'
                    required="required"/>
            </div>
            <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                <label>Travel Date</label>
                <input
                    name='coverage_begin'
                    value={formData.coverage_begin}
                    type='date'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'
                    required="required"/>
            </div>
            <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                <label>Return Date</label>
                <input
                    name='coverage_end'
                    value={formData.coverage_end}
                    type='date'
                    onChange={handleChange}
                    className='p-2 rounded bg-secondary-subtle border-0'
                    required="required"/>
            </div>
        </div>
        <div className='d-md-flex flex-column gap-2 py-4 px-2 mb-4 bg-white rounded shadow'>
            <h5 className='text-start' style={{fontSize: '0.7rem', fontStyle: 'italic'}}>Select/Add Services to confirm the amount to pay: &#x20A6;{formData.amount_to_pay.toLocaleString()} </h5>
            <div className='d-md-flex gap-2'>
            <div className='d-md-flex gap-2 mb-2'>
                <button
                    type="button"
                    className={`w-32rem p-2 rounded text-white text-center border-0 ${flightForm
                        ? 'bg-danger'
                        : 'bg-primary'}`}
                    onClick={toggleFlightForm}>
                    {
                        flightForm
                            ? "Remove Flight"
                            : "Add Flight"
                    }
                </button>
            </div>
            <div className='d-md-flex gap-2 mb-2'>
                <button
                    type="button"
                    className={`w-32rem p-2 rounded text-white text-center border-0 ${hotelForm
                        ? 'bg-danger'
                        : 'bg-primary'}`}
                    onClick={toggleHotelForm}>
                    {
                        hotelForm
                            ? "Remove Hotel"
                            : "Add Hotel"
                    }
                </button>
            </div>
            <div className='d-md-flex gap-2 mb-2'>
                <button
                    type="button"
                    className={`w-32rem p-2 rounded text-white text-center border-0 ${supportForm
                        ? 'bg-danger'
                        : 'bg-primary'}`}
                    onClick={toggleSupportForm}>
                    {
                        supportForm
                            ? "Remove Complete Documents"
                            : "Add Complete Documents"
                    }
                </button>
            </div>
            </div>
        </div>
            {
            flightForm && (
                <> < div className = 'text-align-right mb-2' style = {{color: 'GrayText'}} > Flight Support Charges : &#x20A6;
                20,
                000</div> < div className = 'd-md-flex mb-3 bg-white rounded shadow' > <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Title</label>
                    <select
                        name='title'
                        value={formData.title}
                        onChange={handleChange}
                        className='p-2 rounded bg-secondary-subtle border-0'
                        required="required">
                        <option value=''>Select Title</option>
                        <option value='Mr'>Mr</option>
                        <option value='Mrs'>Mrs</option>
                        <option value='Ms'>Ms</option>
                        <option value='Dr'>Dr</option>
                    </select>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveler First Name</label>
                    <input
                        name='traveler_first_name'
                        value={formData.traveler_first_name}
                        type='text'
                        onChange={handleChange}
                        className='p-2 rounded bg-secondary-subtle border-0'
                        required="required"/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveler Last Name</label>
                    <input
                        name='traveler_last_name'
                        value={formData.traveler_last_name}
                        type='text'
                        onChange={handleChange}
                        className='p-2 rounded bg-secondary-subtle border-0'
                        required="required"/>
                </div>
            </div>
            <div className='d-md-flex flex-column mb-4 bg-white rounded shadow'>
                <div className='col-12 d-flex flex-column gap-1 py-2 px-2'>
                    <label>Choose Your Trip</label>
                    <div className='d-flex gap-2 p-2'>
                        <div className='d-flex justify-content-center align-items-center gap-2'>
                            <label>One Way</label>
                            <input name='trip_type' type='radio' value='One Way' onChange={handleChange}/>
                        </div>
                        <div className='d-flex justify-content-center align-items-center gap-2'>
                            <label>Round Trip</label>
                            <input
                                name='trip_type'
                                type='radio'
                                value='Round Trip'
                                onChange={handleChange}/>
                        </div>
                        <div className='d-flex justify-content-center align-items-center gap-2'>
                            <label>Multiple Cities</label>
                            <input
                                name='trip_type'
                                type='radio'
                                value='Multiple Cities'
                                onChange={handleChange}/>
                        </div>
                    </div>
                </div>
                <div className='col-12 mb-3 p-2 d-flex flex-column gap-2'>
                    <label>Flight Details</label>
                    <span
                        className='text-secondary w-100'
                        style={{
                            fontSize: '8px'
                        }}>Format:
                        Departure city (date) - Arrival city/airport - Returning from city (date)</span>
                    <textarea
                        name='flight_details'
                        cols='10'
                        rows='20'
                        value={formData.flight_details}
                        onChange={handleChange}
                        className='py-4 px-2 rounded bg-secondary-subtle border-0 w-100'
                        placeholder='Flight details: Departure from Lagos (15-09-2025) - Arrival Boston - Returning from city (22-09-2025)'
                        required="required"/>
                </div>
            </div>
        </>
            )
        } {
            hotelForm && (
                <> < div className = 'text-align-right mb-2' style = {{color: 'GrayText'}} > Hotel Support Charges : &#x20A6;
                25,
                000</div> < div className = 'd-md-flex mb-3 bg-white rounded shadow' > <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Title</label>
                    <select
                        name='hotel_title'
                        value={formData.hotel_title}
                        onChange={handleChange}
                        className='p-2 rounded bg-secondary-subtle border-0'>
                        <option value=''>Select Title</option>
                        <option value='Mr'>Mr</option>
                        <option value='Mrs'>Mrs</option>
                        <option value='Ms'>Ms</option>
                        <option value='Dr'>Dr</option>
                    </select>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveler First Name</label>
                    <input
                        name='hotel_first_name'
                        value={formData.hotel_first_name}
                        type='text'
                        onChange={handleChange}
                        className='p-2 rounded bg-secondary-subtle border-0'/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveler Last Name</label>
                    <input
                        name='hotel_last_name'
                        value={formData.hotel_last_name}
                        type='text'
                        onChange={handleChange}
                        className='p-2 rounded bg-secondary-subtle border-0'/>
                </div>
            </div>
            <div className='d-md-flex flex-column mb-4 bg-white rounded shadow'>
                <div className='col-12 mb-4 pt-4 px-2 d-flex flex-column gap-2'>
                    <label>Hotel Details</label>
                    <textarea
                        name='hotel_details'
                        rows='20'
                        value={formData.hotel_details}
                        onChange={handleChange}
                        className='p-2 rounded bg-secondary-subtle border-0 w-100'/>
                </div>
                <div className='col-12 d-md-flex gap-1 pb-4 px-2'>
                    <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                        <label>Visa Interview Date</label>
                        <input
                            name='visa_interview_date'
                            value={formData.visa_interview_date}
                            type='date'
                            onChange={handleChange}
                            className='p-2 rounded bg-secondary-subtle border-0'
                            required="required"/>
                    </div>
                    <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                        <label>Check In Date</label>
                        <input
                            name='check_in_date'
                            value={formData.check_in_date}
                            type='date'
                            onChange={handleChange}
                            className='p-2 rounded bg-secondary-subtle border-0'
                            required="required"/>
                    </div>
                    <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                        <label>Check Out Date</label>
                        <input
                            name='check_out_date'
                            value={formData.check_out_date}
                            type='date'
                            onChange={handleChange}
                            className='p-2 rounded bg-secondary-subtle border-0'
                            required="required"/>
                    </div>
                    <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                        <label>Applying at which embassy?</label>
                        <input
                            name='visa_embassy'
                            value={formData.visa_embassy}
                            type='text'
                            onChange={handleChange}
                            className='p-2 rounded bg-secondary-subtle border-0'/>
                    </div>
                </div>
            </div>
        </>
            )
        } {
            supportForm && (
                <> < div className = 'text-align-right mb-2' style = {{color: 'GrayText'}} > Support Documents Charges : &#x20A6;
                250,000</div> < div className = 'd-md-flex mb-4 bg-white rounded shadow' > <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Upload Support Documents</label>
                    <input
                        name='upload_signature'
                        type='file'
                        onChange={handleChange}
                        className='p-2 rounded bg-secondary-subtle border-0'
                        required="required"/>
                </div>
            </div>
        </>
            )
        } <input name='amount_to_pay' type='hidden' value={formData.amount_to_pay} onChange={handleChange} />
                
        <div className="text-start mt-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
            </button>
        </div>
    </form>
    
    <div className='spacer'></div>
    
    {paymentInitialized && fwConfig && (
                <div className="alert alert-success d-flex flex-column gap-2 justify-content-center align-items-center w-100" style={{height: '100vh', zIndex: '1', top: '0', left: '0', width: '100%', position: 'absolute'}}>
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
    <div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
    </div>
    
    <div className='spacer'></div>
</div>
);
};

export default Home;