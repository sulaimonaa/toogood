import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const Accounting = () => {
    const [totalPaidFees, setTotalPaidFees] = useState(0);
    const [totalNotPaid, setTotalNotPaid] = useState(0);

    useEffect(() => {
        axios.get('http://localhost:5000/admin/total-paid-fees') 
            .then(response => {
                setTotalPaidFees(response.data.total_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });

            axios.get('http://localhost:5000/admin/total-not-paid-fees') 
            .then(response => {
                setTotalNotPaid(response.data.total_not_paid_fees || 0);
            })
            .catch(error => {
                console.error("Error fetching total visa fees:", error);
            });
    }, []);
  return (
    <>
    <div style={{background: '#f8f8f8'}} className='rounded pt-3'>
    <h4 className='mb-3 py-2 px-4 rounded' style={{background: '#f8f8f8'}}>Accounting</h4>
    <div className='d-md-flex col-12'>
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
    </div>
    </>
  )
}

export default Accounting