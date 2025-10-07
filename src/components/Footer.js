import React from 'react'
import WALogo from '../assets/images/wa.png';

const Footer = () => {
  return (
    <div className='container-fluid bg-dark py-2 position-relative'>
      <div className='container'>
        <p className='ftext text-center fw-bold text-white m-0'>&copy;2025 - All right reserved</p>
      </div>
      <div className='chat'>
        <a href='https://api.whatsapp.com/send?phone=2348035969519' target='_blank' rel="noopener noreferrer">
          <div className='text-danger bg-secondary-subtle rounded-pill p-2'>
            <img src={WALogo} alt='WhatsApp logo' className='whatsapp' />
          </div>
        </a>
      </div>
      <div className='updateBtn'>
        <a href='https://blog.toogoodtravels.net' className='text-decoration-none' target='_blank' rel="noopener noreferrer">
          <div className='text-white bg-dark rounded-pill p-2 text-center' style={{ fontSize: '0.8rem' }}>
            Check latest updates
          </div>
        </a>
      </div>
    </div>
  )
}

export default Footer