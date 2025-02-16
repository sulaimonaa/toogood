import React from 'react';

const Loading = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-light bg-opacity-50 z-50 d-flex vw-100 vh-100 justify-content-center align-items-center" style={{ zIndex: 1000 }}>
      <p>{message}</p>
    </div>
  );
};

export default Loading;
