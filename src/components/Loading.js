import React from 'react';
import { SpinningCircles } from 'react-loading-icons'

const Loading = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-light bg-opacity-50 z-50 d-flex vw-100 vh-100 justify-content-center align-items-center" style={{ zIndex: 1000 }}>
      <div className='d-flex gap-3 flex-column align-items-center justify-content-center'>
      <SpinningCircles fill="#00FF00"/>
      <p>{message}</p>
      </div>
    </div>
  );
};

export default Loading;
