import React, { useState } from 'react';

const Footer = () => {
    // 🟠 HOVER MATRIX: Sabhi links ke unique hovers ko handle karne ke liye
    const [hoveredId, setHoveredId] = useState(null);

    // 🔒 MODAL STATES FOR LEGAL & POLICIES
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

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
                        
                        {/* 🔒 PRIVACY POLICY TRIGGER */}
                        <a 
                            href="#privacy" 
                            onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} 
                            onMouseEnter={() => setHoveredId('q4')} 
                            onMouseLeave={() => setHoveredId(null)} 
                            style={linkStyle('q4')}
                        >
                            Privacy Policy
                        </a>

                        {/* 📜 TERMS & CONDITIONS TRIGGER */}
                        <a 
                            href="#terms" 
                            onClick={(e) => { e.preventDefault(); setShowTerms(true); }} 
                            onMouseEnter={() => setHoveredId('q5')} 
                            onMouseLeave={() => setHoveredId(null)} 
                            style={linkStyle('q5')}
                        >
                            Terms & Conditions
                        </a>
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
                <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12.5px', color: '#9ca3af' }}>
                    <div>© 2026 Fixora Inc. All Operational Rights Reserved.</div>
                    <div style={{ fontWeight: '500', color: '#6b7280' }}>Designed for Secure Multi-Service Deployments.</div>
                </div>

            </div>

            {/* 📜 TERMS & CONDITIONS MODAL */}
            {showTerms && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '550px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: 'bold' }}>📜 Terms & Conditions</h3>
                            <button onClick={() => setShowTerms(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
                        </div>
                        <div style={{ color: '#4b5563', fontSize: '13.5px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <p style={{ margin: 0 }}><b>1. Visiting Inspection Charge:</b> Fixora platform par standard doorstep inspection fee fixed ₹99 hai. Major repair ya extra spare parts ki costing task se pehle customer confirmation ke saath add hogi.</p>
                            <p style={{ margin: 0 }}><b>2. 30-Day Service Guarantee:</b> Verified Fixora technicians dwara completed sabhi jobs par 30-Day Warranty milti hai. Same issue aane par re-visit free of charge hoga.</p>
                            <p style={{ margin: 0 }}><b>3. 3-Stage Photo Audit Verification:</b> Technician ko job completion se pehle 3 mandatory photos (Issue, Before Repair, After Repair) System CDN par upload karni hongi.</p>
                            <p style={{ margin: 0 }}><b>4. Service Cancellation:</b> Service request ko technician allocation se pehle bina kisi cancellation fee ke cancel kiya ja sakta hai.</p>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                            <button onClick={() => setShowTerms(false)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>I Understand</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔒 PRIVACY POLICY MODAL */}
            {showPrivacy && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '550px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: 'bold' }}>🔒 Privacy Policy</h3>
                            <button onClick={() => setShowPrivacy(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
                        </div>
                        <div style={{ color: '#4b5563', fontSize: '13.5px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <p style={{ margin: 0 }}><b>1. Customer Data Masking:</b> Aapka phone number aur precise home address encrypted format mein manage hota hai. Customer details kisi third-party advertiser ko share nahi ki jati.</p>
                            <p style={{ margin: 0 }}><b>2. Live GPS Satellite Pin Drop:</b> Booking modal ke 'Drop My Live Location Pin' se captured coordinates sirf assigned technician ko turn-by-turn navigation redirect dene ke liye use hote hain.</p>
                            <p style={{ margin: 0 }}><b>3. Photographic Proof Security:</b> Technician dwara upload ki gayi inspection photos sirf Cloudinary CDN Audit trail aur printable invoice verification ke liye store rehti hain.</p>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                            <button onClick={() => setShowPrivacy(false)} style={{ backgroundColor: '#111827', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Close Policy</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Footer;