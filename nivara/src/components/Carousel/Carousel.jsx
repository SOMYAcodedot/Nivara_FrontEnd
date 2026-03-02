import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaHeart, FaUsers, FaHandHoldingHeart, FaBuilding } from 'react-icons/fa';
import './Carousel.css';

// Import images
import individualsImg from '../../Images/Home/Carousel/Individuals.png';
import providersImg from '../../Images/Home/Carousel/HealthcareProviders.jpg';
import organizationsImg from '../../Images/Home/Carousel/Organizations.jpg';
import caregiversImg from '../../Images/Home/Carousel/HealthcareGivers.png';

const carouselSlides = [
  {
    id: 1,
    image: individualsImg,
    icon: <FaHeart />,
    title: "Women's Mental Wellness",
    subtitle: "Your Journey Matters",
    description: 'Personalized AI-driven therapy, mood tracking, and 24/7 emotional support designed specifically for women navigating life\'s challenges.',
    stats: { number: '10K+', label: 'Women Supported' },
    accentColor: '#667eea',
    gradientStart: 'rgba(102, 126, 234, 0.92)',
    gradientEnd: 'rgba(118, 75, 162, 0.92)',
  },
  {
    id: 2,
    image: providersImg,
    icon: <FaUsers />,
    title: 'Healthcare Providers',
    subtitle: "Empowering Better Care",
    description: 'Advanced clinical tools and AI-powered insights to enhance patient outcomes, streamline workflows, and deliver evidence-based mental health solutions.',
    stats: { number: '500+', label: 'Providers Trust Us' },
    accentColor: '#4CAF50',
    gradientStart: 'rgba(76, 175, 80, 0.92)',
    gradientEnd: 'rgba(56, 142, 60, 0.92)',
  },
  {
    id: 3,
    image: organizationsImg,
    icon: <FaBuilding />,
    title: 'Organizations & Enterprises',
    subtitle: "Building Healthier Teams",
    description: 'Comprehensive wellness programs that support employee mental health, boost productivity, reduce burnout, and create a thriving workplace culture.',
    stats: { number: '200+', label: 'Companies Partnered' },
    accentColor: '#FF6B35',
    gradientStart: 'rgba(255, 107, 53, 0.92)',
    gradientEnd: 'rgba(255, 140, 0, 0.92)',
  },
  {
    id: 4,
    image: caregiversImg,
    icon: <FaHandHoldingHeart />,
    title: 'Caregivers & Families',
    subtitle: "You're Not Alone",
    description: 'Essential resources, expert guidance, and supportive community to help you care for loved ones while nurturing your own mental wellbeing.',
    stats: { number: '5K+', label: 'Caregivers Helped' },
    accentColor: '#E91E63',
    gradientStart: 'rgba(233, 30, 99, 0.92)',
    gradientEnd: 'rgba(156, 39, 176, 0.92)',
  },
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2500);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying, nextSlide]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const getSlideClass = (index) => {
    if (index === currentSlide) return 'active';
    
    const prev = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
    const next = (currentSlide + 1) % carouselSlides.length;
    
    if (index === prev) return 'prev';
    if (index === next) return 'next';
    return 'hidden';
  };

  return (
    <section className="nivara-carousel-section">
      {/* Background Decorations */}
      <div className="carousel-bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* Header */}
      <div className="carousel-header">
        <span className="carousel-badge">Our Impact</span>
        <h2 className="carousel-main-title">
          Transforming Lives <span className="gradient-text">Together</span>
        </h2>
        <p className="carousel-subtitle">
          Discover how we're making a meaningful difference across communities, 
          delivering compassionate care and innovative solutions for mental wellness.
        </p>
      </div>

      {/* Main Carousel */}
      <div 
        className="nivara-carousel-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Progress Bar */}
        <div className="carousel-progress">
          <div 
            className="carousel-progress-bar" 
            style={{ 
              width: `${((currentSlide + 1) / carouselSlides.length) * 100}%`,
              background: carouselSlides[currentSlide].accentColor
            }}
          ></div>
        </div>

        {/* Slides Container */}
        <div className="carousel-slides-wrapper">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`carousel-slide ${getSlideClass(index)}`}
              style={{
                '--accent-color': slide.accentColor,
                '--gradient-start': slide.gradientStart,
                '--gradient-end': slide.gradientEnd,
              }}
            >
              {/* Image Section */}
              <div className="slide-image-wrapper">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="slide-image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>

              {/* Content Card - Below Image */}
              <div className="slide-content-card">
                <div className="card-inner">
                  <div className="card-header">
                    <div className="slide-icon-badge">
                      {slide.icon}
                    </div>
                    <div className="card-title-section">
                      <span className="slide-subtitle">{slide.subtitle}</span>
                      <h3 className="slide-title">{slide.title}</h3>
                    </div>
                  </div>
                  
                  <p className="slide-description">{slide.description}</p>
                  
                  <div className="card-footer">
                    <div className="slide-stats">
                      <div className="stat-number">{slide.stats.number}</div>
                      <div className="stat-label">{slide.stats.label}</div>
                    </div>

                    <button className="slide-cta-btn">
                      Learn More
                      <FaChevronRight className="cta-arrow" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="slide-decoration">
                <div className="decoration-ring"></div>
                <div className="decoration-dots"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          className="carousel-nav-btn prev-btn" 
          onClick={prevSlide} 
          aria-label="Previous slide"
          disabled={isAnimating}
        >
          <FaChevronLeft />
        </button>
        <button 
          className="carousel-nav-btn next-btn" 
          onClick={nextSlide} 
          aria-label="Next slide"
          disabled={isAnimating}
        >
          <FaChevronRight />
        </button>

        {/* Slide Counter & Dots */}
        <div className="carousel-navigation">
          <div className="slide-counter">
            <span className="current-slide">{String(currentSlide + 1).padStart(2, '0')}</span>
            <span className="slide-divider">/</span>
            <span className="total-slides">{String(carouselSlides.length).padStart(2, '0')}</span>
          </div>

          <div className="carousel-dots">
            {carouselSlides.map((slide, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                style={{ '--dot-color': slide.accentColor }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Info Cards - Quick Preview */}
      <div className="carousel-preview-cards">
        {carouselSlides.map((slide, index) => (
          <button
            key={slide.id}
            className={`preview-card ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            style={{ '--card-accent': slide.accentColor }}
          >
            <div className="preview-icon">{slide.icon}</div>
            <span className="preview-title">{slide.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Carousel;
