import React, { useState, useEffect } from 'react';
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

    const handleGlobalShortcuts = (e) => {
      const saved = localStorage.getItem('user');
      const activeUser = saved ? JSON.parse(saved) : null;

      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (!activeUser || activeUser.role !== 'admin') {
          setCurrentView('login');
        } else {
          setCurrentView(prev => (prev === 'admin' ? 'customer' : 'admin'));
        }
      }

      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (!activeUser || activeUser.role !== 'technician') {
          setCurrentView('login');
        } else {
          setCurrentView(prev => (prev === 'technician' ? 'customer' : 'technician'));
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') setCurrentView('admin');
    else if (user.role === 'technician') setCurrentView('technician');
    else setCurrentView('customer');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentView('customer');
  };

  const handleCloseTechPortal = () => {
    handleLogout();
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      
      {/* TOP USER NAVIGATION BAR */}
      <div style={{ backgroundColor: '#0f172a', padding: '8px 20px', color: '#ffffff', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
        <div>
          {currentUser ? (
            <>
              🟢 Logged in as: <b>{currentUser.name}</b> 
              <span style={{ textTransform: 'uppercase', backgroundColor: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginLeft: '8px', fontWeight: 'bold' }}>
                {currentUser.role}
              </span>
            </>
          ) : (
            <span>🔧 <b>FIXORA</b> Home Services Platform</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setCurrentView('customer')} style={{ background: currentView === 'customer' ? '#0284c7' : 'transparent', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            🏠 Home
          </button>

          <button onClick={() => setCurrentView('my-bookings')} style={{ background: currentView === 'my-bookings' ? '#0284c7' : 'transparent', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            📋 My Bookings Tracker
          </button>
          
          {currentUser?.role === 'technician' && (
            <button onClick={() => setCurrentView('technician')} style={{ background: currentView === 'technician' ? '#0284c7' : 'transparent', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              👨‍💻 My Tech Portal
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button onClick={() => setCurrentView('admin')} style={{ background: currentView === 'admin' ? '#0284c7' : 'transparent', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              ⚙️ Admin Panel
            </button>
          )}

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