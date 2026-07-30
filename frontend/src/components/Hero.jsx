import React, { useState, useEffect } from 'react';

// 📋 SLIDER DATA MATRIX: Aap yahan se text aur images kabhi bhi change kar sakte hain
const slideData = [
  {
    tagIcon: "fa-solid fa-shield-halved",
    tagText: "100% Centralized Data Privacy",
    titleFirst: "Smart ",
    titleHighlight: "Home Utility",
    titleLast: " & Appliance Fixes.",
    description: "Book high-tier verified technicians instantly without exposing your private contact details. Complete workflow security monitored directly by us.",
    imgUrl: "./images/hero-1.jpeg",
    widgetTitle: "KYC Audited",
    widgetSub: "100% Secure Team"
  },
  {
    tagIcon: "fa-solid fa-snowflake text-info",
    tagText: "Top Rated Cooling Experts in Rander",
    titleFirst: "Premium ",
    titleHighlight: "AC Repair",
    titleLast: " & Fast Servicing.",
    description: "Beat the heat with certified cooling engineers. Instant breakdown diagnostics, gas charging, and deep filter cleaning at your doorstep.",
    imgUrl: "./images/hero-2.jpeg",
    widgetTitle: "Super Fast",
    widgetSub: "45 Min Response"
  },
  {
    tagIcon: "fa-solid fa-bolt text-warning",
    tagText: "Verified Refrigerator Professionals",
    titleFirst: "Quick ",
    titleHighlight: "Fridge Fixes",
    titleLast: " & Maintenance.",
    description: "Advanced restoration for single-door, double-door, and smart inverter refrigerators. Fixed pricing matrix with zero hidden commissions.",
    imgUrl: "./images/hero-3.jpeg",
    widgetTitle: "Certified Pros",
    widgetSub: "90 Days Warranty"
  }
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  /* 🟠 HOVER STATES ENGINE: Dono buttons ke individual hover ko track karne ke liye */
  const [isBookHovered, setIsBookHovered] = useState(false);
  const [isExploreHovered, setIsExploreHovered] = useState(false);

  // 🔄 AUTOMATIC TIMER ENGINE: Har 5 second mein slide auto-change hogi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slideData.length);
    }, 5000); // 5000ms = 5 Seconds

    return () => clearInterval(timer);
  }, []);

  const slide = slideData[currentSlide];

  return (
    <header className="hero-container">
      <div className="container">
        {/* key={currentSlide} lagane se har change par CSS/AOS animations re-trigger honge */}
        <div className="row align-items-center g-5" key={currentSlide}>
          
          {/* LEFT SIDE: DYNAMIC TEXT CONTENT */}
          <div className="col-lg-6" data-aos="fade-right">
            <span className="hero-tag">
              <i className={slide.tagIcon + " me-1"}></i> {slide.tagText}
            </span>
            <h1 className="hero-title">
              {slide.titleFirst}
              <span>{slide.titleHighlight}</span>
              {slide.titleLast}
            </h1>
            <p className="lead text-muted mb-4 fs-5 animate__animated animate__fadeIn">
              {slide.description}
            </p>
            <div className="d-flex gap-3 mt-2">
              {/* ⚡ HOVER FIXED HERE: Book Service Line turns Fire Orange */}
              <a 
                href="#booking-suite-section" 
                className="btn-nav-cta btn-lg px-5 py-3 shadow"
                onMouseEnter={() => setIsBookHovered(true)}
                onMouseLeave={() => setIsBookHovered(false)}
                style={{
                  backgroundColor: isBookHovered ? '#F97316' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  transform: isBookHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isBookHovered ? '0 8px 15px rgba(249, 115, 22, 0.3)' : 'none'
                }}
              >
                Book Service Line
              </a>

              {/* ⚡ HOVER FIXED HERE: Explore Matrix gets Orange Border and Light Tint background */}
              <a 
                href="#services-grid-section" 
                className="btn btn-light btn-lg px-4 py-3 border text-dark fw-semibold" 
                onMouseEnter={() => setIsExploreHovered(true)}
                onMouseLeave={() => setIsExploreHovered(false)}
                style={{ 
                  borderRadius: 'var(--radius-md)',
                  borderColor: isExploreHovered ? '#F97316' : '#cbd5e1',
                  color: isExploreHovered ? '#F97316' : '#1e293b',
                  backgroundColor: isExploreHovered ? 'rgba(249, 115, 22, 0.05)' : '#ffffff',
                  transition: 'all 0.3s ease',
                  transform: isExploreHovered ? 'translateY(-2px)' : 'translateY(0)',
                  textDecoration: 'none'
                }}
              >
                Explore Matrix
              </a>
            </div>
            
            {/* 🔴 SLIDER DOTS: Niche chote indicator dots dikhane ke liye */}
            <div className="d-flex gap-2 mt-4">
              {slideData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className="border-0 rounded-circle"
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: currentSlide === idx ? '#F97316' : '#d1d5db',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: DYNAMIC IMAGE & FLOATING WIDGET */}
          <div className="col-lg-6" data-aos="fade-left">
            <div className="hero-display-grid">
              <img 
                src={slide.imgUrl} 
                alt="Corporate Engineer Workflow" 
                className="hero-img-card animate__animated animate__fadeIn"
                style={{ transition: 'all 0.5s ease-in-out' }}
              />
              <div className="floating-widget-pro animate__animated animate__pulse animate__infinite animate__slower">
                <div className="widget-accent-box">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <h5 className="fw-bold m-0 p-0 fs-6 text-dark">{slide.widgetTitle}</h5>
                  <p className="text-muted small m-0 p-0">{slide.widgetSub}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Hero;