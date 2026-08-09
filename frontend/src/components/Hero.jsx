import React, { useState, useEffect } from 'react';

// 📋 SLIDER DATA MATRIX
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
    widgetSub: "100% Verified Pro Team"
  },
  {
    tagIcon: "fa-solid fa-snowflake",
    tagText: "Top Rated Cooling Experts in Rander",
    titleFirst: "Premium ",
    titleHighlight: "AC Repair",
    titleLast: " & Fast Servicing.",
    description: "Beat the heat with certified cooling engineers. Instant breakdown diagnostics, gas charging, and deep filter cleaning at your doorstep.",
    imgUrl: "./images/hero-2.jpeg",
    widgetTitle: "Super Fast",
    widgetSub: "45 Min Doorstep Response"
  },
  {
    tagIcon: "fa-solid fa-bolt",
    tagText: "Verified Refrigerator Professionals",
    titleFirst: "Quick ",
    titleHighlight: "Fridge Fixes",
    titleLast: " & Maintenance.",
    description: "Advanced restoration for single-door, double-door, and smart inverter refrigerators. Fixed pricing matrix with zero hidden commissions.",
    imgUrl: "./images/hero-3.jpeg",
    widgetTitle: "Certified Pros",
    widgetSub: "90 Days Re-Visit Warranty"
  }
];

// 🔢 SMOOTH COUNT-UP ANIMATION ENGINE
function AnimatedCounter({ end, duration = 2200, decimals = 0, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 4); // Cubic Ease-Out
      setCount(easeOutProgress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <span>
      {decimals > 0
        ? count.toFixed(decimals)
        : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isBookHovered, setIsBookHovered] = useState(false);
  const [isExploreHovered, setIsExploreHovered] = useState(false);

  // 🔄 AUTOMATIC TIMER ENGINE (Har 5 second mein slide auto-change)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slideData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = slideData[currentSlide];

  return (
    <header className="hero-container position-relative overflow-hidden py-5" style={{ backgroundColor: '#0B1120', color: '#F8FAFC' }}>
      
      {/* 🚀 EMBEDDED CUSTOM ANIMATED SCROLLBAR CSS */}
      <style>{`
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #0B1120;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #2563EB 0%, #38BDF8 100%);
          border-radius: 20px;
          border: 2px solid #0B1120;
          transition: background 0.4s ease-in-out;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #F97316 0%, #FB923C 100%);
          border-color: #0B1120;
        }
        ::-webkit-scrollbar-thumb:active {
          background: #F97316;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #2563EB #0B1120;
        }
      `}</style>

      {/* 🌟 AMBIENT BACKGROUND GLOW BLOBS (#2563EB & #F97316) */}
      <div 
        className="position-absolute rounded-circle pointer-events-none"
        style={{
          width: '350px',
          height: '350px',
          top: '-80px',
          left: '-80px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(11, 17, 32, 0) 70%)',
          filter: 'blur(50px)',
          zIndex: 0
        }}
      />
      <div 
        className="position-absolute rounded-circle pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          bottom: '-100px',
          right: '-100px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(11, 17, 32, 0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      <div className="container py-3 position-relative" style={{ zIndex: 1 }}>
        <div className="row align-items-center g-5" key={currentSlide}>
          
          {/* LEFT SIDE: DYNAMIC TEXT CONTENT */}
          <div className="col-lg-6">
            
            {/* 🏷️ ADVANCED GLASS TAG BADGE */}
            <div 
              className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3" 
              style={{ 
                backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                border: '1px solid rgba(37, 99, 235, 0.25)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <i className={slide.tagIcon} style={{ color: '#F97316', fontSize: '14px' }}></i>
              <span style={{ color: '#60A5FA', fontSize: '13px', fontWeight: '600', letterSpacing: '0.3px' }}>
                {slide.tagText}
              </span>
            </div>

            {/* 💥 GRADIENT HEADING */}
            <h1 className="display-5 fw-bold text-white mb-3" style={{ lineHeight: '1.2', letterSpacing: '-0.5px' }}>
              {slide.titleFirst}
              <span 
                style={{ 
                  background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}
              >
                {slide.titleHighlight}
              </span>
              {slide.titleLast}
            </h1>

            {/* DESCRIPTION */}
            <p className="mb-4 fs-6 text-slate-300" style={{ color: '#94A3B8', lineHeight: '1.7', maxWidth: '540px' }}>
              {slide.description}
            </p>

            {/* 🚀 HIGH-TECH ACTION BUTTONS */}
            <div className="d-flex align-items-center gap-3 mt-4">
              <a 
                href="#booking-suite-section" 
                className="btn px-4 py-3 fw-bold text-white text-decoration-none rounded-3 d-flex align-items-center gap-2"
                onMouseEnter={() => setIsBookHovered(true)}
                onMouseLeave={() => setIsBookHovered(false)}
                style={{
                  backgroundColor: isBookHovered ? '#F97316' : '#2563EB',
                  border: 'none',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isBookHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: isBookHovered 
                    ? '0 12px 25px -5px rgba(249, 115, 22, 0.5)' 
                    : '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
                  fontSize: '15px'
                }}
              >
                <span>Book Service Line</span>
                <i className="fa-solid fa-arrow-right fs-6" style={{ transition: 'transform 0.2s', transform: isBookHovered ? 'translateX(4px)' : 'translateX(0)' }}></i>
              </a>

              <a 
                href="#services-grid-section" 
                className="btn px-4 py-3 fw-semibold text-decoration-none rounded-3" 
                onMouseEnter={() => setIsExploreHovered(true)}
                onMouseLeave={() => setIsExploreHovered(false)}
                style={{ 
                  borderRadius: '8px',
                  border: `1px solid ${isExploreHovered ? '#F97316' : 'rgba(255, 255, 255, 0.15)'}`,
                  color: isExploreHovered ? '#F97316' : '#E2E8F0',
                  backgroundColor: isExploreHovered ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(6px)',
                  transition: 'all 0.3s ease',
                  transform: isExploreHovered ? 'translateY(-3px)' : 'translateY(0)',
                  fontSize: '15px'
                }}
              >
                Explore Matrix
              </a>
            </div>
            
            {/* 🔴 SLIDER INDICATOR DOTS */}
            <div className="d-flex align-items-center gap-2 mt-4 pt-2">
              {slideData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className="border-0 p-0"
                  style={{
                    width: currentSlide === idx ? '28px' : '9px',
                    height: '9px',
                    borderRadius: '10px',
                    backgroundColor: currentSlide === idx ? '#F97316' : '#334155',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* RIGHT SIDE: IMAGE & DUAL FLOATING GLASS BADGES */}
          <div className="col-lg-6">
            <div className="position-relative">
              
              {/* MAIN HERO IMAGE WITH GLOW BORDER */}
              <div 
                className="p-1 rounded-4 shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.4) 0%, rgba(249, 115, 22, 0.2) 100%)',
                  borderRadius: '20px' 
                }}
              >
                <img 
                  src={slide.imgUrl} 
                  alt="Corporate Engineer Workflow" 
                  className="img-fluid rounded-4"
                  style={{ width: '100%', maxHeight: '410px', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* 🟢 TOP FLOATING BADGE (GPS LIVE DISPATCH) */}
              <div 
                className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-3 shadow-lg d-flex align-items-center gap-2"
                style={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '12px',
                  color: '#F8FAFC'
                }}
              >
                <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#22C55E', boxShadow: '0 0 10px #22C55E' }} />
                <span className="fw-semibold">Satellite GPS Auto-Dispatch Active</span>
              </div>

              {/* 🛡️ BOTTOM FLOATING BADGE (WIDGET INFO) */}
              <div 
                className="position-absolute bottom-0 start-0 m-3 p-3 rounded-3 shadow-lg d-flex align-items-center gap-3"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  color: '#0F172A', 
                  border: '1px solid #E2E8F0', 
                  minWidth: '230px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center" 
                  style={{ width: '40px', height: '40px', backgroundColor: 'rgba(249, 115, 22, 0.12)', color: '#F97316' }}
                >
                  <i className="fa-solid fa-circle-check fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold m-0 p-0 fs-6 text-dark">{slide.widgetTitle}</h6>
                  <small className="text-muted m-0 p-0" style={{ fontSize: '12px' }}>{slide.widgetSub}</small>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 📊 GLASSMORPHIC TRUST METRICS CARDS WITH ANIMATED COUNTERS */}
        <div className="row text-center g-3 pt-5 mt-4">
          
          <div className="col-md-3 col-6">
            <div 
              className="p-3 rounded-3 h-100" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(6px)',
                transition: 'border-color 0.3s'
              }}
            >
              <h3 className="fw-bold mb-1 fs-2" style={{ color: '#2563EB' }}>
                <AnimatedCounter end={10000} duration={2200} suffix="+" />
              </h3>
              <small style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '500' }}>Completed Repairs</small>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div 
              className="p-3 rounded-3 h-100" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(6px)' 
              }}
            >
              <h3 className="fw-bold mb-1 fs-2" style={{ color: '#2563EB' }}>
                <AnimatedCounter end={500} duration={1900} suffix="+" />
              </h3>
              <small style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '500' }}>Verified Technicians</small>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div 
              className="p-3 rounded-3 h-100" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(249, 115, 22, 0.3)',
                backdropFilter: 'blur(6px)' 
              }}
            >
              <h3 className="fw-bold mb-1 fs-2" style={{ color: '#F97316' }}>
                <AnimatedCounter end={4.8} duration={1600} decimals={1} suffix=" / 5" />
              </h3>
              <small style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '500' }}>Customer Rating</small>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div 
              className="p-3 rounded-3 h-100" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(6px)' 
              }}
            >
              <h3 className="fw-bold mb-1 fs-2" style={{ color: '#2563EB' }}>
                <AnimatedCounter end={100} duration={1600} suffix="%" />
              </h3>
              <small style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '500' }}>GPS Precision Dispatch</small>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}

export default Hero;