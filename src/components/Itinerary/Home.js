import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
// import BookingSvg from '../../assets/images/FlightReservation.svg';

const Home = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [flightForm, setFlightForm] = useState(false);
  const [hotelForm, setHotelForm] = useState(false);
  const [supportForm, setSupportForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
    hotel_details: "",
    
    // Support docs
    upload_signature: null
  });

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
        hotel_details: ""
      }));
    }
    if (!supportForm) {
      setFormData(prev => ({
        ...prev,
        upload_signature: null
      }));
    }
  }, [flightForm, hotelForm, supportForm, setFormData]);

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
    const formDataObj = new FormData();

    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== "") {
        formDataObj.append(key, formData[key]);
      }
    });

    setLoading(true);

    try {
      const response = await fetch("https://toogood-1.onrender.com/visa/bookings", {
        method: "POST",
        body: formDataObj,
        headers: {
          "Accept": "application/json"
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert("Application submitted successfully!");
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
          upload_signature: null
        });
        setFlightForm(false);
        setHotelForm(false);
        setSupportForm(false);
        navigate(-1);
      }
      setMessage(data.message);
    } catch (error) {
      console.error("Application Error:", error);
      alert("Failed to submit visa support application. Try again later");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message='Submitting visa support application...' />;
  }
  return (
    <>
        {loading && <Loading message='Submitting visa support application...'/>}
        <div className='container py-4'>
            <h2 className='mb-3'>Visa Support and Bookings</h2>
            <div className='w-75 mx-auto mb-3'>
              {/* <img src={BookingSvg} alt="Flight Reservation" className='img-fluid' /> */}
            </div>
            <p>
            Embassy and consulates recommend purchasing an actual flight ticket only after visa officer approves your visa application. If you attach an actual flight ticket and your visa application gets rejected, you’ll lose greater chunk of your hard-earned money. Therefore, always attach a confirmed flight Itinerary for visa application.
</p>
<h5>Dominant Features Regarding Our Flight Itinerary for Visa Service:</h5>
<p>
Our flight reservations are with the sustainable PNR code, these flight bookings provable via airline websites directly, you can find them perfectly acceptable for all countries visas and provide extensive validity.
            </p>
            {message && <p className="text-center text-red-500">{message}</p>}
            <form style={{fontSize: '0.8rem'}} onSubmit={handleSubmit}>
            <div className='d-md-flex mb-3 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>First Name</label>
                    <input name='first_name' value={formData.first_name} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Middle Name</label>
                    <input name='middle_name' value={formData.middle_name} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0'/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Last Name</label>
                    <input name='last_name' value={formData.last_name} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div>
            <div className='d-md-flex mb-4 bg-white rounded shadow'>
                <div className='col-12 col-md-6 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Email Address</label>
                    <input name='email' value={formData.email} type='email' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-6 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Travel Date</label>
                    <input name='phone_number' value={formData.phone_number} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div>
            <div className='d-md-flex mb-4 bg-white rounded shadow'>
              <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Date of Birth</label>
                    <input name='date_of_birth' value={formData.date_of_birth} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveling To</label>
                    <input name='destination' value={formData.destination} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Travel Date</label>
                    <input name='coverage_begin' value={formData.coverage_begin} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Return Date</label>
                    <input name='coverage_end' value={formData.coverage_end} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div>
            <div className='d-md-flex gap-2 py-4 px-2 mb-4 bg-white rounded shadow'>
        <div className='d-md-flex gap-2 mb-2'>
          <button 
            type="button"
            className={`w-32rem p-2 rounded text-white text-center border-0 ${flightForm ? 'bg-danger' : 'bg-primary'}`}
            onClick={toggleFlightForm}
          >
            {flightForm ? "Remove Flight" : "Add Flight"}
          </button>
        </div>
        <div className='d-md-flex gap-2 mb-2'>
          <button 
            type="button"
            className={`w-32rem p-2 rounded text-white text-center border-0 ${hotelForm ? 'bg-danger' : 'bg-primary'}`}
            onClick={toggleHotelForm}
          >
            {hotelForm ? "Remove Hotel" : "Add Hotel"}
          </button>
        </div>
        <div className='d-md-flex gap-2 mb-2'>
          <button 
            type="button"
            className={`w-32rem p-2 rounded text-white text-center border-0 ${supportForm ? 'bg-danger' : 'bg-primary'}`}
            onClick={toggleSupportForm}
          >
            {supportForm ? "Remove Support" : "Add Support"}
          </button>
        </div>
            </div>
            {flightForm && (
              <>
              <div className='d-md-flex mb-3 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Title</label>
                    <select name='title' value={formData.title} onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required>
                        <option value=''>Select Title</option>
                        <option value='Mr'>Mr</option>
                        <option value='Mrs'>Mrs</option>
                        <option value='Ms'>Ms</option>
                        <option value='Dr'>Dr</option>
                    </select>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveler First Name</label>
                    <input name='traveler_first_name' value={formData.traveler_first_name} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveler Last Name</label>
                    <input name='traveler_last_name' value={formData.traveler_last_name} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div>
            <div className='d-md-flex flex-column mb-4 bg-white rounded shadow'>
                <div className='col-12 d-flex flex-column gap-1 py-2 px-2'>
                    <label>Choose Your Trip</label>
                    <div className='d-flex gap-2 p-2'>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>One Way</label>
                      <input name='trip_type' type='radio' value='One Way' onChange={handleChange} />
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Round Trip</label>
                      <input name='trip_type' type='radio' value='Round Trip' onChange={handleChange} />
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Multiple Cities</label>
                      <input name='trip_type' type='radio' value='Multiple Cities' onChange={handleChange} />
                      </div>
                    </div>
                </div>
                <div className='col-12 mb-3 p-2 d-flex flex-column gap-2'>
                  <label>Flight Details</label>
                  <span className='text-secondary w-100' style={{fontSize: '8px'}}>Format: Departure city (date) - Arrival city/airport - Returning from city (date)</span>
                  <textarea name='flight_details' cols='10' rows='20' value={formData.flight_details} onChange={handleChange} className='py-4 px-2 rounded bg-secondary-subtle border-0 w-100'
                  placeholder='Flight details: Departure from Lagos (15-09-2025) - Arrival Boston - Returning from city (22-09-2025)' required
                  />
                </div>
            </div>
              </>
            )}
            {hotelForm && (
              <>
              <div className='d-md-flex mb-3 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Title</label>
                    <select name='hotel_title' value={formData.title} onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' >
                        <option value=''>Select Title</option>
                        <option value='Mr'>Mr</option>
                        <option value='Mrs'>Mrs</option>
                        <option value='Ms'>Ms</option>
                        <option value='Dr'>Dr</option>
                    </select>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveler First Name</label>
                    <input name='hotel_first_name' value={formData.hotel_first_name} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' />
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Traveler Last Name</label>
                    <input name='hotel_last_name' value={formData.hotel_last_name} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' />
                </div>
            </div>
            <div className='d-md-flex flex-column mb-4 bg-white rounded shadow'>
                <div className='col-12 mb-4 pt-4 px-2 d-flex flex-column gap-2'>
                  <label>Hotel Details</label>
                  <textarea name='hotel_details' rows='20' value={formData.hotel_details} onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0 w-100'/>
                </div>
                <div className='col-12 d-flex gap-1 pb-4 px-2'>
                <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Visa Interview Date</label>
                    <input name='visa_interview_date' value={formData.visa_interview_date} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Check In Date</label>
                    <input name='check_in_date' value={formData.check_in_date} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Check Out Date</label>
                    <input name='check_out_date' value={formData.check_out_date} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Applying at which embassy?</label>
                    <input name='visa_embassy' value={formData.visa_embassy} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' />
                </div>
                </div>
            </div>
              </>
            )}
            {supportForm && (
              <>
              <div className='d-md-flex mb-4 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Upload Support Documents</label>
                    <input name='upload_signature' type='file' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div>
              </>
            )}
            <div className="text-start mt-3">
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit Application"}
                    </button>
                </div>
        </form>
        <div className='spacer'></div>
        <div>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button> 
        </div>
        <div className='spacer'></div>
        </div>
    </>
  )
}

export default Home