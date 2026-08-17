import React, { useState, useEffect, useCallback } from 'react';

// ⚡ Dynamic Auto-Switch: Offline Localhost & Online Render
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);

const BASE_API_URL = isLocalhost 
  ? 'http://127.0.0.1:5000/api/services' 
  : 'https://fixora-backend-fsn5.onrender.com/api/services';

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [dbTechs, setDbTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechs, setSelectedTechs] = useState({});
  
  // 🔘 TOP TOGGLE PANELS
  const [showInquiries, setShowInquiries] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTechList, setShowTechList] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const [selectedJobProof, setSelectedJobProof] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [invoiceJob, setInvoiceJob] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', specialty: '',
    age: '', address: '', subscriptionPlan: 'Basic', planPrice: '', image: ''
  });
  
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const getAuthToken = () => {
    const directToken = localStorage.getItem('token') || 
                        localStorage.getItem('adminToken') || 
                        localStorage.getItem('userToken');
    if (directToken) return directToken;

    try {
      const userObj = JSON.parse(
        localStorage.getItem('user') || 
        localStorage.getItem('userInfo') || 
        localStorage.getItem('admin') || '{}'
      );
      return userObj.token || userObj.jwt || '';
    } catch {
      return '';
    }
  };

  const getLiveTierInfo = (price) => {
    const num = Number(price) || 0;
    if (num >= 5000) return { plan: 'Platinum', rating: '4.9 ⭐', badge: 'bg-dark text-white fw-bold' };
    if (num >= 3000) return { plan: 'Gold', rating: '4.7 ⭐', badge: 'bg-primary text-white fw-bold' };
    if (num >= 1500) return { plan: 'Silver', rating: '4.5 ⭐', badge: 'bg-secondary text-white fw-bold' };
    return { plan: 'Basic', rating: '4.3 ⭐', badge: 'bg-dark text-white fw-bold' };
  };

  const fetchIncomingQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(BASE_API_URL);
      const data = await response.json();
      
      const techResponse = await fetch(`${BASE_API_URL}/homepage-techs`);
      let techData = [];
      if (techResponse.ok) {
        techData = await techResponse.json();
        if (Array.isArray(techData)) setDbTechs(techData);
      }

      if (Array.isArray(data)) {
        setQueue(data);

        const autoAllocMap = {};
        data.forEach(item => {
          const directId = item.requestedTechId || (typeof item.customer === 'string' ? item.customer : item.customer?._id);
          let matchedTech = techData.find(t => String(t._id) === String(directId));

          if (!matchedTech && item.notes) {
            matchedTech = techData.find(t => 
              item.notes.toLowerCase().includes(t.name.toLowerCase())
            );
          }

          if (matchedTech) {
            autoAllocMap[item._id] = matchedTech._id;
          }
        });

        setSelectedTechs(prev => ({ ...autoAllocMap, ...prev }));
      }

    } catch (error) {
      console.error("Server sync failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomingQueue();
  }, [fetchIncomingQueue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const allocateTechnician = async (id) => {
    const selectedTechId = selectedTechs[id];
    if (!selectedTechId) {
      alert("⚠️ Please select a technician from dropdown!");
      return;
    }

    const token = getAuthToken();
    try {
      const response = await fetch(`${BASE_API_URL}/allocate/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          technician: selectedTechId, 
          technicianId: selectedTechId, 
          status: "Assigned" 
        })
      });

      if (response.ok) {
        alert(`🚀 Task successfully assigned!`);
        fetchIncomingQueue();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`❌ Allocation failed: ${errData.message || errData.error || 'Authorization error'}`);
      }
    } catch (error) {
      alert("❌ Server connection error during allocation.");
    }
  };

  const markInquiryResolved = async (id) => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${BASE_API_URL}/portal-update/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Completed" })
      });

      if (response.ok) {
        alert("🎉 Inquiry marked as Answered & Resolved!");
        setSelectedInquiry(null);
        fetchIncomingQueue();
      }
    } catch (err) {
      alert("Error resolving inquiry.");
    }
  };

  const cancelAllocation = async (id) => {
    if (!window.confirm("Kya aap sach mein is allocation ko cancel karna chahte hain?")) return;

    const token = getAuthToken();
    try {
      const response = await fetch(`${BASE_API_URL}/cancel-job/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("✅ Booking allocation successfully cancelled!");
        fetchIncomingQueue();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`❌ Cancel failed: ${errData.message || errData.error || 'Authorization error'}`);
      }
    } catch (error) {
      alert("❌ Server connection lost during cancel request.");
    }
  };

  const deleteTechnician = async (id, name) => {
    if (!window.confirm(`⚠️ Kya aap sach mein Technician "${name}" ko remove karna chahte hain?`)) return;

    const token = getAuthToken();
    try {
      const response = await fetch(`${BASE_API_URL}/delete-technician/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const resData = await response.json();
        alert(`🗑️ ${resData.message || `Technician ${name} successfully removed!`}`);
        fetchIncomingQueue();
      } else {
        const resData = await response.json().catch(() => ({}));
        alert(`❌ Removal failed: ${resData.message || resData.error || 'Server error'}`);
      }
    } catch (error) {
      alert("❌ Server connection lost during technician removal.");
    }
  };

  const handleTechChange = (id, value) => {
    setSelectedTechs(prev => ({ ...prev, [id]: value }));
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setSubmitting(true);

    const token = getAuthToken();
    try {
      const liveTier = getLiveTierInfo(formData.planPrice);
      const payload = {
        ...formData,
        subscriptionPlan: liveTier.plan
      };

      const response = await fetch(`${BASE_API_URL}/add-technician`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        setStatusMessage({ 
          type: 'success', 
          text: `🎉 Technician ${formData.name} Registered Successfully!` 
        });
        setFormData({
          name: '', email: '', password: '', phone: '', specialty: '',
          age: '', address: '', subscriptionPlan: 'Basic', planPrice: '', image: ''
        });
        fetchIncomingQueue();
      } else {
        setStatusMessage({ 
          type: 'error', 
          text: `❌ ${resData.message || resData.error || 'Registration failed'}` 
        });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: '❌ Backend server connection failed!' });
    } finally {
      setSubmitting(false);
    }
  };

  // 🔍 SEPARATING INQUIRIES FROM REPAIR BOOKINGS
  const inquiriesList = queue.filter(item => 
    item.serviceType === 'Helpdesk Inquiry' || 
    item.serviceType === 'Customer Question' || 
    item.address === 'Helpdesk Web Inquiry'
  );

  const repairBookings = queue.filter(item => 
    item.serviceType !== 'Helpdesk Inquiry' && 
    item.serviceType !== 'Customer Question' && 
    item.address !== 'Helpdesk Web Inquiry'
  );

  const totalRequests = repairBookings.length;
  const pendingRequests = repairBookings.filter(item => item.status === 'Pending' || !item.status).length;
  const completedJobsList = repairBookings.filter(item => item.status === 'Completed');
  const completedRequests = completedJobsList.length;
  const assignedRequests = repairBookings.filter(item => item.status === 'Assigned' || item.status === 'Accepted').length;

  const totalGrossRevenue = completedJobsList.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 350), 0);
  const totalVisitingCharges = completedRequests * 350;
  const totalSparePartsRevenue = totalGrossRevenue > totalVisitingCharges ? totalGrossRevenue - totalVisitingCharges : 0;
  const averageOrderValue = completedRequests > 0 ? Math.round(totalGrossRevenue / completedRequests) : 0;

  const liveTierPreview = getLiveTierInfo(formData.planPrice);

  return (
    <div className="container-fluid px-4 py-4" style={{ marginTop: '30px' }}>
      
      {/* 🖨️ A4 PRINT CSS */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          html, body { background: #ffffff !important; color: #000000 !important; height: 100% !important; overflow: hidden !important; }
          body * { visibility: hidden !important; }
          #printable-invoice-content, #printable-invoice-content * { visibility: visible !important; }
          .modal { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }
          .modal-dialog { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          #printable-invoice-content { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-height: 98vh !important; margin: 0 !important; padding: 20px !important; border: 1px solid #1e293b !important; border-radius: 8px !important; background: #ffffff !important; box-shadow: none !important; }
          .d-print-none, #printable-invoice-content .d-print-none { display: none !important; }
        }
      `}</style>

      {/* HEADER SECTION WITH INQUIRIES BUTTON NEXT TO REVENUE */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold m-0 text-dark"><i className="fa-solid fa-lock text-danger me-2"></i>FIXORA Operations Command Center</h4>
          <p className="text-muted small m-0 mt-1">Authorized Operations, Revenue Analytics & Helpdesk Console.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          
          {/* 📊 REVENUE BUTTON */}
          <button 
            className={`btn btn-sm ${showAnalytics ? 'btn-success' : 'btn-outline-success'} fw-bold rounded-3`}
            onClick={() => { setShowAnalytics(!showAnalytics); setShowInquiries(false); }}
          >
            📊 {showAnalytics ? 'Hide Analytics' : 'Revenue Analytics'}
          </button>

          {/* 💬 NEW SEPARATE INQUIRIES BUTTON (NEXT TO REVENUE) */}
          <button 
            className={`btn btn-sm ${showInquiries ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'} fw-bold rounded-3`}
            onClick={() => { setShowInquiries(!showInquiries); setShowAnalytics(false); }}
          >
            💬 {showInquiries ? 'Hide Inquiries' : `Inquiries (${inquiriesList.length})`}
          </button>

          {/* 👥 TECH DIRECTORY BUTTON */}
          <button 
            className="btn btn-sm btn-info text-white fw-bold rounded-3"
            onClick={() => setShowTechList(!showTechList)}
          >
            👥 {showTechList ? 'Hide Directory' : `Techs (${dbTechs.length})`}
          </button>

          {/* ➕ ADD TECH BUTTON */}
          <button 
            className={`btn btn-sm ${showAddForm ? 'btn-danger' : 'btn-dark'} fw-bold rounded-3`}
            onClick={() => { setShowAddForm(!showAddForm); setStatusMessage({ type: '', text: '' }); }}
          >
            {showAddForm ? '❌ Close Form' : '➕ Add Tech'}
          </button>
          
          {/* 🔄 REFRESH */}
          <button className="btn btn-sm btn-light border text-success fw-bold rounded-3" onClick={fetchIncomingQueue}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* METRICS GRID (ONLY REPAIRS COUNT) */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-primary border-4">
            <h6 className="text-muted small fw-semibold mb-1">Total Repair Bookings</h6>
            <h2 className="fw-bold m-0 text-dark">{totalRequests}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-warning border-4">
            <h6 className="text-muted small fw-semibold mb-1">Pending Allocations</h6>
            <h2 className="fw-bold m-0 text-warning">{pendingRequests}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-info border-4">
            <h6 className="text-muted small fw-semibold mb-1">Active / Assigned</h6>
            <h2 className="fw-bold m-0 text-info">{assignedRequests}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-success border-4">
            <h6 className="text-muted small fw-semibold mb-1">Completed & Billed</h6>
            <h2 className="fw-bold m-0 text-success">{completedRequests}</h2>
          </div>
        </div>
      </div>

      {/* 💬 DEDICATED SEPARATE CUSTOMER INQUIRIES PANEL */}
      {showInquiries && (
        <div className="bg-white border rounded-4 p-4 shadow-sm mb-4 border-start border-4 border-warning">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">💬 Customer Web Questions & Helpdesk Inquiries</h5>
            <span className="badge bg-warning text-dark fw-bold px-3 py-2">
              {inquiriesList.filter(i => i.status !== 'Completed').length} Pending Questions
            </span>
          </div>

          {inquiriesList.length === 0 ? (
            <p className="text-muted small m-0 p-3 bg-light rounded-3 text-center">🎉 Koi nayi customer inquiry pending nahi hai!</p>
          ) : (
            <div className="table-responsive border rounded-3">
              <table className="table table-hover align-middle m-0">
                <thead className="table-light small">
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone / Contact</th>
                    <th>Customer's Question</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {inquiriesList.map((inq) => {
                    const cleanQuestion = inq.notes ? inq.notes.replace('❓ Customer Question: ', '') : 'No question text';
                    const isDone = inq.status === 'Completed';

                    return (
                      <tr key={inq._id} className={isDone ? 'table-light text-muted' : ''}>
                        <td className="fw-bold text-dark">{inq.clientName}</td>
                        <td>
                          <a href={`tel:${inq.phone}`} className="text-decoration-none fw-bold text-primary">
                            📞 {inq.phone}
                          </a>
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          <span className="text-dark fw-semibold d-inline-block text-truncate" style={{ maxWidth: '280px' }} title={cleanQuestion}>
                            "{cleanQuestion}"
                          </span>
                        </td>
                        <td>{inq.bookingDate || 'Today'}</td>
                        <td>
                          <span className={`badge ${isDone ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                            {isDone ? 'Resolved' : 'Pending'}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              onClick={() => setSelectedInquiry(inq)} 
                              className="btn btn-xs btn-outline-dark fw-bold rounded-2"
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              🔍 View
                            </button>
                            {!isDone && (
                              <button 
                                onClick={() => markInquiryResolved(inq._id)} 
                                className="btn btn-xs btn-success fw-bold rounded-2"
                                style={{ fontSize: '11px', padding: '3px 8px' }}
                              >
                                ✓ Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REVENUE ANALYTICS PANEL */}
      {showAnalytics && (
        <div className="bg-white border rounded-4 p-4 shadow-sm mb-4 border-start border-4 border-success">
          <h5 className="fw-bold text-dark mb-3">💰 Business Revenue & Profit Analytics</h5>
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block fw-bold mb-1">Gross Revenue</small>
                <h3 className="fw-bold text-success m-0">₹{totalGrossRevenue.toLocaleString()}</h3>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block fw-bold mb-1">Visiting Charges</small>
                <h3 className="fw-bold text-primary m-0">₹{totalVisitingCharges.toLocaleString()}</h3>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block fw-bold mb-1">Spare Parts Billing</small>
                <h3 className="fw-bold text-info m-0">₹{totalSparePartsRevenue.toLocaleString()}</h3>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block fw-bold mb-1">Avg Order Value</small>
                <h3 className="fw-bold text-dark m-0">₹{averageOrderValue}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECTORY */}
      {showTechList && (
        <div className="bg-white border rounded-4 p-4 shadow-sm mb-4">
          <h5 className="fw-bold text-dark mb-3">Registered Technicians Directory</h5>
          {dbTechs.length === 0 ? (
            <p className="text-muted small">Koi technician registered nahi hai.</p>
          ) : (
            <div className="row g-3">
              {dbTechs.map((t) => (
                <div key={t._id || t.email} className="col-12 col-md-4">
                  <div className="border rounded-3 p-3 d-flex gap-3 align-items-center bg-light position-relative">
                    {(t.image || t.photo) ? (
                      <img src={t.image || t.photo} alt={t.name} style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '55px', height: '55px', fontWeight: 'bold' }}>
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-grow-1 pe-3">
                      <h6 className="fw-bold m-0 text-dark">{t.name}</h6>
                      <small className="text-muted d-block">🛠️ {t.specialty || 'General Expert'} | ⭐ {t.rating || 4.5}</small>
                      <small className="text-success d-block fw-bold">💰 Plan: ₹{t.planPrice || 0} ({t.subscriptionPlan || 'Basic'})</small>
                    </div>
                    <button onClick={() => deleteTechnician(t._id, t.name)} className="btn btn-sm btn-outline-danger border-0 rounded-circle p-2 position-absolute top-0 end-0 m-1">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REGISTER FORM */}
      {showAddForm && (
        <div className="bg-white border rounded-4 p-4 shadow-sm mb-4 border-primary border-3">
          <h6 className="fw-bold text-dark mb-3 fs-5">Register New Technician Account</h6>
          {statusMessage.text && (
            <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'} text-center small fw-bold py-2 mb-3`}>
              {statusMessage.text}
            </div>
          )}
          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="small fw-semibold text-muted mb-1">Full Name *</label>
                <input type="text" name="name" className="form-control form-control-sm rounded-3" value={formData.name} onChange={handleFormChange} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="small fw-semibold text-muted mb-1">Email Address *</label>
                <input type="email" name="email" className="form-control form-control-sm rounded-3" value={formData.email} onChange={handleFormChange} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="small fw-semibold text-muted mb-1">Password *</label>
                <input type="password" name="password" className="form-control form-control-sm rounded-3" value={formData.password} onChange={handleFormChange} required minLength={6} />
              </div>
              <div className="col-12 col-md-3">
                <label className="small fw-semibold text-muted mb-1">Phone Number *</label>
                <input type="text" name="phone" className="form-control form-control-sm rounded-3" value={formData.phone} onChange={handleFormChange} required />
              </div>
              <div className="col-12 col-md-3">
                <label className="small fw-semibold text-muted mb-1">Specialty *</label>
                <input type="text" name="specialty" className="form-control form-control-sm rounded-3" value={formData.specialty} onChange={handleFormChange} required />
              </div>
              <div className="col-12 col-md-2">
                <label className="small fw-semibold text-muted mb-1">Age</label>
                <input type="number" name="age" className="form-control form-control-sm rounded-3" value={formData.age} onChange={handleFormChange} />
              </div>
              <div className="col-12 col-md-4">
                <label className="small fw-bold text-dark mb-1">Plan Price (₹) *</label>
                <input type="number" name="planPrice" className="form-control form-control-sm fw-bold" value={formData.planPrice} onChange={handleFormChange} required />
              </div>
              <div className="col-12 col-md-6">
                <label className="small fw-semibold text-muted mb-1">Profile Photo</label>
                <input type="file" accept="image/*" className="form-control form-control-sm rounded-3" onChange={handleImageChange} />
              </div>
              <div className="col-12 col-md-6 d-flex align-items-center">
                <div className="p-2 bg-light border rounded-3 w-100 d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-bold">Tier Preview:</span>
                  <span className={`badge ${liveTierPreview.badge} px-3 py-2`}>{liveTierPreview.plan} ({liveTierPreview.rating})</span>
                </div>
              </div>
              <div className="col-12 text-end">
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm fw-bold rounded-3 px-4">
                  {submitting ? 'Saving...' : '💾 Save Technician'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 📋 MASTER REPAIR REQUESTS (CLEAN TABLE - ONLY APPLIANCE REPAIRS) */}
      {loading ? (
        <div className="text-center py-5 text-muted"><i className="fa-solid fa-spinner fa-spin me-2 fs-4"></i> Synchronizing database queue...</div>
      ) : (
        <div className="bg-white border rounded-4 p-4 shadow-sm">
          <h5 className="fw-bold text-dark mb-3">📋 Master Repair Requests</h5>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="text-muted small">
                  <th>Client Details</th>
                  <th>Service Requested</th>
                  <th>Status</th>
                  <th>Assigned Expert</th>
                  <th>Job Proofs & Billing</th>
                  <th>Action / Allocation</th>
                </tr>
              </thead>
              <tbody>
                {repairBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">Koi repair booking available nahi hai.</td>
                  </tr>
                ) : (
                  repairBookings.map((item) => {
                    const mapMatch = (item.notes || item.address || '').match(/https?:\/\/[^\s]+/);
                    const mapUrl = item.coordinates || (mapMatch ? mapMatch[0] : null);

                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="fw-bold text-dark">{item.clientName}</div>
                          <small className="text-muted d-block">📞 {item.phone}</small>
                          <small className="text-muted text-wrap d-block" style={{ maxWidth: '180px' }}>📍 {item.address}</small>
                          {mapUrl && (
                            <a href={mapUrl} target="_blank" rel="noreferrer" className="badge bg-warning text-dark text-decoration-none mt-1 d-inline-block fw-bold">
                              🗺️ Open GPS Map Location
                            </a>
                          )}
                        </td>

                        <td>
                          <span className="badge bg-light text-dark border">{item.serviceType}</span>
                          <small className="d-block text-muted mt-1">📅 {item.bookingDate || 'Today'}</small>
                        </td>

                        <td>
                          <span className={`badge ${item.status === 'Completed' ? 'bg-success-subtle text-success' : item.status === 'Accepted' ? 'bg-info-subtle text-info' : item.status === 'Assigned' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'} px-3 py-2 rounded-3 fw-bold`}>
                            {item.status || 'Pending'}
                          </span>
                        </td>

                        <td>
                          {item.status === 'Assigned' || item.status === 'Accepted' || item.status === 'Completed' ? (
                            <span className="text-dark fw-bold small d-block">
                              👨‍🔧 {item.assignedTechnician?.name || item.technician || 'Assigned'}
                            </span>
                          ) : (
                            <select 
                              className="form-select form-select-sm rounded-3 fw-bold border-primary" 
                              value={selectedTechs[item._id] || ''} 
                              onChange={(e) => handleTechChange(item._id, e.target.value)}
                            >
                              <option value="">Select Tech...</option>
                              {dbTechs.map((tech) => (
                                <option key={tech._id} value={tech._id}>
                                  {tech.name} ({tech.specialty || 'Expert'})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td>
                          <div className="d-flex flex-column gap-1">
                            <button onClick={() => setSelectedJobProof(item)} className="btn btn-xs btn-outline-dark fw-bold rounded-2 text-nowrap" style={{ fontSize: '11px', padding: '2px 8px' }}>
                              🔍 View Photos & Parts
                            </button>
                            {item.status === 'Completed' && (
                              <button onClick={() => { setInvoiceJob(item); setPaymentMode('UPI'); }} className="btn btn-xs btn-success fw-bold rounded-2 text-nowrap" style={{ fontSize: '11px', padding: '2px 8px' }}>
                                📄 PDF Invoice
                              </button>
                            )}
                          </div>
                        </td>

                        <td>
                          {item.status === 'Completed' ? (
                            <span className="text-success small fw-bold">✓ Job Resolved</span>
                          ) : (item.status === 'Assigned' || item.status === 'Accepted') ? (
                            <button className="btn btn-sm btn-danger fw-bold rounded-3 px-3" onClick={() => cancelAllocation(item._id)}>Cancel</button>
                          ) : (
                            <button className="btn btn-sm btn-primary fw-bold rounded-3 px-3" onClick={() => allocateTechnician(item._id)}>Allocate</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 💬 READ INQUIRY MODAL */}
      {selectedInquiry && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4 shadow">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h5 className="fw-bold text-dark m-0">💬 Customer Question Details</h5>
                <button onClick={() => setSelectedInquiry(null)} className="btn-close"></button>
              </div>

              <div className="bg-light p-3 rounded-3 border mb-3">
                <div className="mb-2">👤 <b>Customer Name:</b> {selectedInquiry.clientName}</div>
                <div className="mb-2">📞 <b>Contact Number:</b> <a href={`tel:${selectedInquiry.phone}`} className="fw-bold text-primary">{selectedInquiry.phone}</a></div>
                <div>📅 <b>Received Date:</b> {selectedInquiry.bookingDate || 'Today'}</div>
              </div>

              <div className="p-3 bg-warning-subtle border border-warning rounded-3 mb-3">
                <strong className="text-dark d-block mb-1">❓ Customer's Question:</strong>
                <p className="m-0 text-dark fs-6 fst-italic">
                  {selectedInquiry.notes ? selectedInquiry.notes.replace('❓ Customer Question: ', '') : 'No details provided.'}
                </p>
              </div>

              <div className="d-flex justify-content-end gap-2 border-top pt-3">
                <button onClick={() => setSelectedInquiry(null)} className="btn btn-sm btn-outline-secondary fw-bold rounded-3">Close</button>
                {selectedInquiry.status !== 'Completed' && (
                  <button onClick={() => markInquiryResolved(selectedInquiry._id)} className="btn btn-sm btn-success fw-bold rounded-3 px-3">
                    ✓ Mark as Answered & Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROOFS MODAL */}
      {selectedJobProof && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 p-4 shadow">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h5 className="fw-bold text-dark m-0">🔍 Work Inspection & Proofs Log</h5>
                <button onClick={() => setSelectedJobProof(null)} className="btn-close"></button>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-4 text-center">
                  <div className="border rounded-3 p-2 bg-light h-100">
                    <small className="fw-bold text-muted d-block mb-1">1. Customer Issue Photo</small>
                    {selectedJobProof.applianceImage ? (
                      <a href={selectedJobProof.applianceImage} target="_blank" rel="noreferrer">
                        <img src={selectedJobProof.applianceImage} alt="Appliance" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                      </a>
                    ) : (
                      <div className="py-4 text-muted small">No photo uploaded</div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-md-4 text-center">
                  <div className="border rounded-3 p-2 bg-light h-100">
                    <small className="fw-bold text-muted d-block mb-1">2. Before Repair Photo</small>
                    {selectedJobProof.beforeImage ? (
                      <a href={selectedJobProof.beforeImage} target="_blank" rel="noreferrer">
                        <img src={selectedJobProof.beforeImage} alt="Before" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                      </a>
                    ) : (
                      <div className="py-4 text-muted small">No Before photo</div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-md-4 text-center">
                  <div className="border rounded-3 p-2 bg-light h-100">
                    <small className="fw-bold text-muted d-block mb-1">3. After Repair Photo</small>
                    {selectedJobProof.afterImage ? (
                      <a href={selectedJobProof.afterImage} target="_blank" rel="noreferrer">
                        <img src={selectedJobProof.afterImage} alt="After" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                      </a>
                    ) : (
                      <div className="py-4 text-muted small">No After photo</div>
                    )}
                  </div>
                </div>

                <div className="col-12 text-end mt-3 border-top pt-2">
                  <span className="fw-bold me-3 text-primary">Total Amount: ₹{selectedJobProof.totalAmount || 350}</span>
                  <button onClick={() => setSelectedJobProof(null)} className="btn btn-sm btn-dark fw-bold rounded-3">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📄 FULL TAX INVOICE MODAL */}
      {invoiceJob && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 p-4 shadow bg-white" id="printable-invoice-content">
              
              <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-3 border mb-3 d-print-none">
                <span className="fw-bold text-dark small">Select Payment Mode:</span>
                <div className="btn-group" role="group">
                  <button type="button" className={`btn btn-sm fw-bold ${paymentMode === 'Cash' ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setPaymentMode('Cash')}>
                    💵 Cash Payment
                  </button>
                  <button type="button" className={`btn btn-sm fw-bold ${paymentMode === 'UPI' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPaymentMode('UPI')}>
                    📱 UPI / Online
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                  <h3 className="fw-bold text-primary m-0">FIXORA</h3>
                  <small className="text-muted">Elite Home Appliance Repair & Services</small>
                </div>
                <div className="text-end">
                  <h5 className="fw-bold text-dark m-0">TAX INVOICE</h5>
                  <small className="text-muted">Invoice #: FIX-{String(invoiceJob._id).slice(-6).toUpperCase()}</small>
                  <br />
                  <small className="text-muted">Date: {new Date().toLocaleDateString()}</small>
                </div>
              </div>

              <div className="row g-3 mb-3 small">
                <div className="col-6">
                  <div className="bg-light p-3 rounded-3 border h-100">
                    <strong className="text-dark d-block mb-1">Customer Details:</strong>
                    <div>Name: <b>{invoiceJob.clientName}</b></div>
                    <div>Phone: {invoiceJob.phone}</div>
                    <div>Address: {invoiceJob.address}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light p-3 rounded-3 border h-100">
                    <strong className="text-dark d-block mb-1">Service Details:</strong>
                    <div>Service: <b>{invoiceJob.serviceType}</b></div>
                    <div>Assigned Expert: <b>{invoiceJob.assignedTechnician?.name || invoiceJob.technician || 'Certified Tech'}</b></div>
                    <div>Status: <span className="badge bg-success">Job Completed</span></div>
                  </div>
                </div>
              </div>

              <div className="table-responsive border rounded-3 mb-3">
                <table className="table table-bordered align-middle m-0">
                  <thead className="table-dark small">
                    <tr>
                      <th>#</th>
                      <th>Service / Item Description</th>
                      <th className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    <tr>
                      <td>1</td>
                      <td>Visiting Charge & Diagnostic Fee</td>
                      <td className="text-end fw-bold">₹350</td>
                    </tr>
                    {invoiceJob.spareParts && invoiceJob.spareParts.map((part, index) => (
                      <tr key={index}>
                        <td>{index + 2}</td>
                        <td>Spare Part: {part.name}</td>
                        <td className="text-end fw-bold">₹{part.price}</td>
                      </tr>
                    ))}
                    <tr className="table-light">
                      <td colSpan="2" className="text-end fw-bold">Total Amount:</td>
                      <td className="text-end fw-bold fs-6 text-success">₹{invoiceJob.totalAmount || 350}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-light p-3 rounded-3 border mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="text-dark d-block mb-1">Payment Details:</strong>
                    <div className="small text-dark">
                      Payment Mode: <b className={paymentMode === 'Cash' ? 'text-success' : 'text-primary'}>
                        {paymentMode === 'Cash' ? '💵 Cash Payment' : '📱 UPI / Online Payment'}
                      </b>
                    </div>
                  </div>
                  <div className="text-end d-flex align-items-center gap-3">
                    {paymentMode === 'UPI' && (
                      <div className="text-center bg-white p-2 rounded-3 border shadow-sm">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`upi://pay?pa=fixora@upi&pn=FIXORA%20Services&am=${invoiceJob.totalAmount || 350}&cu=INR`)}`} 
                          alt="UPI QR Code" 
                          style={{ width: '80px', height: '80px' }} 
                        />
                        <small className="d-block fw-bold text-primary mt-1" style={{ fontSize: '10px' }}>Scan to Pay</small>
                      </div>
                    )}
                    <span className="badge bg-success px-3 py-2 fs-6">✓ Paid</span>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 border-top pt-3 d-print-none">
                <button onClick={() => setInvoiceJob(null)} className="btn btn-sm btn-outline-secondary fw-bold rounded-3">Close</button>
                <button onClick={() => window.print()} className="btn btn-sm btn-success fw-bold rounded-3 px-4">🖨️ Download / Print PDF Invoice</button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;