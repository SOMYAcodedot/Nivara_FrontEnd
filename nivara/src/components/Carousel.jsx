import React, { useEffect, useRef } from 'react';

const carouselImages = [
  { icon: '🧠', label: 'Individuals with Mental Health Issues', color: '#667eea' },
  { icon: '⚕️', label: 'Healthcare Providers', color: '#4CAF50' },
  { icon: '🏢', label: 'Organizations', color: '#FF4500' },
  { icon: '🤝', label: 'Caregivers', color: '#f093fb' },
];

const Carousel = () => {
  const carouselRef = useRef(null);

  useEffect(() => {
    const scroll = () => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft += 2;
        if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
          carouselRef.current.scrollLeft = 0;
        }
      }
    };

    const interval = setInterval(scroll, 15);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-section">
    <h2 className="carousel-heading">Who We Are Helping</h2>
    <div className="carousel-container">
      <div className="carousel" ref={carouselRef}>
        {[...carouselImages, ...carouselImages].map((item, index) => (
          <div key={index} className="carousel-item" style={{ backgroundColor: item.color }}>
            <div className="carousel-icon" style={{ fontSize: '4rem' }}>{item.icon}</div>
            <p className="carousel-label">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default Carousel;
