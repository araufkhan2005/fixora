import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServicesGrid = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingForm, setBookingForm] = useState({ show: false, techId: '', techName: '' });
    
    /* ⚡ UPDATE: customerDetails mein coordinates ka naya field add kar diya hai */
    const [customerDetails, setCustomerDetails] = useState({ clientName: '', phone: '', address: '', serviceType: '', coordinates: '' });
    const [bookingStatus, setBookingStatus] = useState('');

    /* 🟠 MAP & HOVER CONTROLS */
    const [hoveredTechId, setHoveredTechId] = useState(null);
    const [isGeoHovered, setIsGeoHovered] = useState(false);
    const [mapCenter, setMapCenter] = useState("Rander, Surat"); // Default map view
    const [geoLoading, setGeoLoading] = useState(false);

    useEffect(() => {
        const fetchRankedTechs = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/services/homepage-techs');
                setTechnicians(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching ranked technicians:", error);
                setLoading(false);
            }
        };
        fetchRankedTechs();
    }, []);

    const handleBookClick = (techId, techName, specialty) => {
        setBookingForm({ show: true, techId, techName });
        setCustomerDetails({ ...customerDetails, serviceType: specialty, coordinates: '' });
        setMapCenter("Rander, Surat"); // Reset map view on new click
    };

    /* 📍 GEOLOCATION PIN DROP LOGIC: Customer ki exact location fetch karne ke liye */
    const handleFetchLocation = () => {
        if (navigator.geolocation) {
            setGeoLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Map ka view customer ke coordinates par set karo
                    setMapCenter(`${latitude},${longitude}`);
                    
                    // Admin ke liye clickable google maps link generate karo
                    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                    
                    setCustomerDetails(prev => ({
                        ...prev,
                        coordinates: googleMapsLink
                    }));
                    setGeoLoading(false);
                },
                (error) => {
                    console.error("Location error: ", error);
                    alert("Location access denied. Please type your full address manually.");
                    setGeoLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            alert("Your browser does not support live location pinning.");
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingStatus('Processing...');

        const normalizeServiceType = (specialty) => {
            const text = (specialty || '').toLowerCase();
            if (text.includes('ac')) return 'AC';
            if (text.includes('fridge') || text.includes('refrigerator')) return 'Refrigerator';
            if (text.includes('washing') || text.includes('motor')) return 'Washing Machine';
            if (text.includes('ro') || text.includes('purifier')) return 'RO Water Purifier';
            if (text.includes('elect')) return 'Electrician';
            if (text.includes('plumb')) return 'Plumber';
            return specialty;
        };

        const validServiceType = normalizeServiceType(customerDetails.serviceType);

        try {
            // ⚡ customerDetails ke andar ki coordinates value (Google Map Link) automatically backend par post ho jayegi
            await axios.post('http://localhost:5000/api/services/book', {
                ...customerDetails,
                serviceType: validServiceType,
                requestedTechId: bookingForm.techId
            });
            
            setBookingStatus('🎉 Booking Request Sent to Admin Dashboard! Fixed Visiting Fee: ₹99');
            setTimeout(() => {
                setBookingForm({ show: false, techId: '', techName: '' });
                setCustomerDetails({ clientName: '', phone: '', address: '', serviceType: '', coordinates: '' });
                setBookingStatus('');
            }, 3000);
        } catch (error) {
            setBookingStatus('❌ Booking failed: ' + (error.response?.data?.error || error.message));
        }
    };

    if (loading) return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Premium Experts...</h3>;

    return (
        <div id="services-grid-section" style={{ padding: '60px 20px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', scrollMarginTop: '80px' }}>
            <h2 style={{ textAlign: 'center', color: '#111827', marginBottom: '10px', fontSize: '28px' }}>💥 Verified Home Service Experts</h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px' }}>Urban Company Standard • Top Ranked Partners First</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto' }}>
                {technicians.map((tech) => (
                    <div key={tech._id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: tech.subscriptionPlan === 'Platinum' ? '2px solid #fbbf24' : '1px solid #e5e7eb', position: 'relative', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                        
                        {tech.subscriptionPlan === 'Platinum' && (
                            <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fbbf24', color: '#78350f', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>⭐ Top Rated</span>
                        )}
                        {tech.subscriptionPlan === 'Gold' && (
                            <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#e5e7eb', color: '#374151', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>Verified Pro</span>
                        )}

                        <img src={tech.photo || 'https://via.placeholder.com/300x200?text=No+Image'} alt={tech.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        
                        <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '20px' }}>{tech.name}</h3>
                            <p style={{ margin: 0, color: '#2563eb', fontWeight: '600', fontSize: '14px' }}>{tech.specialty}</p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d97706', fontWeight: 'bold', fontSize: '15px' }}>
                                🌟 {tech.rating || '4.0'} / 5.0
                            </div>

                            <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '10px', paddingTop: '15px' }}>
                                <button 
                                    onClick={() => handleBookClick(tech._id, tech.name, tech.specialty)}
                                    onMouseEnter={() => setHoveredTechId(tech._id)}
                                    onMouseLeave={() => setHoveredTechId(null)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        backgroundColor: hoveredTechId === tech._id ? '#F97316' : '#111827', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: '6px', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: hoveredTechId === tech._id ? 'translateY(-2px)' : 'translateY(0)',
                                        boxShadow: hoveredTechId === tech._id ? '0 6px 15px rgba(249, 115, 22, 0.35)' : 'none'
                                    }}
                                >
                                    Book Now (Fee: ₹99)
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 🗺️ INTERACTIVE FORM MODAL */}
            {bookingForm.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '480px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxHeight: '95vh', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#111827' }}>Book Appointment with {bookingForm.techName}</h3>
                        
                        {bookingStatus && <p style={{ color: '#2563eb', fontWeight: 'bold', textAlign: 'center', fontSize: '14px' }}>{bookingStatus}</p>}
                        
                        <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="text" placeholder="Your Name" required value={customerDetails.clientName} onChange={(e) => setCustomerDetails({...customerDetails, clientName: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            <input type="text" placeholder="Your Phone Number" required value={customerDetails.phone} onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            <textarea placeholder="Your Full Address" required value={customerDetails.address} onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', height: '55px', resize: 'none' }} />
                            
                            {/* ⚡ NEW FEATURE: GPS Pin Drop Button */}
                            <button 
                                type="button" 
                                onClick={handleFetchLocation}
                                onMouseEnter={() => setIsGeoHovered(true)}
                                onMouseLeave={() => setIsGeoHovered(false)}
                                style={{
                                    padding: '10px',
                                    backgroundColor: isGeoHovered ? '#d97706' : '#F97316',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                📍 {geoLoading ? 'Fetching GPS Satellite...' : 'Drop My Live Location Pin'}
                            </button>

                            {/* Dynamic Map Visual Status */}
                            {customerDetails.coordinates && (
                                <p style={{ margin: 0, fontSize: '12px', color: '#16a34a', fontWeight: '600', textAlign: 'center' }}>
                                    ✓ Exact Pin Captured! Transmitting to Dashboard.
                                </p>
                            )}
                            
                            {/* LIVE DYNAMIC MAP GATEWAY */}
                            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <div style={{ background: '#f3f4f6', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }}>
                                    🗺️ Map Target View: {mapCenter}
                                </div>
                                <iframe 
                                    title="Fixora Location Map"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapCenter)}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
                                    width="100%" 
                                    height="140" 
                                    style={{ border: 0, display: 'block' }} 
                                    allowFullScreen="" 
                                    loading="lazy"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setBookingForm({ show: false, techId: '', techName: '' })} style={{ flex: 1, padding: '10px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#374151' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesGrid;