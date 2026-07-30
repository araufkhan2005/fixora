import React, { useState, useEffect } from 'react';

const technicianList = [
  { name: "Ramesh Kumar (AC Expert)", domain: "AC" },
  { name: "Suresh Patel (Fridge Pro)", domain: "Refrigerator" },
  { name: "Amit Verma (Motor Tech)", domain: "Washing Machine" },
  { name: "Vijay Shah (RO Specialist)", domain: "RO Water Purifier" },
  { name: "Karan Johar (Electrician)", domain: "Electrician" },
  { name: "Nitin Gadkari (Plumber)", domain: "Plumber" }
];

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [dbTechs, setDbTechs] = useState([]); // Database se live tech list mapping ke liye
  const [loading, setLoading] = useState(true);
  const [selectedTechs, setSelectedTechs] = useState({});
  
  // Naye Toggle Form aur Status Alerts ki states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', specialty: '', age: '', address: '',
    subscriptionPlan: 'Basic', planPrice: '', photo: ''
  });
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const BASE_API_URL = "http://localhost:5000/api/services";

  const fetchIncomingQueue = async () => {
    try {
      // 1. Fetch Bookings Queue
      const response = await fetch(BASE_API_URL);
      const data = await response.json();
      setQueue(data);

      // 2. Fetch Live Database Technicians (For Dynamic Dropdown Sync)
      const techResponse = await fetch(`${BASE_API_URL}/homepage-techs`);
      if (techResponse.ok) {
        const techData = await techResponse.json();
        setDbTechs(techData);
      }
    } catch (error) {
      alert("❌ Server sync validation failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomingQueue();
  }, []);

  const allocateTechnician = async (id) => {
    const selectedTechnician = selectedTechs[id];
    if (!selectedTechnician || selectedTechnician.startsWith("Select Tech")) {
      alert("⚠️ Please select a valid certified provider!");
      return;
    }

    try {
      const response = await fetch(`${BASE_API_URL}/allocate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technician: selectedTechnician, status: "Assigned" })
      });

      if (response.ok) {
        alert(`🚀 Task mapped to: ${selectedTechnician}`);
        fetchIncomingQueue();
      }
    } catch (error) {
      alert("❌ Operation failed.");
    }
  };

  const cancelAllocation = async (id) => {
    if (!window.confirm("Kya aap sach mein is technician ki allocation cancel karna chahte hain?")) return;

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

  // Naye Form Inputs handling logic
  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Naya Technician Database Submit Logic
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${BASE_API_URL}/add-technician`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await response.json();
      
      if (response.ok) {
        setStatusMessage({ type: 'success', text: `🎉 ${formData.name} Registered & Injected Successfully!` });
        setFormData({ name: '', phone: '', specialty: '', age: '', address: '', subscriptionPlan: 'Basic', planPrice: '', photo: '' });
        fetchIncomingQueue(); // Re-sync listing dynamic dropdowns
      } else {
        setStatusMessage({ type: 'error', text: `❌ Error: ${resData.error || 'Failed to save data'}` });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: '❌ Error: Network error or server offline.' });
    }
  };

  // 📊 CALCULATE LIVE ANALYTICS DATA
  const totalRequests = queue.length;
  const pendingRequests = queue.filter(item => item.status === 'Pending' || !item.status).length;
  const completedRequests = queue.filter(item => item.status === 'Completed').length;
  const assignedRequests = queue.filter(item => item.status === 'Assigned').length;

  const domainCounts = queue.reduce((acc, curr) => {
    const type = curr.serviceType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container-fluid px-4 py-4" style={{ marginTop: '30px' }}>
      
      {/* HEADER SECTION WITH TOGGLE BUTTON */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <h4 className="fw-bold m-0 text-dark"><i className="fa-solid fa-lock text-danger me-2"></i>ServiceHub Secret Command Center</h4>
          <p className="text-muted small m-0 mt-1">Authorized Operations Only.</p>
        </div>
        <div className="d-flex gap-2">
          {/* ➕ CUSTOM INJECTED FORM TOGGLE BUTTON */}
          <button 
            className={`btn btn-sm ${showAddForm ? 'btn-danger' : 'btn-dark'} fw-bold rounded-3`}
            onClick={() => { setShowAddForm(!showAddForm); setStatusMessage({ type: '', text: '' }); }}
          >
            {showAddForm ? <><i className="fa-solid fa-xmark me-1"></i> Close Form</> : <><i className="fa-solid fa-user-plus me-1"></i> Add Technician</>}
          </button>
          
          <a href="/" className="btn btn-sm btn-outline-secondary fw-bold rounded-3"><i className="fa-solid fa-arrow-left me-1"></i> Exit Admin</a>
          <button className="btn btn-sm btn-light border text-success fw-bold rounded-3" onClick={fetchIncomingQueue}>
            <i className="fa-solid fa-rotate me-1"></i> Refresh
          </button>
        </div>
      </div>

      {/* 📊 MULTI-METRICS COUNTERS GRID */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-primary border-4">
            <h6 className="text-muted small fw-semibold mb-1">Total Bookings</h6>
            <h2 className="fw-bold m-0 text-dark">{totalRequests}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-warning border-4">
            <h6 className="text-muted small fw-semibold mb-1">Pending Clear</h6>
            <h2 className="fw-bold m-0 text-warning">{pendingRequests}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-info border-4">
            <h6 className="text-muted small fw-semibold mb-1">On-Site Active</h6>
            <h2 className="fw-bold m-0 text-info">{assignedRequests}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-white border rounded-4 p-3 shadow-sm border-start border-success border-4">
            <h6 className="text-muted small fw-semibold mb-1">Jobs Resolved</h6>
            <h2 className="fw-bold m-0 text-success">{completedRequests}</h2>
          </div>
        </div>
      </div>

      {/* 🚀 NEW: TOGGLEABLE PREMIUM REGISTRATION FORM */}
      {showAddForm && (
        <div className="bg-white border rounded-4 p-4 shadow-sm mb-4">
          <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-circle-plus text-primary me-2"></i>Register New Premium Technician</h6>
          
          {statusMessage.text && (
            <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'} text-center small fw-bold py-2 mb-3`} role="alert">
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="small fw-semibold text-muted mb-1">Full Name</label>
                <input type="text" name="name" className="form-control form-control-sm rounded-3" value={formData.name} onChange={handleFormChange} required placeholder="e.g. Enter Your Name" />
              </div>
              <div className="col-12 col-md-3">
                <label className="small fw-semibold text-muted mb-1">Phone Number</label>
                <input type="text" name="phone" className="form-control form-control-sm rounded-3" value={formData.phone} onChange={handleFormChange} required placeholder="Phone Number" />
              </div>
              <div className="col-12 col-md-3">
                <label className="small fw-semibold text-muted mb-1">Specialty (Kaam)</label>
                <input type="text" name="specialty" className="form-control form-control-sm rounded-3" value={formData.specialty} onChange={handleFormChange} required placeholder="e.g. AC expert" />
              </div>
              <div className="col-4 col-md-2">
                <label className="small fw-semibold text-muted mb-1">Age</label>
                <input type="number" name="age" className="form-control form-control-sm rounded-3" value={formData.age} onChange={handleFormChange} required placeholder="Age" />
              </div>
              <div className="col-8 col-md-10">
                <label className="small fw-semibold text-muted mb-1">Profile Photo URL</label>
                <input type="text" name="photo" className="form-control form-control-sm rounded-3" value={formData.photo} onChange={handleFormChange} placeholder="https://image-link.com/pic.jpg" />
              </div>
              <div className="col-12">
                <label className="small fw-semibold text-muted mb-1">Address (🔒 Secure Field)</label>
                <textarea name="address" className="form-control form-control-sm rounded-3" rows="2" style={{ resize: 'none' }} value={formData.address} onChange={handleFormChange} required placeholder="Enter Your address"></textarea>
              </div>
              <div className="col-12 col-md-6">
                <label className="small fw-semibold text-muted mb-1">Subscription Plan</label>
                <select name="subscriptionPlan" className="form-select form-select-sm rounded-3" value={formData.subscriptionPlan} onChange={handleFormChange}>
                  <option value="Basic">Basic Plan (Auto 4.3 ★)</option>
                  <option value="Gold">Gold Plan (Auto 4.7 ★)</option>
                  <option value="Platinum">Platinum Plan (Auto 4.9 ★)</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="small fw-semibold text-muted mb-1">Plan Price (for Ranking)</label>
                <input type="number" name="planPrice" className="form-control form-control-sm rounded-3" value={formData.planPrice} onChange={handleFormChange} required placeholder="e.g. 4500" />
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-sm btn-primary fw-bold rounded-3 px-4">
                  <i className="fa-solid fa-cloud-arrow-up me-1"></i> Save Partner to Database
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 📈 VISUAL ANALYTICS MATRIX SECTION */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
            <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-chart-simple text-primary me-2"></i>Appliance Domain Distribution</h6>
            <div className="d-flex flex-column gap-3">
              {Object.keys(domainCounts).length === 0 ? (
                <p className="text-muted small">No data available yet</p>
              ) : (
                Object.entries(domainCounts).map(([domain, count], index) => {
                  const percentage = totalRequests > 0 ? ((count / totalRequests) * 100).toFixed(0) : 0;
                  return (
                    <div key={index}>
                      <div className="d-flex justify-content-between small fw-semibold text-muted mb-1">
                        <span>{domain}</span>
                        <span>{count} Requests ({percentage}%)</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '10px' }}>
                        <div className="progress-bar rounded-pill bg-primary" role="progressbar" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="bg-white border rounded-4 p-4 shadow-sm h-100 d-flex flex-column justify-content-center">
            <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-pie-chart text-accent-orange me-2"></i>Operational Efficiency Chart</h6>
            <div className="d-flex justify-content-around align-items-center py-2">
              <div className="text-center">
                <div className="fs-3 fw-bold text-warning">{totalRequests > 0 ? ((pendingRequests / totalRequests) * 100).toFixed(0) : 0}%</div>
                <small className="text-muted fw-bold">Backlog Queue</small>
              </div>
              <div className="text-center border-start border-end px-4">
                <div className="fs-3 fw-bold text-info">{totalRequests > 0 ? ((assignedRequests / totalRequests) * 100).toFixed(0) : 0}%</div>
                <small className="text-muted fw-bold">In Execution</small>
              </div>
              <div className="text-center">
                <div className="fs-3 fw-bold text-success">{totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(0) : 0}%</div>
                <small className="text-muted fw-bold">Resolution Rate</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted"><i className="fa-solid fa-spinner fa-spin me-2 fs-4"></i> Loading...</div>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <div className="d-none d-md-block bg-white border rounded-4 p-4 shadow-sm">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small">
                    <th>Client Name</th>
                    <th>Contact</th>
                    <th>Domain</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Assign Expert</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => (
                    <tr key={item._id}>
                      <td className="fw-bold text-dark">{item.clientName}</td>
                      <td>{item.phone}</td>
                      <td><span className="badge bg-light text-dark border">{item.serviceType}</span></td>
                      <td><small className="d-block text-muted text-wrap" style={{ maxWidth: '180px' }}>{item.address}</small></td>
                      <td>
                        <span className={`badge ${item.status === 'Completed' ? 'bg-success-subtle text-success' : item.status === 'Assigned' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'} px-3 py-2 rounded-3 fw-semibold`}>
                          {item.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        {item.status === 'Assigned' || item.status === 'Completed' ? (
                          <span className="text-dark fw-semibold small"><i className="fa-solid fa-user-check text-success me-1"></i> {item.technician || 'Assigned'}</span>
                        ) : (
                          <select className="form-select form-select-sm" value={selectedTechs[item._id] || ''} onChange={(e) => handleTechChange(item._id, e.target.value)}>
                            <option value="">Select Tech...</option>
                            {/* Live Database se aaye dynamic technicians */}
                            {dbTechs.map((tech, idx) => (
                              <option key={`db-${idx}`} value={`${tech.name} (${tech.specialty})`}>{tech.name} ({tech.specialty})</option>
                            ))}
                            {/* Fallback original static list */}
                            {dbTechs.length === 0 && technicianList.map((tech, idx) => (
                              <option key={idx} value={tech.name}>{tech.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        {item.status === 'Completed' ? (
                          <span className="text-success small fw-bold"><i className="fa-solid fa-circle-check"></i> Job Done</span>
                        ) : item.status === 'Assigned' ? (
                          <button className="btn btn-sm btn-danger fw-bold rounded-3 px-3" onClick={() => cancelAllocation(item._id)}><i className="fa-solid fa-xmark me-1"></i> Cancel</button>
                        ) : (
                          <button className="btn btn-sm btn-primary fw-bold rounded-3 px-3" onClick={() => allocateTechnician(item._id)}>Allocate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* MOBILE CARDS VIEW */}
          <div className="d-block d-md-none">
            {queue.map((item) => (
              <div key={item._id} className="bg-white border rounded-4 p-3 mb-3 shadow-sm">
                <div className="d-flex justify-content-between mb-2 small"><span className="text-muted fw-bold">Client:</span><span className="fw-bold text-dark">{item.clientName}</span></div>
                <div className="d-flex justify-content-between mb-2 small"><span className="text-muted fw-bold">Domain:</span><span className="badge bg-light text-dark border">{item.serviceType}</span></div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted fw-bold">Status:</span>
                  <span className={`badge ${item.status === 'Completed' ? 'bg-success-subtle text-success' : item.status === 'Assigned' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'} fw-semibold`}>{item.status || 'Pending'}</span>
                </div>
                <div className="mt-3">
                  {item.status === 'Completed' ? (
                    <div className="text-success text-center small fw-bold"><i className="fa-solid fa-circle-check"></i> Resolved by {item.technician}</div>
                  ) : item.status === 'Assigned' ? (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small fw-bold"><i className="fa-solid fa-user-check text-success me-1"></i> {item.technician}</span>
                      <button className="btn btn-sm btn-danger fw-bold" onClick={() => cancelAllocation(item._id)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm" style={{ width: '60%' }} value={selectedTechs[item._id] || ''} onChange={(e) => handleTechChange(item._id, e.target.value)}>
                        <option value="">Select Tech...</option>
                        {dbTechs.map((tech, idx) => (
                          <option key={`db-mb-${idx}`} value={`${tech.name} (${tech.specialty})`}>{tech.name}</option>
                        ))}
                        {dbTechs.length === 0 && technicianList.map((tech, idx) => (
                          <option key={idx} value={tech.name}>{tech.name}</option>
                        ))}
                      </select>
                      <button className="btn btn-sm btn-primary fw-bold" style={{ width: '40%' }} onClick={() => allocateTechnician(item._id)}>Allocate</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;