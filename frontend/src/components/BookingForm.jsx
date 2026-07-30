import React, { useState } from 'react';
import axios from 'axios';

const BookingForm = () => {
    // 📊 FORM STATES MATRIX
    const [customerDetails, setCustomerDetails] = useState({
        clientName: '',
        phone: '',
        address: '',
        serviceType: '',
        coordinates: ''
    });

    const [bookingStatus, setBookingStatus] = useState('');
    const [mapCenter, setMapCenter] = useState("Surat, Gujarat"); // Default baseline view
    const [geoLoading, setGeoLoading] = useState(false);
    
    // Hover animation tracking states
    const [isGeoHovered, setIsGeoHovered] = useState(false);
    const [isSubmitHovered, setIsSubmitHovered] = useState(false);

    // 📍 SATELLITE GPS GEOLOCATION ENGINE
    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            setGeoLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // 1. Google Iframe Map core view ko user ke ghar par shift karo
                    setMapCenter(`${latitude},${longitude}`);
                    
                    // 2. Admin dashboard ke liye clickable routing path link generate karo
                    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                    
                    setCustomerDetails(prev => ({
                        ...prev,
                        coordinates: googleMapsLink
                    }));
                    setGeoLoading(false);
                },
                (error) => {
                    console.error("GPS Error: ", error);
                    alert("Location access denied. Please fill your complete address details manually.");
                    setGeoLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            alert("Your browser does not support automatic satellite tracking.");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setBookingStatus('Processing Appointment...');

        // Smart text normalization engine for safety bounds
        const normalizeServiceType = (type) => {
            const text = (type || '').toLowerCase();
            if (text.includes('ac')) return 'AC';
            if (text.includes('fridge') || text.includes('refrigerator')) return 'Refrigerator';
            if (text.includes('washing')) return 'Washing Machine';
            if (text.includes('ro') || text.includes('purifier')) return 'RO Water Purifier';
            if (text.includes('elect')) return 'Electrician';
            return type;
        };

        const validService = normalizeServiceType(customerDetails.serviceType);

        try {
            // Payload parameters dispatch loop targeting backend cluster
            await axios.post('http://localhost:5000/api/services/book', {
                ...customerDetails,
                serviceType: validService
            });

            setBookingStatus('🎉 Booking Successful! Fixed Visiting Fee: ₹99.');
            setTimeout(() => {
                setCustomerDetails({ clientName: '', phone: '', address: '', serviceType: '', coordinates: '' });
                setMapCenter("Surat, Gujarat");
                setBookingStatus('');
            }, 3000);
        } catch (error) {
            setBookingStatus('❌ System Error: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        /* id="booking-suite-section" waise hi rakha he taaki footer se smooth scroll links mat tootein */
        <section id="booking-suite-section" style={{ padding: '60px 20px', backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
                
                {/* HEADINGS ROW MATCHING THE DESIGN PROFILE */}
                <h2 style={{ fontSize: '28px', color: '#111827', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                    Book a <span style={{ color: '#2563eb' }}>Verified Technician</span>
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '40px', lineHeight: '1.5' }}>
                    Apni details bharein aur kuch hi der mein certified expert technician aapke doorstep par hoga.
                </p>

                {bookingStatus && (
                    <div style={{ padding: '12px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontWeight: 'bold', marginBottom: '20px', fontSize: '14px' }}>
                        {bookingStatus}
                    </div>
                )}

                {/* MAIN ENTRY SUBMISSION FORM GATEWAY */}
                <form onSubmit={handleFormSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* 2-COLUMN INPUT GRID FOR PERSONAL PROFILE DETAILS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13.5px', color: '#374151', marginBottom: '8px' }}>Your Full Name</label>
                            <input 
                                type="text" 
                                placeholder="Enter your name" 
                                required 
                                value={customerDetails.clientName}
                                onChange={(e) => setCustomerDetails({...customerDetails, clientName: e.target.value})}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13.5px', color: '#374151', marginBottom: '8px' }}>Mobile Number</label>
                            <input 
                                type="tel" 
                                placeholder="10-digit mobile number" 
                                required 
                                value={customerDetails.phone}
                                onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px' }}
                            />
                        </div>
                    </div>

                    {/* INTERACTIVE TRACKING BAR WITH DETECT TRIGGER NODE */}
                    <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#374151' }}>Pin Your Location (Map):</label>
                        <button
                            type="button"
                            onClick={handleDetectLocation}
                            onMouseEnter={() => setIsGeoHovered(true)}
                            onMouseLeave={() => setIsGeoHovered(false)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: isGeoHovered ? '#1d4ed8' : '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🌐 {geoLoading ? 'Detecting Satellite...' : 'Detect My Location'}
                        </button>
                    </div>

                    {/* LIVE DYNAMIC GOOGLE MAP IFRAME CONTAINER LAYER */}
                    <div style={{ width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <iframe 
                            title="Fixora Core Form Map"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapCenter)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                            width="100%" 
                            height="240" 
                            style={{ border: 0, display: 'block' }} 
                            allowFullScreen="" 
                            loading="lazy"
                        />
                    </div>
                    
                    {customerDetails.coordinates && (
                        <p style={{ margin: '-10px 0 0 0', fontSize: '12.5px', color: '#16a34a', fontWeight: '600' }}>
                            ✓ Perfect Map Pin Dropped! Target coordinates synced with server core successfully.
                        </p>
                    )}

                    {/* PHYSICAL DESCRIPTION ADDRESS MATRIX */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13.5px', color: '#374151', marginBottom: '8px' }}>Complete Address Details</label>
                        <textarea 
                            placeholder="House No., Building Name, Near Local Landmark Area..." 
                            required 
                            value={customerDetails.address}
                            onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', height: '70px', resize: 'none', fontSize: '14px', fontFamily: 'sans-serif' }}
                        />
                    </div>

                    {/* SERVICE FIELD DROP-DOWN SELECTION COMPONENT */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13.5px', color: '#374151', marginBottom: '8px' }}>Select Service / Appliance</label>
                        <select
                            required
                            value={customerDetails.serviceType}
                            onChange={(e) => setCustomerDetails({...customerDetails, serviceType: e.target.value})}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', fontSize: '14px' }}
                        >
                            <option value="">Choose appliance to repair...</option>
                            <option value="AC">AC Repair & Gas Refill</option>
                            <option value="Refrigerator">Smart Refrigerator Service</option>
                            <option value="Washing Machine">Washing Machine Setup</option>
                            <option value="RO Water Purifier">RO Purifier TDS Auditing</option>
                            <option value="Electrician">Electrician Operations</option>
                        </select>
                    </div>

                    {/* SYSTEM SUBMIT CTA BUTTON WITH FIRE ORANGE THEME TRIGGER */}
                    <button
                        type="submit"
                        onMouseEnter={() => setIsSubmitHovered(true)}
                        onMouseLeave={() => setIsSubmitHovered(false)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: isSubmitHovered ? '#F97316' : '#111827',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isSubmitHovered ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: isSubmitHovered ? '0 6px 20px rgba(249, 115, 22, 0.35)' : 'none',
                            marginTop: '10px'
                        }}
                    >
                        Confirm Expert Appointment
                    </button>

                </form>
            </div>
        </section>
    );
};

export default BookingForm;