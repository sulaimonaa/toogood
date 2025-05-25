import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const Accounting = () => {
    const [totalPaidFees, setTotalPaidFees] = useState(0);
    const [totalNotPaid, setTotalNotPaid] = useState(0);
    const [totalPaidPermit, setTotalPaidPermit] = useState(0);
    const [totalNotPaidPermit, setTotalNotPaidPermit] = useState(0);
    const [totalPaidVSFees, setTotalPaidVSFees] = useState(0);
    const [totalNotPaidVSFees, setTotalNotPaidVSFees] = useState(0);
    const [totalPaidIFees, setTotalPaidIFees] = useState(0);
    const [totalNotPaidIFees, setTotalNotPaidIFees] = useState(0);
    const [ allPayment, setAllPayment ] = useState(0);

    useEffect(() => {
        axios.get('https://toogood-1.onrender.com/admin/total-paid-fees') 
            .then(response => {
                setTotalPaidFees(response.data.total_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });

            axios.get('https://toogood-1.onrender.com/admin/total-not-paid-fees') 
            .then(response => {
                setTotalNotPaid(response.data.total_not_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });

            axios.get('https://toogood-1.onrender.com/admin/total-paid-permit') 
            .then(response => {
                setTotalPaidPermit(response.data.total_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });

            axios.get('https://toogood-1.onrender.com/admin/total-not-paid-permit') 
            .then(response => {
                setTotalNotPaidPermit(response.data.total_not_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });
            axios.get('https://toogood-1.onrender.com/admin/total-paid-vs-fees') 
            .then(response => {
                setTotalPaidVSFees(response.data.total_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });
            axios.get('https://toogood-1.onrender.com/admin/total-not-paid-vs-fees') 
            .then(response => {
                setTotalNotPaidVSFees(response.data.total_not_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });
            axios.get('https://toogood-1.onrender.com/admin/total-paid-ins-fees') 
            .then(response => {
                setTotalPaidIFees(response.data.total_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });
            axios.get('https://toogood-1.onrender.com/admin/total-not-paid-ins-fees') 
            .then(response => {
                setTotalNotPaidIFees(response.data.total_not_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });
    }, []);

    useEffect(() => {
        const cleanNumber = (value) => Number((value || '0').toString().replace(/,/g, ''));
    
        setAllPayment(
            cleanNumber(totalPaidFees) +
            cleanNumber(totalPaidPermit) +
            cleanNumber(totalPaidVSFees) +
            cleanNumber(totalPaidIFees)
        );
    }, [totalPaidFees, totalPaidPermit, totalPaidVSFees, totalPaidIFees]);
  return (
    
    <>
    <div style={{background: '#f8f8f8'}} className='rounded pt-3'>
    <h4 className='mb-3 py-2 px-4 rounded' style={{background: '#f8f8f8'}}>Accounting</h4>
    <div className='d-md-flex col-12 mb-4'>
        <div className='col-12 col-md-6 p-4 rounded'>
            <div className='p-4 d-flex flex-column bg-white shadow justify-content-center gap-2 align-items-center'>
                <div className='fw-bold text-xl text-center text-secondary'>Paid Visa</div>
                <div className='text-dark fw-bold'>&#x20A6;{Number(totalPaidFees).toLocaleString()}</div>
                <Link to='../paid-visa' className='bg-secondary-subtle rounded-pill shadow text-decoration-none'>
                <div style={{background: '#fff', fontSize: '0.8rem', width: '200px', color: 'GrayText'}} className='shadow rounded-pill p-2 text-center'>Check list</div>
                </Link>
            </div>
        </div>
        <div className='col-12 col-md-6 p-4 rounded'>
            <div className='p-4 d-flex flex-column bg-white shadow justify-content-center gap-2 align-items-center'>
                <div className='fw-bold text-xl text-center text-secondary'>Pending Payment</div>
                <div className='text-dark fw-bold'>&#x20A6;{Number(totalNotPaid).toLocaleString()}</div>
                <Link to='../not-paid-visa' className='bg-secondary-subtle rounded-pill shadow text-decoration-none'>
                <div style={{background: '#fff', fontSize: '0.8rem', width: '200px', color: 'GrayText'}} className='shadow rounded-pill p-2 text-center'>Check list</div>
                </Link>
            </div>
        </div>
    </div>
    <div className='d-md-flex col-12 mb-4'>
        <div className='col-12 col-md-6 p-4 rounded'>
            <div className='p-4 d-flex flex-column bg-white shadow justify-content-center gap-2 align-items-center'>
                <div className='fw-bold text-xl text-center text-secondary'>Paid Permit</div>
                <div className='text-dark fw-bold'>&#x20A6;{Number(totalPaidPermit).toLocaleString()}</div>
                <Link to='../paid-permit' className='bg-secondary-subtle rounded-pill shadow text-decoration-none'>
                <div style={{background: '#fff', fontSize: '0.8rem', width: '200px', color: 'GrayText'}} className='shadow rounded-pill p-2 text-center'>Check list</div>
                </Link>
            </div>
        </div>
        <div className='col-12 col-md-6 p-4 rounded'>
            <div className='p-4 d-flex flex-column bg-white shadow justify-content-center gap-2 align-items-center'>
                <div className='fw-bold text-xl text-center text-secondary'>Pending Permit Payment</div>
                <div className='text-dark fw-bold'>&#x20A6;{Number(totalNotPaidPermit).toLocaleString()}</div>
                <Link to='../not-paid-permit' className='bg-secondary-subtle rounded-pill shadow text-decoration-none'>
                <div style={{background: '#fff', fontSize: '0.8rem', width: '200px', color: 'GrayText'}} className='shadow rounded-pill p-2 text-center'>Check list</div>
                </Link>
            </div>
        </div>
    </div>
    <div className='d-md-flex col-12 mb-4'>
        <div className='col-12 col-md-6 p-4 rounded'>
            <div className='p-4 d-flex flex-column bg-white shadow justify-content-center gap-2 align-items-center'>
                <div className='fw-bold text-xl text-center text-secondary'>Paid Visa Support</div>
                <div className='text-dark fw-bold'>&#x20A6;{Number(totalPaidVSFees).toLocaleString()}</div>
            </div>
        </div>
        <div className='col-12 col-md-6 p-4 rounded'>
            <div className='p-4 d-flex flex-column bg-white shadow justify-content-center gap-2 align-items-center'>
                <div className='fw-bold text-xl text-center text-secondary'>Pending Visa Support Payment</div>
                <div className='text-dark fw-bold'>&#x20A6;{Number(totalNotPaidVSFees).toLocaleString()}</div>
            </div>
        </div>
    </div>
    <div className='d-md-flex col-12 mb-4'>
        <div className='col-12 col-md-6 p-4 rounded'>
            <div className='p-4 d-flex flex-column bg-white shadow justify-content-center gap-2 align-items-center'>
                <div className='fw-bold text-xl text-center text-secondary'>Paid Insurance</div>
                <div className='text-dark fw-bold'>&#x20A6;{Number(totalPaidIFees).toLocaleString()}</div>
            </div>
        </div>
        <div className='col-12 col-md-6 p-4 rounded'>
            <div className='p-4 d-flex flex-column bg-white shadow justify-content-center gap-2 align-items-center'>
                <div className='fw-bold text-xl text-center text-secondary'>Pending Insurance Payment</div>
                <div className='text-dark fw-bold'>&#x20A6;{Number(totalNotPaidIFees).toLocaleString()}</div>
            </div>
        </div>
    </div>
    <div className='container'>
    <div className='mb-4 fs-4 text-dark p-2 fw-bold'>Total Inflow: &#x20A6;{Number(allPayment).toLocaleString()}</div>
    <div className='spacer'></div>
    </div>
    </div>
    </>
  )
}

export default Accounting