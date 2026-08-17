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

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    specialty: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const endpoint = isLogin ? `${AUTH_API}/login` : `${AUTH_API}/register`;
    const payload = isLogin 
      ? { email: formData.email.trim().toLowerCase(), password: formData.password }
      : { ...formData, email: formData.email.trim().toLowerCase() };

    try {
      const response = await axios.post(endpoint, payload);
      const userData = response.data;
      
      // 🔑 Save Token & User in LocalStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('userToken', userData.token);
      if (userData.role === 'admin') {
        localStorage.setItem('adminToken', userData.token);
      }
      localStorage.setItem('user', JSON.stringify(userData));

      setSuccessMessage(isLogin ? '🎉 Login Successful!' : '✅ Account Created Successfully!');
      
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        } else {
          window.location.reload();
        }
      }, 700);

    } catch (error) {
      console.error("Auth submit error:", error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      
      if (serverMsg) {
        setErrorMessage(`❌ ${serverMsg}`);
      } else if (error.code === "ERR_NETWORK") {
        setErrorMessage("❌ Backend server se connection nahi hua! Terminal me backend start karein.");
      } else {
        setErrorMessage("❌ Invalid Email ya Password!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: 'bold' }}>🔧 FIXORA</h1>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            {isLogin ? 'Sign in to access your portal' : 'Create an account to continue'}
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setErrorMessage(''); }}
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: isLogin ? '#ffffff' : 'transparent', color: isLogin ? '#0f172a' : '#64748b', boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setErrorMessage(''); }}
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: !isLogin ? '#ffffff' : 'transparent', color: !isLogin ? '#0f172a' : '#64748b', boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            Register
          </button>
        </div>

        {errorMessage && (
          <div style={{ padding: '12px 14px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div style={{ padding: '12px 14px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your Name" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="10-digit mobile number" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Registering As:</label>
                <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                  <option value="customer">Customer (Book Services)</option>
                  <option value="technician">Technician (Partner)</option>
                  <option value="admin">Admin (Full Control)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Area, City" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter registered email" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="••••••••" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Auth;