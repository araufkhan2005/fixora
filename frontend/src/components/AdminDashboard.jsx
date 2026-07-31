import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [dbTechs, setDbTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechs, setSelectedTechs] = useState({});
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTechList, setShowTechList] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // 📄 MODAL STATES FOR PROOF & INVOICE
  const [selectedJobProof, setSelectedJobProof] = useState(null);
  const [invoiceJob, setInvoiceJob] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash'); // 'Cash' or 'UPI'

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', specialty: '',
    age: '', address: '', subscriptionPlan: 'Basic', planPrice: '', image: ''
  });
  
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const BASE_API_URL = "http://127.0.0.1:5000/api/services";

  const fetchIncomingQueue = async () => {
    try {
      const response = await fetch(BASE_API_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setQueue(data);
      }

      const techResponse = await fetch(`${BASE_API_URL}/homepage-techs`);
      if (techResponse.ok) {
        const techData = await techResponse.json();
        if (Array.isArray(techData)) {
          setDbTechs(techData);
        }
      }
    } catch (error) {
      console.error("Server sync failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomingQueue();
  }, []);

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

    try {
      const response = await fetch(`${BASE_API_URL}/allocate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technician: selectedTechId, status: "Assigned" })
      });

      if (response.ok) {
        alert(`🚀 Task successfully assigned!`);
        fetchIncomingQueue();
      } else {
        const errData = await response.json();
        alert(`❌ Allocation failed: ${errData.message || 'Error'}`);
      }
    } catch (error) {
      alert("❌ Server connection error during allocation.");
    }
  };

  const cancelAllocation = async (id) => {
    if (!window.confirm("Kya aap sach mein is allocation ko cancel karna chahte hain?")) return;

    try {
      const response = await fetch(`${BASE_API_URL}/allocate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technician: "", status: "Pending" })
      });

      if (response.ok) {
        alert("❌ Assignment Cancelled!");
        fetchIncomingQueue();
      }
    } catch (error) {
      alert("❌ Server connection lost.");
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

    try {
      const response = await fetch(`${BASE_API_URL}/add-technician`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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

  // 🖨️ PRINT / DOWNLOAD PDF INVOICE
  const handlePrintInvoice = () => {
    window.print();
  };

  // 📊 CALCULATE REVENUE METRICS
  const totalRequests = queue.length;
  const pendingRequests = queue.filter(item => item.status === 'Pending' || !item.status).length;
  const completedJobsList = queue.filter(item => item.status === 'Completed');
  const completedRequests = completedJobsList.length;
  const assignedRequests = queue.filter(item => item.status === 'Assigned' || item.status === 'Accepted').length;

  const totalGrossRevenue = completedJobsList.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 350), 0);
  const totalVisitingCharges = completedRequests * 350;
  const totalSparePartsRevenue = totalGrossRevenue > totalVisitingCharges ? totalGrossRevenue - totalVisitingCharges : 0;
  const averageOrderValue = completedRequests > 0 ? Math.round(totalGrossRevenue / completedRequests) : 0;

  // 📊 TECHNICIAN REVENUE LEADERBOARD
  const techPerformanceMap = {};
  completedJobsList.forEach(job => {
    const techName = job.assignedTechnician?.name || job.technician || 'General Tech';
    if (!techPerformanceMap[techName]) {
      techPerformanceMap[techName] = { completedJobs: 0, totalRevenue: 0 };
    }
    techPerformanceMap[techName].completedJobs += 1;
    techPerformanceMap[techName].totalRevenue += (Number(job.totalAmount) || 350);
  });

  return (
    <div className="container-fluid px-4 py-4" style={{ marginTop: '30px' }}>
      
      {/* 🖨️ STRICT SINGLE PAGE CARD PRINT RULE */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          html, body {
            height: 100% !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-content, #printable-invoice-content * {
            visibility: visible !important;
          }
          #printable-invoice-content {
            position: absolute !important;
            left: 50% !important;
            top: 5mm !important;
            transform: translateX(-50%) !important;
            width: 85% !important;
            max-width: 620px !important;
            margin: 0 !important;
            padding: 16px 20px !important;
            border: 1px solid #ced4da !important;
            border-radius: 16px !important;
            background: #ffffff !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>

      {/* HEADER SECTION WITH TOGGLES */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold m-0 text-dark"><i className="fa-solid fa-lock text-danger me-2"></i>FIXORA Operations Command Center</h4>
          <p className="text-muted small m-0 mt-1">Authorized Operations, Revenue Analytics & Billing Console.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button 
            className={`btn btn-sm ${showAnalytics ? 'btn-success' : 'btn-outline-success'} fw-bold rounded-3`}
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            📊 {showAnalytics ? 'Hide Analytics' : 'Revenue Analytics'}
          </button>

          <button 
            className="btn btn-sm btn-info text-white fw-bold rounded-3"
            onClick={() => setShowTechList(!showTechList)}
          >
            👥 {showTechList ? 'Hide Directory' : `Techs (${dbTechs.length})`}
          </button>

          <button 
            className={`btn btn-sm ${showAddForm ? 'btn-danger' : 'btn-dark'} fw-bold rounded-3`}
            onClick={() => { setShowAddForm(!showAddForm); setStatusMessage({ type: '', text: '' }); }}
          >
            {showAddForm ? '❌ Close Form' : '➕ Add Tech'}
          </button>
          
          <button className="btn btn-sm btn-light border text-success fw-bold rounded-3" onClick={fetchIncomingQueue}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* METRICS COUNTERS GRID */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-primary border-4">
            <h6 className="text-muted small fw-semibold mb-1">Total Bookings</h6>
            <h2 className="fw-bold m-0 text-dark">{totalRequests}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-warning border-4">
            <h6 className="text-muted small fw-semibold mb-1">Pending Requests</h6>
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

      {/* REVENUE & EARNINGS ANALYTICS PANEL */}
      {showAnalytics && (
        <div className="bg-white border rounded-4 p-4 shadow-sm mb-4 border-start border-4 border-success">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">💰 Business Revenue & Profit Analytics</h5>
            <span className="badge bg-success-subtle text-success fw-bold px-3 py-2">Live Cashflow Sync</span>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-3">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block fw-bold mb-1">Gross Business Revenue</small>
                <h3 className="fw-bold text-success m-0">₹{totalGrossRevenue.toLocaleString()}</h3>
                <small className="text-muted">From {completedRequests} completed jobs</small>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block fw-bold mb-1">Visiting Charges Revenue</small>
                <h3 className="fw-bold text-primary m-0">₹{totalVisitingCharges.toLocaleString()}</h3>
                <small className="text-muted">Fixed ₹350 per ticket</small>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block fw-bold mb-1">Spare Parts Billing</small>
                <h3 className="fw-bold text-info m-0">₹{totalSparePartsRevenue.toLocaleString()}</h3>
                <small className="text-muted">Parts installed by technicians</small>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block fw-bold mb-1">Avg Order Value (AOV)</small>
                <h3 className="fw-bold text-dark m-0">₹{averageOrderValue}</h3>
                <small className="text-muted">Per resolved booking</small>
              </div>
            </div>
          </div>

          <h6 className="fw-bold text-dark mb-2">🏆 Technician Earnings & Order Leaderboard</h6>
          {Object.keys(techPerformanceMap).length === 0 ? (
            <p className="text-muted small m-0">Abhi tak kisi technician ne job complete nahi ki hai.</p>
          ) : (
            <div className="table-responsive border rounded-3">
              <table className="table table-sm align-middle m-0">
                <thead className="table-light small">
                  <tr>
                    <th>Technician Name</th>
                    <th>Jobs Completed</th>
                    <th>Total Revenue Generated</th>
                    <th>Revenue Contribution Share</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {Object.entries(techPerformanceMap).map(([tech, data], idx) => {
                    const share = totalGrossRevenue > 0 ? Math.round((data.totalRevenue / totalGrossRevenue) * 100) : 0;
                    return (
                      <tr key={idx}>
                        <td className="fw-bold text-dark">👨‍🔧 {tech}</td>
                        <td><span className="badge bg-secondary">{data.completedJobs} Jobs</span></td>
                        <td className="fw-bold text-success">₹{data.totalRevenue}</td>
                        <td style={{ minWidth: '160px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '8px' }}>
                              <div className="progress-bar bg-success rounded-pill" style={{ width: `${share}%` }}></div>
                            </div>
                            <span className="fw-bold text-muted">{share}%</span>
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

      {/* VIEW TECHNICIANS DIRECTORY */}
      {showTechList && (
        <div className="bg-white border rounded-4 p-4 shadow-sm mb-4">
          <h5 className="fw-bold text-dark mb-3">Registered Technicians Directory</h5>
          {dbTechs.length === 0 ? (
            <p className="text-muted small">Koi technician registered nahi hai.</p>
          ) : (
            <div className="row g-3">
              {dbTechs.map((t, idx) => (
                <div key={idx} className="col-12 col-md-4">
                  <div className="border rounded-3 p-3 d-flex gap-3 align-items-center bg-light">
                    {(t.image || t.photo) ? (
                      <img src={t.image || t.photo} alt={t.name} style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '55px', height: '55px', fontWeight: 'bold', fontSize: '18px' }}>
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h6 className="fw-bold m-0 text-dark">{t.name}</h6>
                      <small className="text-muted d-block">🛠️ {t.specialty || 'General Expert'} | ⭐ {t.rating || 4.5} Rating</small>
                      <small className="text-primary d-block">✉️ {t.email}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REGISTER NEW TECHNICIAN FORM */}
      {showAddForm && (
        <div className="bg-white border rounded-4 p-4 shadow-sm mb-4">
          <h6 className="fw-bold text-dark mb-3">Register New Technician Account</h6>
          
          {statusMessage.text && (
            <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'} text-center small fw-bold py-2 mb-3`} role="alert">
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="small fw-semibold text-muted mb-1">Full Name *</label>
                <input type="text" name="name" className="form-control form-control-sm rounded-3" value={formData.name} onChange={handleFormChange} required placeholder="e.g. Raj Patel" />
              </div>

              <div className="col-12 col-md-4">
                <label className="small fw-semibold text-muted mb-1">Email Address *</label>
                <input type="email" name="email" className="form-control form-control-sm rounded-3" value={formData.email} onChange={handleFormChange} required placeholder="raj123@gmail.com" />
              </div>

              <div className="col-12 col-md-4">
                <label className="small fw-semibold text-muted mb-1">Password *</label>
                <input type="password" name="password" className="form-control form-control-sm rounded-3" value={formData.password} onChange={handleFormChange} required minLength={6} placeholder="raj12345" />
              </div>

              <div className="col-12 col-md-3">
                <label className="small fw-semibold text-muted mb-1">Phone Number *</label>
                <input type="text" name="phone" className="form-control form-control-sm rounded-3" value={formData.phone} onChange={handleFormChange} required placeholder="9988776655" />
              </div>

              <div className="col-12 col-md-3">
                <label className="small fw-semibold text-muted mb-1">Specialty</label>
                <input type="text" name="specialty" className="form-control form-control-sm rounded-3" value={formData.specialty} onChange={handleFormChange} placeholder="Fridge expert" />
              </div>

              <div className="col-12 col-md-2">
                <label className="small fw-semibold text-muted mb-1">Age</label>
                <input type="number" name="age" className="form-control form-control-sm rounded-3" value={formData.age} onChange={handleFormChange} placeholder="e.g. 26" />
              </div>

              <div className="col-12 col-md-4">
                <label className="small fw-semibold text-muted mb-1">Profile Photo</label>
                <input type="file" accept="image/*" className="form-control form-control-sm rounded-3" onChange={handleImageChange} />
              </div>

              <div className="col-12 text-end">
                <button type="submit" disabled={submitting} className="btn btn-sm btn-primary fw-bold rounded-3 px-4">
                  {submitting ? 'Saving...' : '💾 Save Technician'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* BOOKINGS MAIN TABLE */}
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
                {queue.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="fw-bold text-dark">{item.clientName}</div>
                      <small className="text-muted d-block">📞 {item.phone}</small>
                      <small className="text-muted text-wrap d-block" style={{ maxWidth: '180px' }}>📍 {item.address}</small>
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
                        <select className="form-select form-select-sm rounded-3" value={selectedTechs[item._id] || ''} onChange={(e) => handleTechChange(item._id, e.target.value)}>
                          <option value="">Select Tech...</option>
                          {dbTechs.map((tech) => (
                            <option key={tech._id} value={tech._id}>
                              {tech.name} ({tech.specialty || 'Expert'})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* PROOFS & BILLING BUTTONS */}
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <button 
                          onClick={() => setSelectedJobProof(item)}
                          className="btn btn-xs btn-outline-dark fw-bold rounded-2 text-nowrap"
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                        >
                          🔍 View Photos & Parts
                        </button>

                        {item.status === 'Completed' && (
                          <button 
                            onClick={() => { setInvoiceJob(item); setPaymentMode('Cash'); }}
                            className="btn btn-xs btn-success fw-bold rounded-2 text-nowrap"
                            style={{ fontSize: '11px', padding: '2px 8px' }}
                          >
                            📄 PDF Invoice
                          </button>
                        )}
                      </div>
                    </td>

                    <td>
                      {item.status === 'Completed' ? (
                        <span className="text-success small fw-bold">✓ Job Resolved</span>
                      ) : (item.status === 'Assigned' || item.status === 'Accepted') ? (
                        <button className="btn btn-sm btn-danger fw-bold rounded-3 px-3" onClick={() => cancelAllocation(item._id)}>
                          Cancel
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-primary fw-bold rounded-3 px-3" onClick={() => allocateTechnician(item._id)}>
                          Allocate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: PROOFS LOG */}
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

                <div className="col-12 mt-3">
                  <h6 className="fw-bold text-dark mb-2">⚙️ Spare Parts Installed:</h6>
                  {(!selectedJobProof.spareParts || selectedJobProof.spareParts.length === 0) ? (
                    <p className="text-muted small bg-light p-2 rounded">Koi extra spare parts use nahi hua.</p>
                  ) : (
                    <div className="table-responsive border rounded-3">
                      <table className="table table-sm m-0 align-middle">
                        <thead className="table-light small">
                          <tr>
                            <th>Part Name / Qty</th>
                            <th className="text-end">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedJobProof.spareParts.map((part, idx) => (
                            <tr key={idx} className="small">
                              <td>{part.name}</td>
                              <td className="text-end fw-bold">₹{part.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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

      {/* MODAL 2: PRINTABLE PDF INVOICE */}
      {invoiceJob && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 p-3 shadow bg-white" id="printable-invoice-content">
              
              {/* PAYMENT MODE SELECTION BUTTONS (Hidden during PDF print) */}
              <div className="d-flex align-items-center justify-content-between bg-light p-2 px-3 rounded-3 border mb-2 d-print-none">
                <span className="fw-bold text-dark small">Select Payment Mode for Bill:</span>
                <div className="btn-group" role="group">
                  <button 
                    type="button" 
                    className={`btn btn-sm fw-bold ${paymentMode === 'Cash' ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => setPaymentMode('Cash')}
                  >
                    💵 Cash Payment
                  </button>
                  <button 
                    type="button" 
                    className={`btn btn-sm fw-bold ${paymentMode === 'UPI' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setPaymentMode('UPI')}
                  >
                    📱 UPI / Online
                  </button>
                </div>
              </div>

              {/* INVOICE HEADER */}
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div>
                  <h4 className="fw-bold text-primary m-0">FIXORA</h4>
                  <small className="text-muted" style={{ fontSize: '11px' }}>Elite Home Appliance Repair & Services</small>
                </div>
                <div className="text-end">
                  <h6 className="fw-bold text-dark m-0">TAX INVOICE</h6>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>Invoice #: FIX-{invoiceJob._id.slice(-6).toUpperCase()}</small>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>Date: {new Date().toLocaleDateString()}</small>
                </div>
              </div>

              {/* CLIENT & TECH INFO */}
              <div className="row g-2 mb-2 small" style={{ fontSize: '12px' }}>
                <div className="col-6">
                  <div className="bg-light p-2 rounded-3 border">
                    <strong className="text-dark d-block mb-1">Customer Details:</strong>
                    <div>Name: <b>{invoiceJob.clientName}</b></div>
                    <div>Phone: {invoiceJob.phone}</div>
                    <div>Address: {invoiceJob.address}</div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="bg-light p-2 rounded-3 border">
                    <strong className="text-dark d-block mb-1">Service & Specialist Info:</strong>
                    <div>Service: <b>{invoiceJob.serviceType}</b></div>
                    <div>Assigned Expert: {invoiceJob.assignedTechnician?.name || invoiceJob.technician || 'Certified Tech'}</div>
                    <div>Status: <span className="badge bg-success" style={{ fontSize: '10px' }}>Job Completed</span></div>
                  </div>
                </div>
              </div>

              {/* ITEMIZED BILLING TABLE */}
              <div className="table-responsive border rounded-3 mb-2">
                <table className="table table-sm table-bordered align-middle m-0">
                  <thead className="table-dark small">
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Service / Item Description</th>
                      <th className="text-end" style={{ width: '120px' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="small" style={{ fontSize: '12px' }}>
                    <tr>
                      <td>1</td>
                      <td>Visiting Charge & Diagnostic Repair Fee</td>
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
                      <td colSpan="2" className="text-end fw-bold">Total Amount Payable:</td>
                      <td className="text-end fw-bold text-success">₹{invoiceJob.totalAmount || 350}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 🟢 PAYMENT METHOD & STATUS */}
              <div className="bg-light p-2 px-3 rounded-3 border mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="text-dark d-block mb-1" style={{ fontSize: '12px' }}>Payment Method & Status:</strong>
                    <div className="small text-dark" style={{ fontSize: '12px' }}>
                      Payment Mode: <b className={paymentMode === 'Cash' ? 'text-success' : 'text-primary'}>
                        {paymentMode === 'Cash' ? '💵 Cash Payment' : '📱 UPI / Online Payment'}
                      </b>
                    </div>
                    {paymentMode === 'UPI' && (
                      <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                        Merchant UPI ID: <b>fixora@upi</b>
                      </small>
                    )}
                  </div>

                  <div className="text-end">
                    {paymentMode === 'Cash' ? (
                      <span className="badge bg-success px-3 py-2" style={{ fontSize: '12px' }}>
                        ✓ Cash Payment Done
                      </span>
                    ) : (
                      <>
                        {/* SCREEN PREVIEW PAR QR CODE DIKHEGA (HIDDEN IN PRINT) */}
                        <div className="text-center bg-white p-1 rounded-3 border shadow-sm d-print-none">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`upi://pay?pa=fixora@upi&pn=FIXORA%20Services&am=${invoiceJob.totalAmount || 350}&cu=INR`)}`} 
                            alt="UPI QR Code" 
                            style={{ width: '70px', height: '70px' }} 
                          />
                          <small className="d-block fw-bold text-primary" style={{ fontSize: '9px' }}>
                            Scan to Pay ₹{invoiceJob.totalAmount || 350}
                          </small>
                        </div>

                        {/* PDF PRINT PAR SIRF BADGE DIKHEGA */}
                        <span className="badge bg-primary px-3 py-2 d-none d-print-inline-block" style={{ fontSize: '12px' }}>
                          ✓ UPI Payment Done
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-muted text-center m-0 mb-2" style={{ fontSize: '10px' }}>Thank you for choosing FIXORA! Official system-generated tax invoice.</p>

              {/* ACTION BUTTONS (Hidden during print) */}
              <div className="d-flex justify-content-end gap-2 border-top pt-2 d-print-none">
                <button onClick={() => setInvoiceJob(null)} className="btn btn-sm btn-outline-secondary fw-bold rounded-3">
                  Close
                </button>
                <button onClick={handlePrintInvoice} className="btn btn-sm btn-success fw-bold rounded-3 px-4">
                  🖨️ Download / Print PDF Invoice
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;