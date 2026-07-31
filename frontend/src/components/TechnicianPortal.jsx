import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api/services';

const TechnicianPortal = ({ onClose }) => {
    const [activeJobs, setActiveJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Modal & Work Completion States
    const [activeJobModal, setActiveJobModal] = useState(null);
    const [beforeImg, setBeforeImg] = useState('');
    const [afterImg, setAfterImg] = useState('');
    // ⚙️ Dynamic Parts State with Name, Quantity & Price (Set by Technician)
    const [parts, setParts] = useState([{ name: '', qty: 1, price: 0 }]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // 👤 Get current logged-in user from localStorage
    const savedUser = localStorage.getItem('user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && onClose) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'technician') {
            setLoading(false);
            return;
        }

        const fetchTechDuties = async () => {
            try {
                const response = await axios.get(API_BASE);
                
                const currentUserId = String(currentUser._id || currentUser.id || '');
                const currentUserEmail = (currentUser.email || '').toLowerCase().trim();
                const currentUserName = (currentUser.name || '').toLowerCase().trim();

                const myAllJobs = response.data.filter(booking => {
                    if (!booking.assignedTechnician && !booking.technician) return false;

                    let assignedObj = booking.assignedTechnician;
                    let assignedId = '';
                    let assignedEmail = '';
                    let assignedName = '';

                    if (typeof assignedObj === 'object' && assignedObj !== null) {
                        assignedId = String(assignedObj._id || assignedObj.id || '');
                        assignedEmail = (assignedObj.email || '').toLowerCase().trim();
                        assignedName = (assignedObj.name || '').toLowerCase().trim();
                    } else if (typeof assignedObj === 'string') {
                        assignedId = assignedObj;
                        assignedName = assignedObj.toLowerCase().trim();
                    }

                    const fallbackName = (booking.technician || '').toLowerCase().trim();

                    const isIdMatch = currentUserId && (assignedId === currentUserId);
                    const isEmailMatch = currentUserEmail && (assignedEmail === currentUserEmail);
                    const isNameMatch = currentUserName && (
                        assignedName.includes(currentUserName) || 
                        currentUserName.includes(assignedName) || 
                        fallbackName.includes(currentUserName) || 
                        currentUserName.includes(fallbackName)
                    );

                    return isIdMatch || isEmailMatch || isNameMatch;
                });

                setActiveJobs(myAllJobs.filter(j => j.status !== 'Completed'));
                setCompletedJobs(myAllJobs.filter(j => j.status === 'Completed'));

            } catch (error) {
                console.error("Error fetching technician duties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTechDuties();
    }, [refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        setActionMessage('🔄 Queue Refreshed!');
        setTimeout(() => setActionMessage(''), 2000);
    };

    const handleAcceptJob = async (jobId) => {
        try {
            await axios.put(`${API_BASE}/portal-update/${jobId}`, { status: 'Accepted' });
            setActionMessage('🤝 Job Accepted!');
            setRefreshTrigger(prev => prev + 1);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (error) {
            alert('Error accepting job: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCancelJob = async (jobId) => {
        if (window.confirm("Kya aap ye job reject karke Admin ko waapas bhejna chahte ho?")) {
            try {
                await axios.put(`${API_BASE}/cancel-job/${jobId}`);
                setActionMessage('❌ Job Rejected! Sent back to Admin.');
                setRefreshTrigger(prev => prev + 1);
                setTimeout(() => setActionMessage(''), 3000);
            } catch (error) {
                alert('Error cancelling job: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // 📸 Upload Image to Cloudinary
    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                const res = await axios.post(`${API_BASE}/upload-image`, {
                    imageBase64: reader.result
                });
                if (type === 'before') setBeforeImg(res.data.url);
                if (type === 'after') setAfterImg(res.data.url);
            } catch (err) {
                alert("Image upload failed! Try again.");
            } finally {
                setUploading(false);
            }
        };
    };

    // ➕ Add New Spare Part Row
    const handleAddPart = () => {
        setParts([...parts, { name: '', qty: 1, price: 0 }]);
    };

    // ❌ Remove Spare Part Row
    const handleRemovePart = (index) => {
        setParts(parts.filter((_, idx) => idx !== index));
    };

    // ✏️ Handle Spare Part Field Change
    const handlePartChange = (index, field, value) => {
        const updated = [...parts];
        if (field === 'price' || field === 'qty') {
            updated[index][field] = Number(value) >= 0 ? Number(value) : 0;
        } else {
            updated[index][field] = value;
        }
        setParts(updated);
    };

    // 💾 Total Bill Calculation: (Qty * Price) + Base Service Fee (₹350)
    const calculateTotalPartsCost = () => {
        return parts.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.qty) || 1)), 0);
    };

    // 💾 Submit Work Details
    const handleCompleteJobSubmit = async (e) => {
        e.preventDefault();
        if (!activeJobModal) return;

        setSaving(true);
        const totalPartsCost = calculateTotalPartsCost();
        const baseServiceFee = 350;
        const finalAmount = totalPartsCost + baseServiceFee;

        // Clean parts list
        const formattedParts = parts
            .filter(p => p.name.trim() !== '')
            .map(p => ({
                name: `${p.name} (Qty: ${p.qty || 1})`,
                price: Number(p.price) * Number(p.qty || 1)
            }));

        try {
            await axios.put(`${API_BASE}/portal-update/${activeJobModal._id}`, {
                status: 'Completed',
                beforeImage: beforeImg,
                afterImage: afterImg,
                spareParts: formattedParts,
                totalAmount: finalAmount
            });

            setActionMessage('🎉 Job Successfully Completed & Billed!');
            setActiveJobModal(null);
            setBeforeImg('');
            setAfterImg('');
            setParts([{ name: '', qty: 1, price: 0 }]);
            setRefreshTrigger(prev => prev + 1);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (error) {
            alert('Error completing job: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (!currentUser || currentUser.role !== 'technician') {
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', maxWidth: '400px', textAlign: 'center' }}>
                    <h3 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>⚠️ Access Restricted</h3>
                    <p style={{ color: '#4b5563', fontSize: '14px' }}>
                        Ye portal sirf Technician accounts ke liye hai.
                    </p>
                    <button onClick={onClose} style={{ padding: '8px 20px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, color: '#fff' }}>
                <h3>Loading Your Portal...</h3>
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px', padding: '28px' }}>
                
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: 'bold' }}>
                            👨‍🔧 Welcome, {currentUser.name}!
                        </h2>
                        <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold' }}>
                            Authorized Technician ({currentUser.email})
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleRefresh} style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                            🔄 Refresh Queue
                        </button>
                        <button onClick={onClose} style={{ padding: '8px 14px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                            ✖ Close (ESC)
                        </button>
                    </div>
                </div>

                {actionMessage && (
                    <div style={{ padding: '10px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
                        {actionMessage}
                    </div>
                )}

                {/* ACTIVE JOBS */}
                <h3 style={{ color: '#0284c7', fontSize: '17px', margin: '0 0 16px 0', fontWeight: 'bold' }}>
                    🚀 New & Active Duties ({activeJobs.length})
                </h3>

                {activeJobs.length === 0 ? (
                    <div style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px dashed #0284c7', marginBottom: '30px' }}>
                        <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', fontWeight: 'bold' }}>
                            👍 Koi nayi active duty assigned nahi hai. Admin jaise hi allocate karega yahan dikhegi!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '35px' }}>
                        {activeJobs.map((job) => (
                            <div key={job._id} style={{ padding: '18px', border: '2px solid #38bdf8', borderRadius: '12px', backgroundColor: '#f0f9ff', borderLeft: job.status === 'Accepted' ? '8px solid #2563eb' : '8px solid #f97316' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>🛠️ {job.serviceType}</strong>
                                    <span style={{ background: job.status === 'Accepted' ? '#dbeafe' : '#ffedd5', color: job.status === 'Accepted' ? '#2563eb' : '#ea580c', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {job.status || 'Assigned'}
                                    </span>
                                </div>

                                <div style={{ fontSize: '14px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div>👤 <b>Client:</b> {job.clientName}</div>
                                    <div>📞 <b>Phone:</b> {job.phone}</div>
                                    <div>📍 <b>Address:</b> {job.address}</div>
                                    <div>📅 <b>Scheduled:</b> {job.bookingDate} ({job.bookingTime})</div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #bae6fd', paddingTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {(job.status === 'Pending' || job.status === 'Assigned' || !job.status) && (
                                        <button onClick={() => handleAcceptJob(job._id)} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                            🤝 Accept Job
                                        </button>
                                    )}

                                    {job.status === 'Accepted' && (
                                        <button onClick={() => setActiveJobModal(job)} style={{ padding: '8px 18px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                            🛠️ Start & Complete Job
                                        </button>
                                    )}

                                    <button onClick={() => handleCancelJob(job._id)} style={{ padding: '8px 14px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginLeft: 'auto' }}>
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* COMPLETED HISTORY */}
                {completedJobs.length > 0 && (
                    <>
                        <h3 style={{ color: '#16a34a', fontSize: '16px', margin: '0 0 12px 0', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                            ✅ Completed Job History ({completedJobs.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {completedJobs.map((job) => (
                                <div key={job._id} style={{ padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
                                        <span>👤 {job.clientName} ({job.serviceType})</span>
                                        <span style={{ color: '#16a34a' }}>🎉 Total Bill: ₹{job.totalAmount || 350}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* 🛠️ WORK COMPLETION MODAL */}
                {activeJobModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '15px' }}>
                        <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '650px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                                    🛠️ Finalize Job: {activeJobModal.serviceType}
                                </h3>
                                <button onClick={() => setActiveJobModal(null)} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>✖</button>
                            </div>

                            <form onSubmit={handleCompleteJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                
                                {/* BEFORE REPAIR PHOTO */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                                        📷 Upload Before Repair Photo *
                                    </label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'before')} style={{ fontSize: '12px', width: '100%' }} />
                                    {beforeImg && <small style={{ color: '#16a34a', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>✅ Before photo uploaded!</small>}
                                </div>

                                {/* AFTER REPAIR PHOTO */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                                        📸 Upload After Repair Photo *
                                    </label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'after')} style={{ fontSize: '12px', width: '100%' }} />
                                    {afterImg && <small style={{ color: '#16a34a', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>✅ After photo uploaded!</small>}
                                </div>

                                {/* ⚙️ SPARE PARTS WITH QUANTITY & TECHNICIAN CUSTOM PRICE */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                                        ⚙️ Add Spare Parts Installed (Set Name, Quantity & Price):
                                    </label>
                                    {parts.map((p, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                placeholder="Part Name (e.g. Capacitor)"
                                                value={p.name}
                                                onChange={(e) => handlePartChange(idx, 'name', e.target.value)}
                                                style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                title="Quantity"
                                                value={p.qty}
                                                onChange={(e) => handlePartChange(idx, 'qty', e.target.value)}
                                                style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price/Part (₹)"
                                                title="Price per item"
                                                value={p.price}
                                                onChange={(e) => handlePartChange(idx, 'price', e.target.value)}
                                                style={{ width: '110px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                            />
                                            {parts.length > 1 && (
                                                <button type="button" onClick={() => handleRemovePart(idx)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: '6px', padding: '8px 10px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddPart} style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                        ➕ Add Another Part
                                    </button>
                                </div>

                                {/* AUTOMATED BILL SUMMARY */}
                                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#334155', border: '1px solid #e2e8f0' }}>
                                    <div>Visiting & Repair Charge: <b>₹350</b></div>
                                    <div>Spare Parts Total: <b>₹{calculateTotalPartsCost()}</b></div>
                                    <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '6px', paddingTop: '6px', fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>
                                        💰 Total Bill to Customer: ₹{calculateTotalPartsCost() + 350}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setActiveJobModal(null)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={uploading || saving} style={{ padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                                        {saving ? 'Saving...' : '💾 Submit & Complete Job'}
                                    </button>
                                </div>

                            </form>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TechnicianPortal;    