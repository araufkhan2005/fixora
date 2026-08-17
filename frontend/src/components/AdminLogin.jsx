import React, { useState } from 'react';
import axios from 'axios';

// ⚡ Built-in Auto-Switch (Offline Localhost & Online Render)
const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);
const AUTH_API = isLocal 
  ? 'http://127.0.0.1:5000/api/auth' 
  : 'https://fixora-backend-fsn5.onrender.com/api/auth';

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
      const response = await axios.post(`${AUTH_API}/login`, {
        email: email.trim().toLowerCase(),
        password: password
      });

      const userData = response.data;

      localStorage.setItem('token', userData.token);
      localStorage.setItem('userToken', userData.token);
      if (userData.role === 'admin') {
        localStorage.setItem('adminToken', userData.token);
      }
      localStorage.setItem('user', JSON.stringify(userData));

      setLoading(false);
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      } else {
        window.location.reload();
      }

    } catch (err) {
      console.error("Login Error:", err);
      setLoading(false);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      
      if (serverMsg) {
        setError(`❌ ${serverMsg}`);
      } else if (err.code === "ERR_NETWORK") {
        setError("❌ Backend server offline hai! Terminal me backend run karein.");
      } else {
        setError("❌ Invalid Email or Password!");
      }
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card border-0 shadow-lg p-5 rounded-4" style={{ maxWidth: '450px', width: '100%', background: '#ffffff' }}>
        <div className="text-center mb-4">
          <div className="mb-2" style={{ fontSize: '2.5rem', color: '#2563eb' }}>
            <i className="fa-solid fa-lock"></i>
          </div>
          <h3 className="fw-bold text-dark m-0">Login</h3>
          <p className="text-muted small mt-1">Sign in to Fixora Portal</p>
        </div>

        {error && <div className="alert alert-danger small py-2 text-center rounded-3">{error}</div>}

        <form onSubmit={handleLoginSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label small fw-bold text-muted">Email Address</label>
            <input 
              type="email" 
              className="form-control p-3 rounded-3" 
              placeholder="Enter your registered email" 
              value={email} 
              required 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="form-label small fw-bold text-muted">Password</label>
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
            <i className="fa-solid fa-right-to-bracket me-2"></i>
            {loading ? 'Logging in...' : 'Login'}
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