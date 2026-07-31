import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:5000/api/services";

function BookingForm({ currentUser }) {
  const [formData, setFormData] = useState({
    clientName: currentUser?.name || '',
    phone: currentUser?.phone || localStorage.getItem('lastBookingPhone') || '',
    address: currentUser?.address || '',
    serviceType: 'AC Repair & Service',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTime: 'Morning Slot (9 AM - 12 PM)',
    notes: '',
    applianceImage: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setStatusMsg({ type: '', text: '' });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await axios.post(`${API_BASE}/upload-image`, {
          imageBase64: reader.result
        });
        setFormData(prev => ({ ...prev, applianceImage: res.data.url }));
        setStatusMsg({ type: 'success', text: '📷 Appliance photo uploaded!' });
      } catch (err) {
        setStatusMsg({ type: 'error', text: '❌ Image upload failed.' });
      } finally {
        setUploadingImage(false);
      }
    };
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        customerId: currentUser?._id || null
      };

      const res = await axios.post(`${API_BASE}/book`, payload);
      
      // 🟢 PHONE AUTO-MEMORY: Save phone to localStorage so Tracker loads it automatically!
      if (formData.phone) {
        localStorage.setItem('lastBookingPhone', formData.phone.trim());
      }

      setStatusMsg({ type: 'success', text: `🎉 ${res.data.message || 'Booking Request Placed!'}` });

      setFormData({
        clientName: currentUser?.name || '',
        phone: formData.phone,
        address: currentUser?.address || '',
        serviceType: 'AC Repair & Service',
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: 'Morning Slot (9 AM - 12 PM)',
        notes: '',
        applianceImage: ''
      });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: `❌ ${err.response?.data?.message || 'Failed to generate booking.'}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-5 bg-white" id="booking-section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">🛠️ Book a Certified Repair Expert</h2>
          <p className="text-muted small">Select your slot, upload appliance photo & get doorstep technician.</p>
        </div>

        <div className="border rounded-4 p-4 shadow-sm bg-light">
          {statusMsg.text && (
            <div className={`alert ${statusMsg.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small fw-bold text-center mb-3`}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="small fw-semibold text-muted mb-1">Your Full Name *</label>
                <input type="text" name="clientName" className="form-control rounded-3" value={formData.clientName} onChange={handleInputChange} required placeholder="Name" />
              </div>

              <div className="col-md-6">
                <label className="small fw-semibold text-muted mb-1">Phone Number *</label>
                <input type="text" name="phone" className="form-control rounded-3" value={formData.phone} onChange={handleInputChange} required placeholder="Phone" />
              </div>

              <div className="col-md-6">
                <label className="small fw-semibold text-muted mb-1">Service Required *</label>
                <select name="serviceType" className="form-select rounded-3" value={formData.serviceType} onChange={handleInputChange}>
                  <option value="AC Repair & Service">AC Repair & Service</option>
                  <option value="Refrigerator Repair">Refrigerator Repair</option>
                  <option value="Washing Machine Repair">Washing Machine Repair</option>
                  <option value="RO Water Purifier">RO Water Purifier Service</option>
                  <option value="Electrical Services">Electrical Services</option>
                  <option value="Plumbing Services">Plumbing Services</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="small fw-semibold text-muted mb-1">Schedule Date *</label>
                <input type="date" name="bookingDate" className="form-control rounded-3" value={formData.bookingDate} onChange={handleInputChange} required />
              </div>

              <div className="col-md-3">
                <label className="small fw-semibold text-muted mb-1">Time Slot *</label>
                <select name="bookingTime" className="form-select rounded-3" value={formData.bookingTime} onChange={handleInputChange}>
                  <option value="Morning Slot (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon Slot (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening Slot (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                </select>
              </div>

              <div className="col-12">
                <label className="small fw-semibold text-muted mb-1">Full Service Address *</label>
                <input type="text" name="address" className="form-control rounded-3" value={formData.address} onChange={handleInputChange} required placeholder="House No, Area, City" />
              </div>

              <div className="col-md-6">
                <label className="small fw-semibold text-muted mb-1">Upload Appliance Issue Photo (Optional)</label>
                <input type="file" accept="image/*" className="form-control rounded-3" onChange={handleImageUpload} />
                {uploadingImage && <small className="text-primary d-block mt-1 fw-bold">Uploading...</small>}
                {formData.applianceImage && <small className="text-success d-block mt-1 fw-bold">✅ Photo Uploaded!</small>}
              </div>

              <div className="col-md-6">
                <label className="small fw-semibold text-muted mb-1">Issue Description / Notes</label>
                <input type="text" name="notes" className="form-control rounded-3" value={formData.notes} onChange={handleInputChange} placeholder="e.g. AC cooling nahi kar raha" />
              </div>

              <div className="col-12 text-center mt-4">
                <button type="submit" disabled={submitting || uploadingImage} className="btn btn-primary fw-bold px-5 py-2 rounded-3">
                  {submitting ? 'Placing Booking...' : '🚀 Confirm & Schedule Booking'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default BookingForm;