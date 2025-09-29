import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";


const useRecaptcha = (siteKey, version = 'v3') => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const scriptRef = useRef(null);

  const loadRecaptcha = useCallback(() => {
    // Check if already loaded
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Check if script already exists in DOM
    if (document.querySelector('script[src*="google.com/recaptcha"]')) {
      setIsLoaded(true);
      return;
    }

    // Create and load script
    scriptRef.current = document.createElement('script');
    const src = version === 'v3'
      ? `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      : 'https://www.google.com/recaptcha/api.js';

    scriptRef.current.src = src;
    scriptRef.current.async = true;
    scriptRef.current.defer = true;

    const handleLoad = () => {
      setIsLoaded(true);
      setError(null);
    };

    const handleError = () => {
      setError('Failed to load reCAPTCHA');
      setIsLoaded(false);
    };

    scriptRef.current.addEventListener('load', handleLoad);
    scriptRef.current.addEventListener('error', handleError);

    document.body.appendChild(scriptRef.current);

    // Return cleanup function
    return () => {
      if (scriptRef.current) {
        scriptRef.current.removeEventListener('load', handleLoad);
        scriptRef.current.removeEventListener('error', handleError);

        if (scriptRef.current.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current);
        }
      }
    };
  }, [siteKey, version]);

  useEffect(() => {
    const cleanup = loadRecaptcha();
    return cleanup;
  }, [loadRecaptcha]);

  const executeRecaptcha = useCallback(async (action = 'submit') => {
    if (!isLoaded || !window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }

    try {
      if (version === 'v3') {
        return await window.grecaptcha.execute(siteKey, { action });
      } else {
        // For v2, you might handle it differently
        return await new Promise((resolve) => {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(siteKey, { action }).then(resolve);
          });
        });
      }
    } catch (err) {
      setError('Failed to execute reCAPTCHA');
      throw err;
    }
  }, [isLoaded, siteKey, version]);

  const resetRecaptcha = useCallback(() => {
    if (window.grecaptcha && window.grecaptcha.reset) {
      window.grecaptcha.reset();
    }
  }, []);

  return {
    isLoaded,
    error,
    executeRecaptcha,
    resetRecaptcha
  };
};

export default function Appointment() {
  const [loading, setLoading] = useState(false);
  const { isLoaded, error, executeRecaptcha, resetRecaptcha } = useRecaptcha('6Lc__bkrAAAAANXv3oBEBIsjH6NJeW5KGiALifM_', 'v3');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
    phone_number: '',
    how_to_contact: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    amount_to_pay: '10000'
  })

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, value } = e.target;
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
    setLoading(true);
    try {
      const token = await executeRecaptcha('submit');
      if (!token) {
        alert('reCAPTCHA verification failed. Please try again.');
        setLoading(false);
        return;
      }
      const response = await fetch("https://toogood-1.onrender.com/visa/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Tell backend it's JSON
          "Accept": "application/json"
        },
        body: JSON.stringify(formData) // Send JSON
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          first_name: '',
          last_name: '',
          email_address: '',
          phone_number: '',
          how_to_contact: '',
          appointment_date: '',
          appointment_time: '',
          reason: '',
          amount_to_pay: '10000'
        });

        navigate(`/apt-payment`, {
          state: {
            tnx_id: data.id,
            last_name: formData.last_name,
            first_name: formData.first_name,
            phone_number: formData.phone_number,
            email_address: formData.email_address,
            amount_to_pay: formData.amount_to_pay
          }
        });
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <Loading message='Making appointment schedule...' />;
  }
  return (
    <> < div className="container-fluid appointment-banner p-0" > <div
      className='container vh-100 vw-100 d-flex justify-content-center align-items-center'>
      <div className="d-flex flex-column p-5 bg-light-subtle opacity-75">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Schedule an appointment</h4>
          <h4 className="fw-bold mb-0">&#x20A6;10,000</h4>
        </div>
        <p className="text-gray-100 mb-0">Your details are safe with us</p>
        <hr />
        <form onSubmit={subAppointment}>
          <div className="d-flex flex-column gap-2">
            <h4 className="text-dark fw-bold text-capitalize">Enter customer details</h4>
            <div className="d-md-flex gap-3 mb-2">
              <input
                className="form-control p-3 rounded shadow mb-3 h-[40px]"
                type="text"
                name="first_name"
                placeholder="First Name"
                required="required"
                onChange={handleChange}
                value={formData.first_name} />
              <input
                className="form-control p-3 rounded shadow mb-3 h-[40px]"
                type="text"
                name="last_name"
                placeholder="Last Name"
                required="required"
                onChange={handleChange}
                value={formData.last_name} />
            </div>
            <div className="d-md-flex gap-3 mb-2">
              <input
                className="form-control p-3 rounded shadow mb-3 h-[40px]"
                type="email"
                name="email_address"
                placeholder="Email Address"
                required="required"
                onChange={handleChange}
                value={formData.email_address} />
              <input
                className="form-control p-3 rounded shadow mb-3 h-[40px]"
                type="text"
                name="phone_number"
                placeholder="Phone Number"
                required="required"
                onChange={handleChange}
                value={formData.phone_number} />
            </div>
            <h4 className="text-dark fw-bold text-capitalize">Choose Your method of appointment</h4>
            <div className="d-md-flex gap-3 mb-2">
              <select
                className="form-control p-3 rounded shadow mb-3 h-[40px]"
                value={formData.how_to_contact}
                name="how_to_contact"
                onChange={handleChange}>
                <option value="">How can we contact you?</option>
                <option value="WhatsApp Call">WhatsApp Call</option>
                <option value="Zoom">Zoom</option>
              </select>
              <select
                className="form-control p-3 rounded shadow mb-3 h-[40px]"
                value={formData.reason}
                name="reason"
                onChange={handleChange}>
                <option value="">Reason for the appointment</option>
                <option value="Visa">Visa</option>
                <option value="Permit">Permit</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="d-md-flex gap-3 mb-2">
              <input
                className="form-control p-3 rounded shadow h-[40px]"
                type="date"
                name="appointment_date"
                required
                onChange={handleChange}
                value={formData.appointment_date}
              />
              <input
                className="form-control p-3 rounded shadow h-[40px]"
                type="time"
                name="appointment_time"
                required
                onChange={handleChange}
                value={formData.appointment_time}
              />
            </div>
            <input type="hidden" value={formData.amount_to_pay} name="amount_to_pay" />
            <button type="submit" disabled={!isLoaded || error} className="border-0 p-3 bg-primary text-white rounded">
              {error ? 'CAPTCHA Error' : isLoaded ? 'Schedule Now' : 'Loading...'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
    </>
  )
}