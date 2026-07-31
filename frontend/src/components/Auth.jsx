import React, { useState } from 'react';
import axios from 'axios';

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

        const endpoint = isLogin 
            ? 'http://127.0.0.1:5000/api/auth/login' 
            : 'http://127.0.0.1:5000/api/auth/register';

        const payload = isLogin 
            ? { email: formData.email, password: formData.password }
            : formData;

        try {
            const response = await axios.post(endpoint, payload);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));

            setSuccessMessage(isLogin ? '🎉 Login Successful!' : '✅ Account Created Successfully!');
            
            setTimeout(() => {
                if (onLoginSuccess) {
                    onLoginSuccess(response.data);
                } else {
                    window.location.reload();
                }
            }, 1000);

        } catch (error) {
            console.error("Auth submit error:", error);
            const serverMsg = error.response?.data?.message || error.response?.data?.error;
            
            if (serverMsg) {
                setErrorMessage(serverMsg);
            } else if (error.code === "ERR_NETWORK") {
                setErrorMessage("❌ Backend server band hai! VS Code terminal par 'node index.js' chalao.");
            } else {
                setErrorMessage(error.message || 'Server se connection fail ho gaya.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                
                {/* BRAND HEADER */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: 'bold' }}>🔧 FIXORA</h1>
                    <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        {isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to book home services.'}
                    </p>
                </div>

                {/* TOGGLE TABS */}
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

                {/* ALERTS */}
                {errorMessage && (
                    <div style={{ padding: '12px 14px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                        ⚠️ {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div style={{ padding: '12px 14px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                        {successMessage}
                    </div>
                )}

                {/* AUTH FORM */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    {!isLogin && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Pathan Mohammed Alikhan" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9978256555" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                            </div>

                            {/* RESTRICTED: Customer & Admin Only */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>I am registering as a:</label>
                                <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                                    <option value="customer">Customer (Book Services)</option>
                                    <option value="admin">Admin (Manage Platform)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="City, Area" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="alikham7869@gmail.com" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="••••••••" style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Auth;