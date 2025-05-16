import React, { useState, useEffect } from 'react';
import Slider1 from '../assets/images/slider1.png';
import Slider2 from '../assets/images/slider2.png';
import Slider3 from '../assets/images/slider3.png';
import './ImageSlider.css'; 

const Slider = () => {
  const slides = [
    Slider1,
    Slider2,
    Slider3
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  
  useEffect(() => {
    let slideInterval;
    if (isAutoPlaying) {
      slideInterval = setInterval(() => {
        setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000); 
    }
    return () => clearInterval(slideInterval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="slider-container">
      <div 
        className="slider-wrapper"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index}
            className="slide"
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}
      </div>
      
      
      <div className="dots-container">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;