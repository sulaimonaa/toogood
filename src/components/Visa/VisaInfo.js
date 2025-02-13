import React from 'react'
import { IoSearch } from "react-icons/io5";
import { TiWarningOutline } from "react-icons/ti";
import { FaCheck } from "react-icons/fa";

const VisaInfo = () => {
  return (
    <>
    <h5 className='text-secondary'>How it works!</h5>
    <div className="py-4 d-flex gap-2 flex-column flex-md-row col-12">
                <div className="col-12 col-md-4 d-flex gap-2 align-items-center info-list mb-3">
                    <IoSearch className="p-2 rounded-circle bg-success text-white" size={30} />
                    <div className="d-flex flex-column gap-1">
                        <h4 className="fw-bold m-0 fs-6">Search</h4>
                        <p className="text-normal m-0 fs-6">Choose available visa, then click apply now</p>
                    </div>
                </div>
                <div className="col-12 col-md-4 d-flex gap-2 align-items-center info-list mb-3">
                    <TiWarningOutline className="p-2 rounded-circle bg-secondary-subtle text-dark" size={30} />
                    <div className="d-flex flex-column gap-1">
                        <h4 className="fw-bold m-0 fs-6">Check visa type</h4>
                        <p className="text-normal m-0 fs-6">Find out the type of visa you are applying</p>
                    </div>
                </div>
                <div className="col-12 col-md-4 d-flex gap-2 align-items-center info-list mb-3">
                    <FaCheck className="p-2 rounded-circle bg-secondary-subtle text-dark" size={30} />
                    <div className="d-flex flex-column gap-1">
                        <h4 className="fw-bold m-0 fs-6">Apply for the eVisa</h4>
                        <p className="text-normal m-0 fs-6">Apply for the eVisa online</p>
                    </div>
                </div>
            </div>
            </>
  )
}

export default VisaInfo