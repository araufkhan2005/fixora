import React, { useState } from 'react';

function Navbar() {
  // URL parameter check karne ke liye taaki technician page par buttons na dikhein
  const access = new URLSearchParams(window.location.search).get('access');

  /* 🟠 HOVER STATE ENGINE: Button ke hover ko control karne ke liye */
  const [isHovered, setIsHovered] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container">
        <div className="d-flex align-items-center">
          <a className="navbar-brand m-0" href="/">
            <i className="fa-solid fa-screwdriver-wrench me-2"></i><span>Fix</span>ora
          </a>
          <span className="badge bg-light text-dark border ms-3 d-none d-sm-inline-block"
                style={{ borderRadius: '8px', padding: '6px 12px', fontWeight: 600, fontSize: '0.85rem' }}>
            <i className="fa-solid fa-location-dot text-danger me-1"></i> Rander, Surat
          </span>
        </div>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                data-bs-target="#mainNavbarEngine" aria-controls="mainNavbarEngine" aria-expanded="false"
                aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="mainNavbarEngine">
          <ul className="navbar-nav gap-2 align-items-center mt-3 mt-lg-0">
            
            {/* ⚡ ONLY HOME PAGE: Agar koi portal open nahi hai, tabhi ye do buttons dikhenge */}
            {!access && (
              <>
                <li className="nav-item"><a className="nav-link" href="#process-section">How It Works</a></li>
                <li className="nav-item"><a className="nav-link" href="#services-grid-section">Services Grid</a></li>
              </>
            )}

            {/* 🟢 FIXED HELPLINE: Laptop/Mobile dono par click karte hi new tab mein WhatsApp open hoga */}
            <li className="nav-item">
              <a 
                className="nav-link text-dark fw-semibold" 
                href="https://wa.me/9978256555?text=Hello%20ServiceHub,%20mujhe%20booking%20mein%20help%20chahiye." 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <i className="fa-solid fa-headset text-primary me-1"></i> Helpline
              </a>
            </li>
            
            <li className="nav-item ms-lg-2">
              {/* ⚡ HOVER FIXED HERE: Pure React logic se hover color control kiya he */}
              <a 
                className="btn-nav-cta px-4" 
                href="#booking-suite-section"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  backgroundColor: isHovered ? '#F97316' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 8px 15px rgba(249, 115, 22, 0.3)' : 'none'
                }}
              >
                Book Service
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 