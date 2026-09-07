import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Process from './components/Process';
import ServicesGrid from './components/ServicesGrid';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import TechnicianPortal from './components/TechnicianPortal';
import CustomerDashboard from './components/CustomerDashboard';
import Auth from './components/Auth';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  const [currentView, setCurrentView] = useState('customer');
  const [currentUser, setCurrentUser] = useState(null);

  // 🔐 SMART ROLE-BASED ACCESS CONTROLLER
  const handleAdminAccess = useCallback(() => {
    const saved = localStorage.getItem('user');
    let user = null;
    try { user = saved ? JSON.parse(saved) : null; } catch (e) {}

    // Agar pehle se Admin logged in hai toh toggle karein
    if (user && user.role === 'admin') {
      setCurrentView(prev => (prev === 'admin' ? 'customer' : 'admin'));
    } else {
      // Agar koi aur account logged in hai (jaise technician ya customer), use clear karein taaki fresh login ho sake
      if (user && user.role !== 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
      setCurrentView('login');
    }
  }, []);

  const handleTechAccess = useCallback(() => {
    const saved = localStorage.getItem('user');
    let user = null;
    try { user = saved ? JSON.parse(saved) : null; } catch (e) {}

    // Agar pehle se Technician logged in hai toh toggle karein
    if (user && user.role === 'technician') {
      setCurrentView(prev => (prev === 'technician' ? 'customer' : 'technician'));
    } else {
      // Agar Admin logged in hai toh session clear karke fresh Technician login mangega
      if (user && user.role !== 'technician') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
      setCurrentView('login');
    }
  }, []);

  // 1. URL Query Parameter Auto-Detector (?access=admin ya ?access=technician)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessParam = queryParams.get('access');
    if (accessParam === 'admin') {
      handleAdminAccess();
    } else if (accessParam === 'technician') {
      handleTechAccess();
    }
  }, [handleAdminAccess, handleTechAccess]);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (err) {
        localStorage.removeItem('user');
      }
    }

    // 2. Global Shortcuts with Auth Protection
    const handleGlobalShortcuts = (e) => {
      if (e.ctrlKey && e.altKey) {
        const isKeyA = e.key.toLowerCase() === 'a' || e.code === 'KeyA';
        const isKeyT = e.key.toLowerCase() === 't' || e.code === 'KeyT';

        if (isKeyA) {
          e.preventDefault();
          handleAdminAccess();
        }

        if (isKeyT) {
          e.preventDefault();
          handleTechAccess();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [handleAdminAccess, handleTechAccess]);

  // 🎯 Auto-Route to Specific Dashboard After Login
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else if (user.role === 'technician') {
      setCurrentView('technician');
    } else {
      setCurrentView('customer');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentView('customer');
  };

  const handleCloseTechPortal = () => {
    setCurrentView('customer');
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      
      {/* TOP USER NAVIGATION BAR */}
      <div style={{ backgroundColor: '#0f172a', padding: '8px 20px', color: '#ffffff', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, flexWrap: 'wrap', gap: '8px' }}>
        <div>
          {currentUser ? (
            <>
              🟢 Logged in as: <b>{currentUser.name}</b> 
              <span style={{ textTransform: 'uppercase', backgroundColor: currentUser.role === 'admin' ? '#ef4444' : '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginLeft: '8px', fontWeight: 'bold' }}>
                {currentUser.role}
              </span>
            </>
          ) : (
            <span>🔧 <b>FIXORA</b> Home Services Platform</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setCurrentView('customer')} style={{ background: currentView === 'customer' ? '#0284c7' : '#334155', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            🏠 Home
          </button>

          <button onClick={() => setCurrentView('my-bookings')} style={{ background: currentView === 'my-bookings' ? '#0284c7' : '#334155', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            📋 My Bookings
          </button>
          
          {/* Protected Access Buttons */}
          <button onClick={handleAdminAccess} style={{ background: currentView === 'admin' ? '#ef4444' : '#1e293b', border: '1px solid #475569', color: '#f8fafc', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            ⚙️ Admin Panel
          </button>

          <button onClick={handleTechAccess} style={{ background: currentView === 'technician' ? '#f59e0b' : '#1e293b', border: '1px solid #475569', color: '#f8fafc', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            👨‍🔧 Tech Portal
          </button>

          {currentUser ? (
            <button onClick={handleLogout} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              🚪 Logout
            </button>
          ) : (
            <button onClick={() => setCurrentView('login')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              🔑 Login / Register
            </button>
          )}
        </div>
      </div>

      {currentView === 'customer' && <Navbar />}

      {currentView === 'customer' && (
        <>
          <Hero />
          <Process />
          <ServicesGrid />
          <BookingForm currentUser={currentUser} />
          <Footer />
        </>
      )}

      {currentView === 'my-bookings' && (
        <CustomerDashboard user={currentUser} onBackHome={() => setCurrentView('customer')} />
      )}

      {currentView === 'login' && <Auth onLoginSuccess={handleLoginSuccess} />}
      {currentView === 'admin' && <AdminDashboard />}
      {currentView === 'technician' && <TechnicianPortal onClose={handleCloseTechPortal} />}
      
    </div>
  );
}

export default App;