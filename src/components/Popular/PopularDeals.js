import React from 'react'
import '../Popular/Popular.css'
import { Link } from 'react-router-dom'

const PopularDeals = () => {
  return (
    <div className='container-fluid p-container'>
        <div className='container'>
            <h3 className='text-dark mb-3 fs-4'>Popular deals</h3>
            <div className='d-flex gap-2'>
                <div className='col-6 pd pd-1 mb-2'>
                    <Link to='/flight' className='bg-white opacity-75 rounded-pill p-2 text-decoration-none w-50 text-center text-dark fw-bold'>
                        Explore flights
                    </Link>
                </div>
                <div className='col-6 pd pd-2 mb-2'>
                <Link to='/hotel' className='bg-white opacity-75 rounded-pill p-2 text-decoration-none w-50 text-center text-dark fw-bold'>
                        Explore hotels
                    </Link>
                </div>
            </div>
            <div className='d-flex gap-2'>
                <div className='col-6 pd pd-3 mb-2'>
                <Link to='/e-visa' className='bg-white opacity-75 rounded-pill p-2 text-decoration-none w-50 text-center text-dark fw-bold'>
                        Get e-visa
                    </Link>
                </div>
                <div className='col-6 pd pd-4 mb-2'>
                <Link to='/e-sim' className='bg-white opacity-75 rounded-pill p-2 text-decoration-none w-50 text-center text-dark fw-bold'>
                        Get e-sims
                    </Link>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PopularDeals