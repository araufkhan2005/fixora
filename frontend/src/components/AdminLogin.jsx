import React, { useState } from 'react';

function AdminLogin({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'user') {
      onLoginSuccess();
    } else {
      setError('❌ Invalid Credentials! Access Denied.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card border-0 shadow-lg p-5 rounded-4" style={{ maxWidth: '450px', width: '100%', background: '#ffffff' }}>
        <div className="text-center mb-4">
          <div className="mb-2" style={{ fontSize: '2.5rem', color: 'var(--primary-blue)' }}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h3 className="fw-bold text-dark m-0">Admin Login Panel</h3>
          <p className="text-muted small mt-1">Fixora Authorized Personnel Only</p>
        </div>

        {error && <div className="alert alert-danger small py-2 text-center rounded-3">{error}</div>}

        <form onSubmit={handleLoginSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label small fw-bold text-muted">Admin Username</label>
            <input type="text" className="form-control form-input-premium p-3" placeholder="Enter username" value={username} required onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="form-label small fw-bold text-muted">Secure Password</label>
            <input type="password" className="form-control form-input-premium p-3" placeholder="••••••••••••" value={password} required onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-execution-pro w-100 fw-bold py-3 mt-2 rounded-3">
            <i className="fa-solid fa-key me-2"></i>Verify & Unlock
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