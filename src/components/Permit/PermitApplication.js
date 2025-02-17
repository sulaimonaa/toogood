import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from '../Loading';

const PermitApplication = () => {
    const { id } = useParams()
    const [visaById, setVisaById] = useState({
        destination: "",
        visa_price: "",
        available_country: "",
      });
    const [ formData, setFormData ] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        phone_number: "",
        contact_email: "",
        date_of_birth: "",
        passport_number: "",
        data_page: null,
        passport_photograph: null,
        utility_bill: null,
        supporting_document: null,
        other_document: null,
    })

    const [loading, setLoading ] = useState(false);
    

    useEffect(() => {
        if (!id) return;
        const fetchVisaById = async () => {
            try {
                const response = await fetch(`https://toogood-1.onrender.com/permit/destinations/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch permit destinations");
                }
                const data = await response.json();
                setVisaById(data);
            } catch (error) {
                console.log(error.message)
            }
        }

        fetchVisaById()
    }, [id])

    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
    
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "file" ? (files.length > 0 ? files[0] : null) :
                type === "number" ? (value === "" ? "" : Number(value)) : 
                value,
        }));
    };
    

    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataObj = new FormData();
    
        // Append text fields
        Object.keys(formData).forEach(key => {
            formDataObj.append(key, formData[key]);
        });
        formDataObj.append("visa_destination", visaById.destination);
        formDataObj.append("visa_fee", visaById.visa_price);

        setLoading(true);
    
        try {
            const response = await fetch("https://toogood-1.onrender.com/permit/application", {
                method: "POST",
                body: formDataObj
            });
    
            const data = await response.json();
            if (response.ok) {
                // Redirect to payment page with necessary details
                navigate(`/complete-permit`, {
                    state: {
                        destination: visaById.destination,
                        price: visaById.visa_price,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                    },
                });
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Application Error:", error);
            alert("Failed to submit permit application.");
        } finally {
            setLoading(false);
        }
    };
    
    
  return (
    <>
        {loading && <Loading message='Submitting permit application...'/>}
        <div className='container'>
        <div className='spacer'></div>
        <h4>Visa Destination: {visaById.destination}</h4>
        <h5 className='mb-2'>Processing Fee: &#x20A6;{Number(visaById.visa_price).toLocaleString()}</h5>
        <h6 className='mb-2 fw-bold' style={{fontStyle: 'italic'}}>Permit applying for: {visaById.available_country} </h6>
        <div className='spacer'></div>
        <h6 className='text-secondary-subtle'>Complete the form below with valid information.</h6>
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
                    <label>Date of Birth</label>
                    <input name='date_of_birth' value={formData.date_of_birth} type='date' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div>
            <div className='d-md-flex mb-3 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Passport Number</label>
                    <input name='passport_number' value={formData.passport_number} type='text' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Upload Data Page</label>
                    <input name='data_page' type='file' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Upload Passport Photo</label>
                    <input name='passport_photograph' type='file' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' required/>
                </div>
            </div>
            <div className='d-md-flex mb-4 bg-white rounded shadow'>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Bank Statement</label>
                    <input name='utility_bill' type='file' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' />
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Supporting Document - Insurance</label>
                    <input name='supporting_document' type='file' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' />
                </div>
                <div className='col-12 col-md-4 d-flex flex-column gap-1 py-4 px-2'>
                    <label>Other Document</label>
                    <input name='other_document' type='file' onChange={handleChange} className='p-2 rounded bg-secondary-subtle border-0' />
                </div>
            </div>
            <input type='hidden' name='visa_destination' value={visaById.destination} />
            <input type='hidden' name='visa_fee' value={visaById.visa_price} />
            <input type='submit' disabled={loading}  className='p-2 px-md-4 rounded-pill bg-primary text-white fw-bold border-0' value='Complete Application & Proceed to Payment' style={{fontSize: '0.8rem'}}/>
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

export default PermitApplication