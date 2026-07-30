import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TechnicianPortal = () => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechId, setSelectedTechId] = useState('');
    const [assignedJobs, setAssignedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [actionMessage, setActionMessage] = useState('');

    // 📥 1. FETCH ALL TECHNICIANS
    useEffect(() => {
        const fetchPortalTechs = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/services/homepage-techs');
                if (Array.isArray(response.data)) {
                    setTechnicians(response.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Portal Dropdown sync failed:", error);
                setLoading(false);
            }
        };
        fetchPortalTechs();
    }, [refreshTrigger]);

    // 📥 2. FETCH ACTIVE DUTIES (Disappears ONLY when Completed)
    useEffect(() => {
        if (!selectedTechId) {
            setAssignedJobs([]);
            return;
        }

        const fetchTechDuties = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/services');
                
                // 🟢 VISIBILITY RULE: Job tabhi gayab hogi jab status 'Completed' hoga
                const activeDuties = response.data.filter(booking => {
                    if (!booking.assignedTechnician) return false;
                    if (booking.status === 'Completed') return false; 
                    
                    let dbTechId = '';
                    if (typeof booking.assignedTechnician === 'object' && booking.assignedTechnician._id) {
                        dbTechId = String(booking.assignedTechnician._id);
                    } else {
                        dbTechId = String(booking.assignedTechnician);
                    }
                    
                    return dbTechId === String(selectedTechId);
                });
                
                setAssignedJobs(activeDuties);
            } catch (error) {
                console.error("Error syncing active technician queue:", error);
            }
        };
        fetchTechDuties();
    }, [selectedTechId, refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        setActionMessage('🔄 Portal Refreshed!');
        setTimeout(() => setActionMessage(''), 2000);
    };

    // 🤝 1. HANDLE ACCEPT JOB (Redirected to Safe Dedicated Route)
    const handleAcceptJob = async (jobId) => {
        try {
            await axios.put(`http://localhost:5000/api/services/portal-update/${jobId}`, {
                status: 'Accepted'
            });
            setActionMessage('🤝 Job Accepted! Checked into your active queue.');
            setRefreshTrigger(prev => prev + 1);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (error) {
            alert('Error accepting job: ' + error.message);
        }
    };

    // ✅ 2. HANDLE COMPLETE JOB (Redirected to Safe Dedicated Route)
    const handleCompleteJob = async (jobId) => {
        try {
            await axios.put(`http://localhost:5000/api/services/portal-update/${jobId}`, {
                status: 'Completed'
            });
            setActionMessage('🎉 Job Completed! Cleaned from your active queue.');
            setRefreshTrigger(prev => prev + 1);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (error) {
            alert('Error completing job: ' + error.message);
        }
    };

    // ❌ 3. HANDLE CANCEL JOB
    const handleCancelJob = async (jobId) => {
        if (window.confirm("Bhai, kya aap sach mein ye job cancel karke re-allocate pool mein bhejna chahte ho?")) {
            try {
                await axios.put(`http://localhost:5000/api/services/cancel-job/${jobId}`);
                setActionMessage('❌ Job Cancelled! Sent back to Admin for reallocation.');
                setRefreshTrigger(prev => prev + 1);
                setTimeout(() => setActionMessage(''), 3000);
            } catch (error) {
                alert('Error cancelling job: ' + error.message);
            }
        }
    };

    if (loading) return <h3 style={{ textAlign: 'center', marginTop: '120px', fontFamily: 'sans-serif' }}>Syncing Portal Database...</h3>;

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '110px 20px 40px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f3f4f6', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#111827', fontSize: '22px', fontWeight: 'bold' }}>
                            👨‍💻 Technician Field Portal
                        </h2>
                        <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                            Apna naam select karein aur assigned active doorstep duties manage karein.
                        </p>
                    </div>
                    <button onClick={handleRefresh} style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#0f766e' }}>
                        🔄 Refresh Portal
                    </button>
                </div>

                {actionMessage && (
                    <div style={{ padding: '10px 15px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontSize: '13.5px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
                        {actionMessage}
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}>
                        🟢 MongoDB Live: {technicians.length} Active Partners Available
                    </span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <select value={selectedTechId} onChange={(e) => setSelectedTechId(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', fontSize: '14.5px', color: '#1f2937', outline: 'none' }}>
                        <option value="">-- Choose Your Identity --</option>
                        {technicians.map((tech) => (
                            <option key={tech._id} value={tech._id}>{tech.name} ({tech.specialty})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '25px auto 0 auto' }}>
                {!selectedTechId ? (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', textAlign: 'center', padding: '50px 20px' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Identity Verification Required</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Please pick your profile from the dropdown above to unlock logs.</p>
                    </div>
                ) : (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '25px' }}>
                        <h3 style={{ color: '#111827', fontSize: '17px', margin: '0 0 20px 0', fontWeight: 'bold' }}>🎯 Assigned Active Duties ({assignedJobs.length})</h3>
                        
                        {assignedJobs.length === 0 ? (
                            <p style={{ color: '#9ca3af', fontSize: '14.5px', fontStyle: 'italic', textAlign: 'center' }}>Chill bhai! Aapki queue mein abhi koi pending duty nahi hai.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {assignedJobs.map((job) => (
                                    <div key={job._id} style={{ 
                                        padding: '20px', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '12px', 
                                        background: '#ffffff', 
                                        borderLeft: job.status === 'Accepted' ? '6px solid #2563eb' : '6px solid #F97316',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <strong style={{ fontSize: '16px' }}>👤 Client: {job.clientName}</strong>
                                            <span style={{ 
                                                background: job.status === 'Accepted' ? '#dbeafe' : '#ffedd5', 
                                                color: job.status === 'Accepted' ? '#2563eb' : '#ea580c', 
                                                padding: '4px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '12.5px', 
                                                fontWeight: 'bold' 
                                            }}>{job.status}</span>
                                        </div>

                                        <div style={{ fontSize: '14px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div>📞 <b>Phone:</b> {job.phone}</div>
                                            <div>📍 <b>Address:</b> {job.address}</div>
                                            <div>🛠️ <b>Required Action:</b> {job.serviceType}</div>
                                        </div>
                                        
                                        {job.coordinates && (
                                            <div style={{ marginTop: '12px' }}>
                                                <a href={job.coordinates} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '6px 12px', background: '#0f172a', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>🗺️ Open Google Maps Route</a>
                                            </div>
                                        )}

                                        {/* 📦 MATRIX OF ACTION BUTTONS */}
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
                                            
                                            {/* 1. ACCEPT BUTTON (Shows when status is Pending OR Assigned) */}
                                            {(job.status === 'Pending' || job.status === 'Assigned') && (
                                                <button onClick={() => handleAcceptJob(job._id)} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                                    🤝 Accept Job
                                                </button>
                                            )}

                                            {/* 2. COMPLETED BUTTON (Always available until finished) */}
                                            <button onClick={() => handleCompleteJob(job._id)} style={{ padding: '8px 16px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                                ✅ Complete Job
                                            </button>

                                            {/* 3. CANCEL BUTTON */}
                                            <button onClick={() => handleCancelJob(job._id)} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginLeft: 'auto' }}>
                                                ❌ Cancel / Reject
                                            </button>
                                            
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianPortal;