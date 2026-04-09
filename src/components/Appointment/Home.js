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
  const { isLoaded, error, executeRecaptcha } = useRecaptcha('6Lc__bkrAAAAANXv3oBEBIsjH6NJeW5KGiALifM_', 'v3');
  const [amount_to_pay, setAmountToPay] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
    phone_number: '',
    selected_country: selectedCountry,
    appointment_date: '',
    amount_to_pay: amount_to_pay,
    upload_file: null
  })

  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, type, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "number"
        ? (value === "" ? "" : Number(value))
        : value
    }));
  }, []);

  const handleAmountSelect = useCallback((e) => {
    const value = Number(e.target.value);
    setAmountToPay(value);
    setFormData(prev => ({ ...prev, amount_to_pay: value }));
  }, []);

  useEffect(() => {
    let country = '';
    switch (amount_to_pay) {
      case 270000:
        country = 'USA';
        break;
      case 230000:
        country = 'Germany/Spain/Mexico/Italy/Netherlands/Norway';
        break;
      case 220000:
        country = 'France';
        break;
      case 240000:
        country = 'Bulgaria';
        break;
      case 250000:
        country = 'Hungary/Iceland';
        break;
      case 200000:
        country = 'Austria';
        break;
      default:
        country = '';
    }
    setSelectedCountry(country);
    setFormData(prev => ({ ...prev, selected_country: country }));
  }, [amount_to_pay]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files && e.target.files[0];
    setFormData(prev => ({ ...prev, upload_file: file || null }));
  }, []);

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

      let response;
      // If a file is present, use FormData (multipart)
      if (formData.upload_file) {
        const body = new FormData();
        body.append('first_name', formData.first_name);
        body.append('last_name', formData.last_name);
        body.append('email_address', formData.email_address);
        body.append('phone_number', formData.phone_number);
        body.append('appointment_date', formData.appointment_date);
        body.append('selected_country', selectedCountry);
        body.append('amount_to_pay', formData.amount_to_pay);
        body.append('recaptcha_token', token);
        body.append('upload_file', formData.upload_file);

        response = await fetch("https://toogood-1.onrender.com/visa/appointment", {
          method: "POST",
          body // browser will set Content-Type with boundary
        });
      } else {
        // No file: send JSON
        const payload = { ...formData, recaptcha_token: token };
        response = await fetch("https://toogood-1.onrender.com/visa/appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (response.ok) {
        setFormData({
          first_name: '',
          last_name: '',
          email_address: '',
          phone_number: '',
          appointment_date: '',
          selected_country: selectedCountry,
          amount_to_pay: 0,
          upload_file: null
        });

        navigate(`/apt-payment`, {
          state: {
            tnx_id: data.id,
            last_name: formData.last_name,
            first_name: formData.first_name,
            phone_number: formData.phone_number,
            email_address: formData.email_address,
            amount_to_pay: formData.amount_to_pay,
            selected_country: selectedCountry
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
          <h4 className="fw-bold mb-0">&#x20A6;{Number(amount_to_pay).toLocaleString()}</h4>
        </div>
        <p className="text-gray-100 mb-0">Your details are safe with us!<br />
          We value your privacy and ensure that your information is kept confidential. Please, provide correct information.</p>
        <hr />
        <form onSubmit={subAppointment}>
          <div className="d-flex flex-column gap-2">
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
            <div className="d-md-flex gap-3 mb-2">
              <div className="d-flex flex-column gap-1 w-100">
                <label htmlFor="amount_to_pay" className="form-label mb-0">Select country to get fees</label>
                <select
                  className="form-control p-3 rounded shadow mb-3 h-[40px]"
                  name="amount_to_pay"
                  value={amount_to_pay}
                  onChange={handleAmountSelect}
                >
                  <option value={0}>Select service amount</option>
                  <option value={270000}>🇺🇸 USA – &#x20A6;270k </option>
                  <option value={230000}>🇩🇪 Germany – &#x20A6;230k</option>
                  <option value={220000}>🇫🇷 France – &#x20A6;220k</option>
                  <option value={230000}>🇪🇸 Spain – &#x20A6;230k</option>
                  <option value={230000}>🇲🇽 Mexico – &#x20A6;230k</option>
                  <option value={240000}>🇧🇬 Bulgaria – &#x20A6;240k</option>
                  <option value={230000}>🇮🇹 Italy – &#x20A6;230k</option>
                  <option value={250000}>🇭🇺 Hungary – &#x20A6;250k</option>
                  <option value={200000}>🇦🇹 Austria – &#x20A6;200k</option>
                  <option value={230000}>🇳🇱 Netherlands – &#x20A6;230k</option>
                  <option value={230000}>🇳🇴 Norway – &#x20A6;230k</option>
                  <option value={250000}>🇮🇸 Iceland – &#x20A6;250k</option>
                </select>
              </div>
            </div>
            <div className="d-md-flex gap-3 mb-2">
              <div className="d-flex flex-column gap-1 formDualContainer" >
                <label htmlFor="file-upload" className="form-label mb-0">Upload supporting document (optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="form-control p-3 rounded shadow mb-3 h-[40px]"
                  name="upload_file"
                />
              </div>
              <div className="d-flex flex-column gap-1 formDualContainer" >
                <label htmlFor="appointment_date" className="form-label mb-0">Select appointment date  (Not guaranteed)</label>
                <input
                  className="form-control p-3 mb-0 rounded shadow h-[40px]"
                  type="date"
                  name="appointment_date"
                  required
                  onChange={handleChange}
                  value={formData.appointment_date}
                />
              </div>
            </div>
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