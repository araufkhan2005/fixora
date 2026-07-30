import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Process from './components/Process';
import ServicesGrid from './components/ServicesGrid';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import TechnicianPortal from './components/TechnicianPortal'; // Added Tech Portal
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  // Views states: 'customer' | 'login' | 'admin' | 'technician'
  const [currentView, setCurrentView] = useState('customer');

  useEffect(() => {
    AOS.init({ duration: 900, once: true });

    // ⌨️ GLOBAL MASTER SHORTCUT LISTENERS
    const handleGlobalShortcuts = (e) => {
      // 1. Admin Gateway: Ctrl + Alt + A
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setCurrentView(prev => prev === 'customer' ? 'login' : 'customer');
      }
      
      // 2. Technician Gateway: Ctrl + Alt + T
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setCurrentView(prev => prev === 'customer' ? 'technician' : 'customer');
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      
      {/* Navbar will render on Customer & Tech View only */}
      {(currentView === 'customer' || currentView === 'technician') && <Navbar />}

      {/* DYNAMIC PIPELINE SWITCH ENGINE */}
      {currentView === 'customer' && (
        <>
          <Hero />
          <Process />
          <ServicesGrid />
          <BookingForm />
          <Footer />
        </>
      )}

      {currentView === 'login' && (
        <AdminLogin 
          onLoginSuccess={() => setCurrentView('admin')} 
          onCancel={() => setCurrentView('customer')}
        />
      )}

      {currentView === 'admin' && (
        <AdminDashboard />
      )}

      {currentView === 'technician' && (
        <TechnicianPortal />
      )}
      
    </div>
  );
}

export default App;