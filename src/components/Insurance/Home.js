import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import BookingPng from '../../assets/images/vb.png';

const Home = () => {
  const navigate = useNavigate();
  const [ message, setMessage ] = useState("");
  const [ formData, setFormData ] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone_number: "",
    contact_email: "",
    date_of_birth: "",
    passport_number: "",
    address: "",
    occupation: "",
    gender: "",
    marital_status: "",
    travel_type: "",
    purpose_travel: "",
    other_reason: "",
    next_of_kin: "",
    next_of_kin_address: "",
    relationship: "",
    coverage_begin: "",
    coverage_end: "",
    destination: "",
    more_ninety: "",
    medical_condition: "",
    more_medical_condition: "",
    heard_policy: "",
    upload_signature: null,
    amount_to_pay: 0,
});
const [ loading, setLoading ] = useState(false);
const [ sevenDays, setSevenDays ] = useState(false);
const [ fifteenDays, setFifteenDays ] = useState(false);
const [ thirtyDays, setThirtyDays ] = useState(false);
const [ ninetyDays, setNinetyDays ] = useState(false);
const [ oneYear, setOneYear ] = useState(false);

const calculateAmount = useCallback(() => {
    let amount = 0;
    if (sevenDays) amount += 15350;
    if (fifteenDays) amount += 25350;
    if (thirtyDays) amount += 43000;
    if (ninetyDays) amount += 51000;
    if (oneYear) amount += 95000;
    return amount;
  }, [sevenDays, fifteenDays, thirtyDays, ninetyDays, oneYear]); 

  // Calculate amount whenever service selections change
  useEffect(() => {
      const newAmount = calculateAmount();
      setFormData(prev => ({
          ...prev,
          amount_to_pay: newAmount
      }));
  }, [calculateAmount, sevenDays, fifteenDays, thirtyDays, ninetyDays, oneYear]);

const handleChange = (e) => {
  const { name, type, value, checked, files } = e.target;

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: type === "file" ? (files.length > 0 ? files[0] : null) :
        type === "checkbox" ? (checked ? value : "") : 
        value,
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const currentAmount = calculateAmount();
        const updatedFormData = {
            ...formData,
            amount_to_pay: currentAmount
        };
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

if (!updatedFormData.contact_email || !updatedFormData.phone_number) {
    alert('Please complete your contact information first');
    return;
}

  // Append text fields
//   Object.keys(formData).forEach(key => {
//       formDataObj.append(key, formData[key]);
//   });

  setLoading(true);

  try {
      const response = await fetch("https://toogood-1.onrender.com/insurance/application", {
          method: "POST",
          body: formDataObj,

          headers: {
            "Accept": "application/json"
          }
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({  
          first_name: "",
          middle_name: "",
          last_name: "",
          phone_number: "",
          contact_email: "",
          date_of_birth: "",
          passport_number: "",
          address: "",
          occupation: "",
          gender: "",
          marital_status: "",
          travel_type: "",
          purpose_travel: "",
          other_reason: "",
          next_of_kin: "",
          next_of_kin_address: "",
          relationship: "",
          coverage_begin: "",
          coverage_end: "",
          destination: "",
          more_ninety: "",
          medical_condition: "",
          more_medical_condition: "",
          heard_policy: "",
          upload_signature: null,
          amount_to_pay: 0,
        });
        if (response.ok) {
            // Redirect to payment page with necessary details
            navigate(`/complete-insurance`, {
                state: {
                    booking_id: data.id,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone_number: formData.phone_number,
                    contact_email: formData.contact_email,
                    amount_to_pay: formData.amount_to_pay,
                },
            });
        } else {
            alert(`Error: ${data.message}`);
        }
      }
      setMessage(data.message);
      console.log(data);
  } catch (error) {
      console.error("Application Error:", error);
      alert("Failed to submit insurance application. Try again later");
  } finally {
    setLoading(false);
  }
};

    if (loading) {
        return <Loading message='Submitting insurance application...' />;
    }
  return (
    <>
        {loading && <Loading message='Submitting insurance application...'/>}
        <div className='container py-4'>
            <div className='d-md-flex justify-content-center align-items-center gap-2'>
            <div>
            <img src={BookingPng} alt="Booking" className='w-100' />
            </div>
            <div>
            <h2 className='mb-3'>Travel Insurance Application</h2>
            <h6 style={{fontStyle: 'italic', fontWeight: 'bolder'}}>Please read the declaration below before filling the form:</h6>
            <p>
            a) I/We desire to effect insurance in the terms of the usual policy of health insurance and declare that the above statements and particulars are true. I/We further declare that this proposal shall be the basis of the contract between me/us and the company and that I/We will not expect any additional payment from the company for claims exceeding the maximum amount of liability.<br/><br/>
            b) I further declare that all insured person(s) is in good state of health and fit to travel
            </p>
            </div>
            </div>
            {message && <p className="text-center text-red-500">{message}</p>}
            <form style={{fontSize: '0.8rem'}} onSubmit={handleSubmit}>
            <div className='d-md-flex mb-3 bg-white rounded shadow'>
                <div className='col-12 col-md-12 d-flex flex-column gap-1 py-4 px-2'>
                    <h6>Select insurance coverage you would like to apply for and the system will auto-generate your charges</h6>
                    <div className='bg-primary-subtle p-2 rounded d-flex gap-2 justify-content-center align-items-center' style={{width: '220px'}}>
                        <span className='fw-bold'>Amount: </span> <span className='fw-bold'>&#x20A6;{Number(formData.amount_to_pay).toLocaleString()}</span>
                    </div>
                    <div className='d-md-flex gap-2 p-2'>
                        <div className='d-md-flex mb-3 justify-content-center align-items-center gap-2'>
                        <input type='radio' name='insurance_coverage' onChange={(e) => { setSevenDays(true); setFifteenDays(false); setThirtyDays(false); setNinetyDays(false); setOneYear(false); }} />
                        <label>7 Days: &#x20A6;15,350</label>
                        </div>
                        <div className='d-md-flex mb-3 justify-content-center align-items-center gap-2'>
                        <input type='radio' name='insurance_coverage' onChange={(e) => { setSevenDays(false); setFifteenDays(true); setThirtyDays(false); setNinetyDays(false); setOneYear(false); }} />
                        <label>15 Days: &#x20A6;25,350</label>
                        </div>
                        <div className='d-md-flex mb-3 justify-content-center align-items-center gap-2'>
                        <input type='radio' name='insurance_coverage' onChange={(e) => { setSevenDays(false); setFifteenDays(false); setThirtyDays(true); setNinetyDays(false); setOneYear(false); }} />
                        <label>30 Days: &#x20A6;43,000</label>
                        </div>
                        <div className='d-md-flex mb-3 justify-content-center align-items-center gap-2'>
                        <input type='radio' name='insurance_coverage' onChange={(e) => { setSevenDays(false); setFifteenDays(false); setThirtyDays(false); setNinetyDays(true); setOneYear(false); }} />
                        <label>90 Days: &#x20A6;51,000</label>
                        </div>
                        <div className='d-md-flex mb-3 justify-content-center align-items-center gap-2'>
                        <input type='radio' name='insurance_coverage' onChange={(e) => { setSevenDays(false); setFifteenDays(false); setThirtyDays(false); setNinetyDays(false); setOneYear(true); }} />
                        <label>1 Year: &#x20A6;95,000</label>
                        </div>
                    </div>
                    <span className='text-danger' style={{fontSize: '0.8rem'}}>*For coverage more than 35K and years more than 60 years. Please chat our support for price</span>
                </div>
            </div>
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
            <div className='d-md-flex mb-3 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Phone Number</label>
                    <input name='phone_number' value={formData.phone_number} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Contact Email</label>
                    <input name='contact_email' value={formData.contact_email} type='email' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Applicant Address</label>
                    <input name='address' value={formData.address} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                {/* <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Date of Birth</label>
                    <input name='date_of_birth' value={formData.date_of_birth} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div> */}
            </div>
            {/* <div className='d-md-flex mb-3 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Applicant Address</label>
                    <input name='address' value={formData.address} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Occupation</label>
                    <input name='occupation' value={formData.occupation} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Gender</label>
                    <div className='d-flex gap-2 p-2'>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Male: </label>
                      <input name='gender' type='radio' value='Male' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Female: </label>
                      <input name='gender' type='radio' value='Female' onChange={handleChange} required/>
                      </div>
                    </div>
                </div>
            </div> */}
            {/* <div className='d-md-flex mb-3 bg-white rounded shadow'>
            <div className='col-12 col-md-3 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Marital Status</label>
                    <div className='d-flex gap-2 p-2'>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Single: </label>
                      <input name='marital_status' type='radio' value='Single' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Married: </label>
                      <input name='marital_status' type='radio' value='Married' onChange={handleChange} required/>
                      </div>
                    </div>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Travel Type</label>
                    <div className='d-flex gap-2 p-2'>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Individual: </label>
                      <input name='travel_type' type='radio' value='Individual' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Family: </label>
                      <input name='travel_type' type='radio' value='Family' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Group: </label>
                      <input name='travel_type' type='radio' value='Group' onChange={handleChange} required/>
                      </div>
                    </div>
                </div>
                <div className='col-12 col-md-5 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Purpose of Travel</label>
                    <div className='d-flex gap-2 p-2'>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Vacation: </label>
                      <input name='purpose_travel' type='radio' value='Vacation' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Medical Treatment: </label>
                      <input name='purpose_travel' type='radio' value='Medical Treatment' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Sport: </label>
                      <input name='purpose_travel' type='radio' value='Sport' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Training: </label>
                      <input name='purpose_travel' type='radio' value='Training' onChange={handleChange} required/>
                      </div>
                    </div>
                </div>
            </div>
            <div className='d-md-flex mb-4 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Other Reason(s)</label>
                    <input name='other_reason' value={formData.other_reason} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0'/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Passport Number</label>
                    <input name='passport_number' value={formData.passport_number} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Next of Kin</label>
                    <input name='next_of_kin' value={formData.next_of_kin} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div> */}
            <div className='d-md-flex mb-4 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Occupation</label>
                    <input name='occupation' value={formData.occupation} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Next of Kin</label>
                    <input name='next_of_kin' value={formData.next_of_kin} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Next of Kin Address</label>
                    <input name='next_of_kin_address' value={formData.next_of_kin_address} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                
                {/* <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Relationship with Next of Kin</label>
                    <input name='relationship' value={formData.relationship} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div> */}
                
                {/* <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Destination</label>
                    <input name='destination' value={formData.destination} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div> */}
            </div>
            <div className='d-md-flex mb-4 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Destination</label>
                    <input name='destination' value={formData.destination} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Coverage Begins</label>
                    <input name='coverage_begin' value={formData.coverage_begin} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Coverage Ends</label>
                    <input name='coverage_end' value={formData.coverage_end} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                {/* <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Do you intend to stay in any one country for more than 90 days?</label>
                    <div className='d-flex gap-2 p-2'>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Yes: </label>
                      <input name='more_ninety' type='radio' value='Yes' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>No: </label>
                      <input name='more_ninety' type='radio' value='No' onChange={handleChange} required/>
                      </div>
                    </div>
                </div> */}
            </div>
            <div className='d-md-flex mb-4 bg-white rounded shadow'>
            <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Do you intend to stay in any one country for more than 90 days?</label>
                    <div className='d-flex gap-2 p-2'>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Yes: </label>
                      <input name='more_ninety' type='radio' value='Yes' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>No: </label>
                      <input name='more_ninety' type='radio' value='No' onChange={handleChange} required/>
                      </div>
                    </div>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Do you have a pre-existing medical condition(s)?</label>
                    <div className='d-flex gap-2 p-2'>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>Yes: </label>
                      <input name='medical_condition' type='radio' value='Yes' onChange={handleChange} required/>
                      </div>
                      <div className='d-flex justify-content-center align-items-center gap-2'><label>No: </label>
                      <input name='medical_condition' type='radio' value='No' onChange={handleChange} required/>
                      </div>
                    </div>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>If Yes, please state:</label>
                    <input name='more_medical_condition' value={formData.more_medical_condition} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0'/>
                </div>
                {/* <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>How did you hear about this Travel Insurance Policy?</label>
                    <input name='heard_policy' value={formData.heard_policy} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0'/>
                </div> */}
            </div>
            <div className='d-md-flex mb-4 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Upload Passport Data Page</label>
                    <input name='upload_signature' type='file' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div>
            <input name='amount_to_pay' type='hidden' value={formData.amount_to_pay} onChange={handleChange} />
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