import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServicesGrid = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingForm, setBookingForm] = useState({ show: false, techId: '', techName: '' });
    
    /* ⚡ Customer details with GPS coordinates */
    const [customerDetails, setCustomerDetails] = useState({ clientName: '', phone: '', address: '', serviceType: '', coordinates: '' });
    const [bookingStatus, setBookingStatus] = useState('');

    /* 🟠 MAP & HOVER CONTROLS */
    const [hoveredTechId, setHoveredTechId] = useState(null);
    const [isGeoHovered, setIsGeoHovered] = useState(false);
    const [mapCenter, setMapCenter] = useState("Rander, Surat");
    const [geoLoading, setGeoLoading] = useState(false);

    /* ❓ FAQ ACCORDION STATE */
    const [openFaq, setOpenFaq] = useState(null);

    /* 💬 ASK A QUESTION MODAL STATE */
    const [showAskModal, setShowAskModal] = useState(false);
    const [askFormData, setAskFormData] = useState({ name: '', phone: '', question: '' });
    const [askStatus, setAskStatus] = useState('');

    // 📌 SERVICE CATEGORIES CONFIGURATION
    const SERVICE_CATEGORIES = [
        { id: 'ac', title: 'AC Repair & Service', icon: '❄️', keywords: ['ac', 'air conditioner', 'cooling'] },
        { id: 'fridge', title: 'Refrigerator Repair', icon: '🧊', keywords: ['fridge', 'refrigerator', 'freezer'] },
        { id: 'washing', title: 'Washing Machine Repair', icon: '🧺', keywords: ['washing', 'washer', 'machine'] },
        { id: 'ro', title: 'RO Water Purifier Service', icon: '💧', keywords: ['ro', 'water', 'purifier', 'filter'] },
        { id: 'electrical', title: 'Electrical Services', icon: '⚡', keywords: ['elect', 'electrician', 'wiring'] },
        { id: 'plumbing', title: 'Plumbing Services', icon: '🔧', keywords: ['plumb', 'plumber', 'pipe'] }
    ];

    // ❓ FAQ DATA MATRIX
    const FAQS = [
        {
            q: "Fixora par service book karne ki visiting inspection fee kitni hai?",
            a: "Fixora par standard inspection visiting fee fixed ₹99 hai. Agar koi spare part lagta hai, toh uski billing actual rates ke hisab se transparently ki jati hai."
        },
        {
            q: "Kya repair work aur spare parts par koi warranty milti hai?",
            a: "Haan! Fixora har completed repair par 30-Day Service Warranty deta hai. Saath hi 3-Stage Photographic Proof System se genuine spare parts verify hote hain."
        },
        {
            q: "Live GPS Satellite Pin-Drop kaise kaam karta hai?",
            a: "Booking karte waqt 'Drop My Live Location Pin' button par click karte hi aapke browser se exact GPS coordinates capture ho jate hain, jisse technician 1-click Google Maps navigation se aapke ghar pohochta hai."
        },
        {
            q: "Main service complete hone ke baad payment kaise kar sakta hu?",
            a: "Service complete hone par technician dwara generated instant digital invoice par UPI QR Code scan karke ya Cash ke zariye direct payment kar sakte hain."
        },
        {
            q: "Service request book hone ke kitne time mein technician assign hota hai?",
            a: "Aapki booking submit hote hi Admin Operations Center se Priority Ranking Engine ke tehat nearest top-rated expert minutes mein auto-dispatch ho jata hai."
        }
    ];

    // 🎯 DYNAMIC PRICE TIER RATING CALCULATOR
    const calculateDynamicRating = (tech) => {
        const price = Number(tech.planPrice) || 0;
        if (price >= 5000) return '4.9';
        if (price >= 3000) return '4.7';
        if (price >= 1500) return '4.5';
        return '4.3';
    };

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
        setBookingForm({ show: true, techId: techId || '', techName: techName || 'Certified Expert' });
        setCustomerDetails({ ...customerDetails, serviceType: specialty || 'General Repair', coordinates: '' });
        setMapCenter("Rander, Surat");
    };

    /* 📍 GEOLOCATION PIN DROP LOGIC */
    const handleFetchLocation = () => {
        if (navigator.geolocation) {
            setGeoLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapCenter(`${latitude},${longitude}`);
                    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                    
                    setCustomerDetails(prev => ({
                        ...prev,
                        coordinates: googleMapsLink
                    }));
                    setGeoLoading(false);
                },
                (error) => {
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

        const notesPayload = [
            bookingForm.techName ? `Requested Tech: ${bookingForm.techName}` : '',
            customerDetails.coordinates ? `GPS Pin: ${customerDetails.coordinates}` : ''
        ].filter(Boolean).join(' | ');

        try {
            await axios.post('http://localhost:5000/api/services/book', {
                ...customerDetails,
                serviceType: validServiceType,
                customerId: bookingForm.techId || null,
                requestedTechId: bookingForm.techId || null,
                notes: notesPayload
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

    /* ❓ ASK A QUESTION FORM SUBMIT */
    const handleAskSubmit = (e) => {
        e.preventDefault();
        setAskStatus('Transmitting question to helpdesk...');
        setTimeout(() => {
            setAskStatus('🎉 Aapka sawal submit ho gaya hai! FIXORA Support Team jald hi aap se contact karegi.');
            setTimeout(() => {
                setShowAskModal(false);
                setAskStatus('');
                setAskFormData({ name: '', phone: '', question: '' });
            }, 2500);
        }, 1000);
    };

    const getTechsForCategory = (keywords) => {
        return technicians.filter(tech => {
            const specialty = (tech.specialty || '').toLowerCase();
            return keywords.some(key => specialty.includes(key));
        });
    };

    if (loading) return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Premium Experts...</h3>;

    return (
        <div id="services-grid-section" style={{ padding: '60px 20px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', scrollMarginTop: '80px' }}>
            
            {/* 🏷️ 1. PROMOTIONAL OFFERS BANNER BAR */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 40px auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#1d4ed8', fontWeight: 'bold', fontSize: '15px' }}>⚡ Pre-Summer AC Special</h5>
                    <small style={{ color: '#3b82f6' }}>Flat ₹350 Fixed Inspection Fee for AC & Fridge Servicing</small>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#15803d', fontWeight: 'bold', fontSize: '15px' }}>🛡️ 30-Day Service Warranty</h5>
                    <small style={{ color: '#22c55e' }}>Free re-visit if the same fault reoccurs within 30 days</small>
                </div>
                <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#c2410c', fontWeight: 'bold', fontSize: '15px' }}>💳 100% Cashless UPI Billing</h5>
                    <small style={{ color: '#f97316' }}>Scan Dynamic UPI QR code on instant invoice after job</small>
                </div>
            </div>

            <h2 style={{ textAlign: 'center', color: '#111827', marginBottom: '10px', fontSize: '28px' }}>💥 Verified Home Service Experts</h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px' }}>Urban Company Standard • Category Wise Certified Partners</p>

            {/* 🔹 CATEGORY-WISE TECHNICIANS GRID */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '45px' }}>
                {SERVICE_CATEGORIES.map((category) => {
                    const categoryTechs = getTechsForCategory(category.keywords);

                    return (
                        <div key={category.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '25px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
                                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                    <span>{category.icon}</span> {category.title}
                                </h3>
                                <button 
                                    onClick={() => handleBookClick('', `General ${category.title} Expert`, category.title)}
                                    style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                                >
                                    Book {category.title} →
                                </button>
                            </div>

                            {categoryTechs.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
                                    {categoryTechs.map((tech) => {
                                        const dynRating = calculateDynamicRating(tech);
                                        return (
                                            <div key={tech._id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: tech.subscriptionPlan === 'Platinum' ? '2px solid #fbbf24' : '1px solid #e5e7eb', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                                
                                                {tech.subscriptionPlan === 'Platinum' && (
                                                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fbbf24', color: '#78350f', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', zIndex: 1 }}>⭐ Top Rated</span>
                                                )}
                                                {tech.subscriptionPlan === 'Gold' && (
                                                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#e5e7eb', color: '#374151', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', zIndex: 1 }}>Verified Pro</span>
                                                )}

                                                <img src={tech.photo || tech.image || 'https://via.placeholder.com/300x200?text=No+Image'} alt={tech.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                                
                                                <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <h4 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>{tech.name}</h4>
                                                    <p style={{ margin: 0, color: '#2563eb', fontWeight: '600', fontSize: '13px' }}>{tech.specialty}</p>
                                                    
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d97706', fontWeight: 'bold', fontSize: '14px' }}>
                                                        🌟 {dynRating} / 5.0
                                                    </div>

                                                    <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '10px', paddingTop: '10px' }}>
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
                                                                fontSize: '13px',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                transform: hoveredTechId === tech._id ? 'translateY(-2px)' : 'translateY(0)'
                                                            }}
                                                        >
                                                            Book Expert (Fee: ₹99)
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                                    <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Is category me filhal koi direct technician profile listed nahi hai.</p>
                                    <button 
                                        onClick={() => handleBookClick('', `General ${category.title} Expert`, category.title)}
                                        style={{ backgroundColor: '#111827', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                                    >
                                        Direct Service Request Book Karein
                                    </button>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* 💬 2. VERIFIED CUSTOMER REVIEWS */}
            <div style={{ maxWidth: '1200px', margin: '60px auto' }}>
                <h3 style={{ textAlign: 'center', color: '#111827', marginBottom: '8px', fontSize: '24px', fontWeight: 'bold' }}>Verified Customer Reviews</h3>
                <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px', fontSize: '14px' }}>Real feedback from customers in Surat & Rander</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>★★★★★ (5.0)</div>
                        <p style={{ color: '#374151', fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>"Technician arrived in 25 mins using live GPS link and fixed my AC PCB issue on the spot!"</p>
                        <small style={{ color: '#6b7280', fontWeight: 'bold' }}>— Mohsin Khan, Rander</small>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>★★★★★ (5.0)</div>
                        <p style={{ color: '#374151', fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>"Very clean process. Tech uploaded 3 photos before/after repair and I paid via instant UPI QR code."</p>
                        <small style={{ color: '#6b7280', fontWeight: 'bold' }}>— Sameer Patel, Adajan</small>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>★★★★★ (5.0)</div>
                        <p style={{ color: '#374151', fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>"Fixed visiting fee of ₹99 with transparent spare parts billing. Highly recommended MERN service platform."</p>
                        <small style={{ color: '#6b7280', fontWeight: 'bold' }}>— Aaliyah Shaikh, Varachha</small>
                    </div>
                </div>
            </div>

            {/* ❓ 3. INTERACTIVE Q&A / FAQ ACCORDION SECTION WITH "ASK QUESTION" BUTTON */}
            <div style={{ maxWidth: '850px', margin: '0 auto 40px auto', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Customer Helpdesk</span>
                        <h3 style={{ color: '#111827', margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>Frequently Asked Questions (Q&A)</h3>
                    </div>
                    <button 
                        onClick={() => setShowAskModal(true)}
                        style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                    >
                        ❓ Pucho Apna Sawal
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {FAQS.map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', transition: 'all 0.2s' }}>
                                <button 
                                    onClick={() => setOpenFaq(isOpen ? null : index)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '16px', 
                                        textAlign: 'left', 
                                        backgroundColor: isOpen ? '#f8fafc' : '#ffffff', 
                                        border: 'none', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        fontWeight: 'bold', 
                                        color: '#1f2937', 
                                        fontSize: '15px', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    <span>❓ {faq.q}</span>
                                    <span style={{ fontSize: '18px', color: '#3b82f6' }}>{isOpen ? '−' : '+'}</span>
                                </button>
                                {isOpen && (
                                    <div style={{ padding: '16px', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9', color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                                        💡 {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 💬 ASK A QUESTION CUSTOMER MODAL */}
            {showAskModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 'bold' }}>Pucho Apna Sawal (Ask FIXORA)</h3>
                            <button onClick={() => setShowAskModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
                        </div>

                        {askStatus && <p style={{ color: askStatus.includes('🎉') ? '#16a34a' : '#2563eb', fontWeight: 'bold', textAlign: 'center', fontSize: '13px' }}>{askStatus}</p>}

                        <form onSubmit={handleAskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="text" placeholder="Aapka Naam *" required value={askFormData.name} onChange={(e) => setAskFormData({...askFormData, name: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            <input type="text" placeholder="Mobile Number / Email *" required value={askFormData.phone} onChange={(e) => setAskFormData({...askFormData, phone: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            <textarea placeholder="Aapka Sawal / Inquiry Detail *" required value={askFormData.question} onChange={(e) => setAskFormData({...askFormData, question: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', height: '90px', resize: 'none' }} />

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowAskModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#374151' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Question</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🗺️ INTERACTIVE BOOKING FORM MODAL */}
            {bookingForm.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '80px', paddingBottom: '30px', zIndex: 99999, overflowY: 'auto' }}>
                    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '480px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#111827' }}>Book Appointment with {bookingForm.techName}</h3>
                        
                        {bookingStatus && <p style={{ color: '#2563eb', fontWeight: 'bold', textAlign: 'center', fontSize: '14px' }}>{bookingStatus}</p>}
                        
                        <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="text" placeholder="Your Name" required value={customerDetails.clientName} onChange={(e) => setCustomerDetails({...customerDetails, clientName: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            <input type="text" placeholder="Your Phone Number" required value={customerDetails.phone} onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            <textarea placeholder="Your Full Address" required value={customerDetails.address} onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', height: '55px', resize: 'none' }} />
                            
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                📍 {geoLoading ? 'Fetching GPS Satellite...' : 'Drop My Live Location Pin'}
                            </button>

                            {customerDetails.coordinates && (
                                <p style={{ margin: 0, fontSize: '12px', color: '#16a34a', fontWeight: '600', textAlign: 'center' }}>
                                    ✓ Exact Pin Captured! Transmitting to Dashboard.
                                </p>
                            )}
                            
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