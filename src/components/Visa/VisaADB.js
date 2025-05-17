import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import Slider from '../Slider';
import Nav1 from '../Nav/Nav1';
import Footer from '../Footer';
import Circles from 'react-loading-icons/dist/esm/components/circles';

const VisaADB = () => {
  // Full country list
  const allCountries = [
    "Nigeria", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
    "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
    "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
    "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
    "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Dubai", "Ecuador",
    "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
    "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
    "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
    "India", "Indonesia", "Iran", "Iraq", "Ireland",
    "Israel", "Italy", "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
    "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "North Korea", "North Macedonia", "Norway"
  ];

  // State management
  const [formData, setFormData] = useState({
    originCountry: '',
    destination: ''
  });
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [filteredCountries, setFilteredDestinations] = useState([]);
  const [isFetchingDestinations, setIsFetchingDestinations] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token"); 
  const navigate = useNavigate();

  // Filter countries based on search term
  useEffect(() => {
    if(!token) {
        <div>You need to login as agent to access page</div>
        setTimeout(navigate('../login'), 5000);
    }

    const fetchDestinations = async () => {
      try {
        const response = await fetch('https://toogood-1.onrender.com/visa/available-destinations');
        if (!response.ok) {
          throw new Error('Failed to fetch available destinations');
        }
        const { data } = await response.json();
        
        // Extract unique destination names from API response
        const uniqueDestinations = [...new Set(data.map(item => item.destination))];
        setAvailableDestinations(uniqueDestinations);
        setFilteredDestinations(uniqueDestinations);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching destinations:', err);
      } finally {
        setIsFetchingDestinations(false);
      }
    };

    fetchDestinations();
  }, [token, navigate]);

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm) {
      setFilteredDestinations(
        availableDestinations.filter(destination =>
          destination.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredDestinations(availableDestinations);
    }
  }, [searchTerm, availableDestinations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country) => {
    setFormData({ ...formData, destination: country });
    setShowDropdown(false);
    setSearchTerm('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const checkDestinationAvailability = async () => {
    if (!formData.originCountry || !formData.destination) {
      setError('Please select both origin country and destination');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://toogood-1.onrender.com/visa/available-destinations?origin=${encodeURIComponent(formData.originCountry)}&search=${encodeURIComponent(formData.destination)}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const { data } = await response.json();
      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        setError('No visa options found for this destination');
      }

      navigate('/visa-agent-results', {
        state: {
          originCountry: formData.originCountry,
          destination: formData.destination,
          searchResults: data
        }
      });
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading message="Checking Permit Availability..."/>;
  return (
    <>
    <Nav1 />
    <Slider />
      <div className='search-container' style={{position: 'absolute', zIndex: '1', top: '5rem', width: '100%'}}>
        <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-3' style={{height: '100vh'}}>
          <h3 className='text-center text-white fw-bold w-75 mb-0'>TooGood Travels -  Trusted Global Permit Assistant</h3>
          <h6 className='text-center text-white fw-light mb-0 mb-md-5'>Simplify the way you get a Permit</h6>
          <div className='vForm' style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '24px', color: '#ffffff', fontWeight: 'bold' }}>Check Available E-Permit</h4>
          
          {error && (
            <div style={{
              color: 'red',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid #ffcccc',
              borderRadius: '4px',
              backgroundColor: '#fff0f0'
            }}>
              {error}
            </div>
          )}

          <div className='d-md-flex justify-content-center'>
          {/* Origin Country Select */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#fff' }}>
              Your Nationality:
            </label>
            <select
              name="originCountry"
              value={formData.originCountry}
              onChange={handleChange}
              disabled={isLoading}
              className='form-select-origin'
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
            >
              <option value="">Select Your Nationality</option>
              {allCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          {/* Destination Search */}
          <div style={{ marginBottom: '20px', position: 'relative' }} ref={dropdownRef}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#fff' }}>
              Traveling to:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={(e) => {
                  setFormData({ ...formData, destination: e.target.value });
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Which country?"
                className='form-control-destination'
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '16rem',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 6px 6px',
                  backgroundColor: 'white',
                  zIndex: 1000,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map(country => (
                      <div
                        key={country}
                        onClick={() => handleCountrySelect(country)}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                          backgroundColor: formData.destination === country ? '#f5f5f5' : 'white',
                          ':hover': {
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      >
                        {country}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px', color: '#666' }}>
                      <Circles fill="#00FF00"/> loading available visas...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              <span className='invisible'>Submit</span>
            </label>
          <button
            onClick={checkDestinationAvailability}
            disabled={isLoading || !formData.originCountry || !formData.destination}
            className='btn-primary-visa'
            style={{
              width: '100%',
              padding: '12px',
              background: isLoading ? '#cccccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'background 0.3s'
            }}
          >
            {isLoading ? 'Checking Availability...' : 'Search Permit'}
          </button>
          </div>
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VisaADB;