import React, { useState } from 'react';
import axios from 'axios';

function AdminLogin({ onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ⚡ Live Render Production Backend Login Endpoint
      const response = await axios.post('https://fixora-backend-fsn5.onrender.com/api/auth/login', {
        email: email,
        password: password
      });

      const userData = response.data;

      // Check if logged in user is actually an admin
      if (userData.role !== 'admin') {
        setError('❌ Access Denied! Only Admin accounts can access this panel.');
        setLoading(false);
        return;
      }

      // 🔑 Save Token & User object in LocalStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('userToken', userData.token);
      localStorage.setItem('adminToken', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));

      setLoading(false);
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      } else {
        window.location.reload();
      }

    } catch (err) {
      console.error("Admin Login Error:", err);
      setLoading(false);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      
      if (serverMsg) {
        setError(`❌ ${serverMsg}`);
      } else if (err.code === "ERR_NETWORK") {
        setError("❌ Server Se Connection Fail! Backend wake-up me 20-30 seconds lag sakte hain, 1 minute baad refresh karein.");
      } else {
        setError("❌ Invalid Credentials or Server Error!");
      }
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card border-0 shadow-lg p-5 rounded-4" style={{ maxWidth: '450px', width: '100%', background: '#ffffff' }}>
        <div className="text-center mb-4">
          <div className="mb-2" style={{ fontSize: '2.5rem', color: '#2563eb' }}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h3 className="fw-bold text-dark m-0">Admin Login Panel</h3>
          <p className="text-muted small mt-1">Fixora Authorized Personnel Only</p>
        </div>

        {error && <div className="alert alert-danger small py-2 text-center rounded-3">{error}</div>}

        <form onSubmit={handleLoginSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label small fw-bold text-muted">Admin Email Address</label>
            <input 
              type="email" 
              className="form-control p-3 rounded-3" 
              placeholder="Enter admin email" 
              value={email} 
              required 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="form-label small fw-bold text-muted">Secure Password</label>
            <input 
              type="password" 
              className="form-control p-3 rounded-3" 
              placeholder="••••••••••••" 
              value={password} 
              required 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-100 fw-bold py-3 mt-2 rounded-3">
            <i className="fa-solid fa-key me-2"></i>
            {loading ? 'Verifying & Unlocking...' : 'Verify & Unlock'}
          </button>
          <button type="button" className="btn btn-link text-muted small text-decoration-none mt-1" onClick={onCancel}>
            <i className="fa-solid fa-arrow-left me-1"></i> Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;