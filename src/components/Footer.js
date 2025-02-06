import React from 'react'
import { SiWechat } from "react-icons/si";

const Footer = () => {
  return (
    <div className='container-fluid bg-dark py-2 position-relative'>
        <div className='container'>
            <p className='ftext text-center fw-bold text-white m-0'>&copy;2025 - All right reserved</p>
        </div>
        <div className='chat'>
            <a href='https://api.whatsapp.com/send?phone=08035969519' target='_blank' rel="noopener noreferrer">
                <SiWechat className='text-danger bg-danger-subtle rounded-pill p-2 fs-2'/>
            </a>
        </div>
    </div>
  )
}

export default Footer