import React, { useState } from 'react';

const Footer = () => {
    // 🟠 HOVER MATRIX: Sabhi links ke unique hovers ko handle karne ke liye
    const [hoveredId, setHoveredId] = useState(null);

    // Smooth scroll navigation trigger logic
    const handleScroll = (e, targetId) => {
        e.preventDefault();
        if (targetId === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Standard styling configurations for footer links
    const linkStyle = (id) => ({
        color: hoveredId === id ? '#F97316' : '#4b5563',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        display: 'inline-block'
    });

    return (
        <div style={{ backgroundColor: '#f3f4f6', paddingTop: '40px', borderTop: '1px solid #e5e7eb', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* 📋 4-COLUMN SYSTEM METRIC GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '40px', paddingBottom: '40px' }}>
                    
                    {/* COL 1: IDENTITY & DESCRIPTION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#F97316' }}><i className="fa-solid fa-screwdriver-wrench"></i></span> Fixora
                        </h3>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '13.5px', lineHeight: '1.6', textAlign: 'justify' }}>
                            Fixora on-demand household services platform hai jo appliance engineering ko smooth, swift aur complete numeric privacy masking ke saath doorstep par secure deliver karta hai.
                        </p>
                    </div>

                    {/* COL 2: WORKING SERVICE LINKS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '15px', fontWeight: 'bold', borderBottom: '2px solid #F97316', paddingBottom: '6px', width: 'fit-content' }}>Our Services</h4>
                        <a href="#services-grid-section" onClick={(e) => handleScroll(e, 'services-grid-section')} onMouseEnter={() => setHoveredId('s1')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('s1')}>AC Repair & Gas Refill</a>
                        <a href="#services-grid-section" onClick={(e) => handleScroll(e, 'services-grid-section')} onMouseEnter={() => setHoveredId('s2')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('s2')}>Smart Refrigerator Service</a>
                        <a href="#services-grid-section" onClick={(e) => handleScroll(e, 'services-grid-section')} onMouseEnter={() => setHoveredId('s3')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('s3')}>Washing Machine Setup</a>
                        <a href="#services-grid-section" onClick={(e) => handleScroll(e, 'services-grid-section')} onMouseEnter={() => setHoveredId('s4')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('s4')}>RO Purifier TDS Auditing</a>
                        <a href="#services-grid-section" onClick={(e) => handleScroll(e, 'services-grid-section')} onMouseEnter={() => setHoveredId('s5')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('s5')}>Geyser & Utility Operations</a>
                    </div>

                    {/* COL 3: QUICK NAVIGATION ENGINE */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '15px', fontWeight: 'bold', borderBottom: '2px solid #F97316', paddingBottom: '6px', width: 'fit-content' }}>Quick Navigation</h4>
                        <a href="#" onClick={(e) => handleScroll(e, 'top')} onMouseEnter={() => setHoveredId('q1')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('q1')}>Home Base</a>
                        <a href="#process-section" onClick={(e) => handleScroll(e, 'process-section')} onMouseEnter={() => setHoveredId('q2')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('q2')}>How It Works</a>
                        <a href="#booking-suite-section" onClick={(e) => handleScroll(e, 'booking-suite-section')} onMouseEnter={() => setHoveredId('q3')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('q3')}>Book Form</a>
                        <a href="#" onMouseEnter={() => setHoveredId('q4')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('q4')}>Privacy Policy</a>
                        <a href="#" onMouseEnter={() => setHoveredId('q5')} onMouseLeave={() => setHoveredId(null)} style={linkStyle('q5')}>Terms & Conditions</a>
                    </div>

                    {/* COL 4: OPERATIONAL INFORMATION NODES */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#4b5563', fontSize: '13.5px' }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '15px', fontWeight: 'bold', borderBottom: '2px solid #F97316', paddingBottom: '6px', width: 'fit-content' }}>Operational Center</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span style={{ color: '#2563eb' }}>📍</span> <span>morabhagal rander, Surat, Gujarat, 395005</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ color: '#2563eb' }}>✉</span> <a href="mailto:support@fixora.com" onMouseEnter={() => setHoveredId('e1')} onMouseLeave={() => setHoveredId(null)} style={{ color: hoveredId === 'e1' ? '#F97316' : '#4b5563', textDecoration: 'none' }}>support@fixora.com</a>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ color: '#2563eb' }}>📞</span> <a href="tel:+919978256555" onMouseEnter={() => setHoveredId('p1')} onMouseLeave={() => setHoveredId(null)} style={{ color: hoveredId === 'p1' ? '#F97316' : '#4b5563', textDecoration: 'none' }}>+91 99782 56555</a>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ color: '#2563eb' }}>🕒</span> <span>Mon - Sun: 8:00 AM - 9:00 PM</span>
                        </div>
                    </div>

                </div>

                {/* 🔒 BOTTOM SYSTEM FOOTNOTE ROW */}
                <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px 0', display: 'flex', justifycontent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12.5px', color: '#9ca3af' }}>
                    <div>© 2026 Fixora Inc. All Operational Rights Reserved.</div>
                    <div style={{ fontWeight: '500', color: '#6b7280' }}>Designed for Secure Multi-Service Deployments.</div>
                </div>

            </div>
        </div>
    );
};

export default Footer;