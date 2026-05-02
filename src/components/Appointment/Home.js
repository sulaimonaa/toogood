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
    selected_country: '',
    appointment_date: '',
    amount_to_pay: 0,
    service_charge: 50000,
    upload_file: null
  });

  const navigate = useNavigate();

  const countryOptions = [
    { country: 'USA', amount: 220000, label: '🇺🇸 USA – ₦220,000' },
    { country: 'Germany', amount: 180000, label: '🇩🇪 Germany – ₦180,000' },
    { country: 'France', amount: 170000, label: '🇫🇷 France – ₦170,000' },
    { country: 'Spain', amount: 180000, label: '🇪🇸 Spain – ₦180,000' },
    { country: 'Mexico', amount: 180000, label: '🇲🇽 Mexico – ₦180,000' },
    { country: 'Bulgaria', amount: 190000, label: '🇧🇬 Bulgaria – ₦190,000' },
    { country: 'Italy', amount: 180000, label: '🇮🇹 Italy – ₦180,000' },
    { country: 'Hungary', amount: 200000, label: '🇭🇺 Hungary – ₦200,000' },
    { country: 'Austria', amount: 150000, label: '🇦🇹 Austria – ₦150,000' },
    { country: 'Netherlands', amount: 180000, label: '🇳🇱 Netherlands – ₦180,000' },
    { country: 'Norway', amount: 180000, label: '🇳🇴 Norway – ₦180,000' },
    { country: 'Iceland', amount: 200000, label: '🇮🇸 Iceland – ₦200,000' },
  ];

  // Ensure formData stays in sync when selectedCountry or amount_to_pay change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      selected_country: selectedCountry,
      amount_to_pay: amount_to_pay
    }));
  }, [selectedCountry, amount_to_pay]);

  const handleCountrySelect = useCallback((e) => {
    const val = e.target.value;
    if (!val) {
      setSelectedCountry('');
      setAmountToPay(0);
      setFormData(prev => ({ ...prev, selected_country: '', amount_to_pay: 0 }));
      return;
    }
    const [amt, country] = val.split('|');
    const amountNum = Number(amt);
    setAmountToPay(amountNum);
    setSelectedCountry(country);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, type, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "number"
        ? (value === "" ? "" : Number(value))
        : value
    }));
  }, []);

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

      // snapshot values to use after reset
      const payloadFirst = formData.first_name;
      const payloadLast = formData.last_name;
      const payloadPhone = formData.phone_number;
      const payloadEmail = formData.email_address;
      const payloadAmount = amount_to_pay;
      const payloadService = formData.service_charge;
      const payloadCountry = selectedCountry;

      let response;
      if (formData.upload_file) {
        const body = new FormData();
        body.append('first_name', formData.first_name);
        body.append('last_name', formData.last_name);
        body.append('email_address', formData.email_address);
        body.append('phone_number', formData.phone_number);
        body.append('appointment_date', formData.appointment_date);
        body.append('selected_country', payloadCountry);
        body.append('amount_to_pay', payloadAmount);
        body.append('service_charge', payloadService);
        body.append('recaptcha_token', token);
        body.append('upload_file', formData.upload_file);

        response = await fetch("https://toogood-1.onrender.com/visa/appointment", {
          method: "POST",
          body
        });
      } else {
        const payload = {
          ...formData,
          selected_country: payloadCountry,
          amount_to_pay: payloadAmount,
          recaptcha_token: token
        };
        response = await fetch("https://toogood-1.onrender.com/visa/appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await (async () => {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) return await response.json();
        const text = await response.text();
        try { return JSON.parse(text); } catch { return { message: text }; }
      })();

      if (response.ok) {
        // reset form
        setFormData({
          first_name: '',
          last_name: '',
          email_address: '',
          phone_number: '',
          selected_country: '',
          appointment_date: '',
          amount_to_pay: 0,
          service_charge: 50000,
          upload_file: null
        });
        setSelectedCountry('');
        setAmountToPay(0);

        navigate(`/apt-payment`, {
          state: {
            tnx_id: data.id,
            last_name: payloadLast,
            first_name: payloadFirst,
            phone_number: payloadPhone,
            email_address: payloadEmail,
            amount_to_pay: payloadAmount,
            service_charge: payloadService,
            selected_country: payloadCountry
          }
        });
      } else {
        alert(`Error: ${data?.message || 'Unknown server error'}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message='Making appointment schedule...' />;
  }

  return (
    <div className="container-fluid appointment-banner p-0">
      <div className='container py-5 d-flex justify-content-center align-items-start align-items-md-center'>
        <div className="d-flex flex-column p-4 bg-light-subtle rounded" style={{ width: '100%', maxWidth: 980, maxHeight: '85vh', overflowY: 'auto' }}>
          <div className="d-flex flex-column align-items-center flex-md-row justify-content-md-between p-4 p-md-0 bg-light-subtle rounded">
            <h4 className="fw-bold mb-0 text-center text-md-start">Schedule an appointment</h4>
            <div className="d-flex flex-column align-items-end gap-1">
              <div className="d-flex flex-row align-items-end gap-1">
                <h6 className="fw-bold mb-0" style={{ fontSize: "0.8rem" }}>Appointment Fee:</h6>
                <h6 className="fw-bold mb-0 text-gray-100" style={{ fontSize: "0.8rem" }}>&#x20A6;{Number(amount_to_pay).toLocaleString()}</h6>
              </div>
              <div className="d-flex flex-row align-items-end gap-1">
                <h6 className="fw-bold mb-0" style={{ fontSize: "0.8rem" }}>Service Charge:</h6>
                <h6 className="fw-bold mb-0 text-gray-100" style={{ fontSize: "0.8rem" }}>&#x20A6;{Number(formData.service_charge).toLocaleString()}</h6>
              </div>
              <div className="d-flex flex-row align-items-end gap-1">
                <h6 className="fw-bold mb-0" style={{ fontSize: "0.8rem" }}>Total Amount Due:</h6>
                <h6 className="fw-bold mb-0 text-gray-100" style={{ fontSize: "0.8rem" }}>&#x20A6;{Number(amount_to_pay + formData.service_charge).toLocaleString()}</h6>
              </div>
            </div>
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
                  required
                  onChange={handleChange}
                  value={formData.first_name} />
                <input
                  className="form-control p-3 rounded shadow mb-3 h-[40px]"
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  required
                  onChange={handleChange}
                  value={formData.last_name} />
              </div>

              <div className="d-md-flex gap-3 mb-2">
                <input
                  className="form-control p-3 rounded shadow mb-3 h-[40px]"
                  type="email"
                  name="email_address"
                  placeholder="Email Address"
                  required
                  onChange={handleChange}
                  value={formData.email_address} />
                <input
                  className="form-control p-3 rounded shadow mb-3 h-[40px]"
                  type="text"
                  name="phone_number"
                  placeholder="Phone Number"
                  required
                  onChange={handleChange}
                  value={formData.phone_number} />
              </div>

              <div className="d-md-flex gap-3 mb-2">
                <div className="d-flex flex-column gap-1 w-100">
                  <label className="form-label mb-0">Select country to get fees</label>
                  <select
                    className="form-control p-3 rounded shadow mb-3 h-[40px]"
                    name="selected_country"
                    value={selectedCountry ? `${amount_to_pay}|${selectedCountry}` : ''}
                    onChange={handleCountrySelect}
                  >
                    <option value=''>Select country & fee</option>
                    {countryOptions.map(opt => (
                      <option key={opt.country} value={`${opt.amount}|${opt.country}`}>
                        {opt.country} - &#x20A6;{opt.amount.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-md-flex gap-3 mb-2">
                <div className="d-flex flex-column gap-1 formDualContainer" >
                  <label className="form-label mb-0">Upload supporting document (optional)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="form-control p-3 rounded shadow mb-3 h-[40px]"
                    name="upload_file"
                  />
                </div>
                <div className="d-flex flex-column gap-1 formDualContainer" >
                  <label className="form-label mb-0">Select appointment date  (Not guaranteed)</label>
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

              <input type="hidden" name="service_charge" value={formData.service_charge} />
              <button type="submit" disabled={!isLoaded || error} className="border-0 p-3 bg-primary text-white rounded">
                {error ? 'CAPTCHA Error' : isLoaded ? 'Schedule Now' : 'Loading...'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}