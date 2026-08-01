import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:5000/api/services";

function CustomerDashboard({ user, onBackHome }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const savedPhone = user?.phone || localStorage.getItem('lastBookingPhone') || '';
  const [searchPhone, setSearchPhone] = useState(savedPhone);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ⭐ RATING MODAL STATES
  const [ratingModalJob, setRatingModalJob] = useState(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchBookings = async (identifier = null) => {
    setLoading(true);
    setCurrentPage(1);
    try {
      let target = identifier;
      
      if (target === null || target === undefined) {
        target = user?._id || user?.phone || localStorage.getItem('lastBookingPhone') || '';
      }

      let url = API_BASE;
      if (target && String(target).trim() !== '' && target !== 'undefined' && target !== 'null') {
        url = `${API_BASE}/customer-bookings/${String(target).trim()}`;
      }

      const res = await axios.get(url);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch bookings failed:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(savedPhone || null);
  }, [user]);

  const getStatusStep = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Assigned': return 2;
      case 'Accepted': return 3;
      case 'Completed': return 4;
      default: return 1;
    }
  };

  // 🗺️ HELPER TO CONVERT MAP URL IN NOTES TO CLICKABLE LINK (PIC 1 FIX)
  const renderNotesWithLinks = (notesText) => {
    if (!notesText) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = notesText.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="badge bg-warning text-dark text-decoration-none ms-1 px-2 py-1 fw-bold"
          >
            🗺️ Open GPS Map
          </a>
        );
      }
      return part;
    });
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingModalJob) return;

    setSubmittingRating(true);
    try {
      const res = await axios.put(`${API_BASE}/rate-service/${ratingModalJob._id}`, {
        rating: selectedStars,
        review: reviewComment
      });

      alert(res.data?.message || "🎉 Thank you for rating our service!");
      setRatingModalJob(null);
      setSelectedStars(5);
      setReviewComment('');
      fetchBookings(searchPhone);
    } catch (err) {
      alert("❌ Rating submission failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingRating(false);
    }
  };

  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '900px', marginTop: '30px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold m-0 text-dark">📋 Live Service Bookings Tracker</h4>
          <p className="text-muted small m-0">Real-time status of scheduled repair requests</p>
        </div>
        <button onClick={onBackHome} className="btn btn-sm btn-outline-dark fw-bold rounded-3">
          🏠 Home Page
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-3 border rounded-3 mb-4 shadow-sm d-flex gap-2">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Enter Phone Number / Booking ID..."
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <button onClick={() => fetchBookings(searchPhone)} className="btn btn-sm btn-primary fw-bold px-3">
          Search
        </button>
        <button 
          onClick={() => { setSearchPhone(''); fetchBookings(''); }} 
          className="btn btn-sm btn-outline-secondary fw-bold px-2 text-nowrap"
        >
          Show All
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted"><i className="fa-solid fa-spinner fa-spin me-2"></i> Loading live bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border rounded-4 p-5 text-center shadow-sm">
          <h5 className="fw-bold text-muted mb-2">No Bookings Found</h5>
          <p className="small text-muted mb-3">Aapne abhi tak koi service request schedule nahi ki hai.</p>
          <button onClick={onBackHome} className="btn btn-primary btn-sm fw-bold rounded-3 px-4">Book Service Now</button>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {currentBookings.map((item) => {
              const step = getStatusStep(item.status);
              return (
                <div key={item._id} className="bg-white border rounded-4 p-4 shadow-sm border-start border-4 border-primary">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold m-0 text-dark">{item.serviceType}</h5>
                      <small className="text-muted">Booking ID: #{item._id.slice(-6).toUpperCase()}</small>
                    </div>
                    <span className={`badge ${item.status === 'Completed' ? 'bg-success' : item.status === 'Accepted' ? 'bg-info' : item.status === 'Assigned' ? 'bg-primary' : 'bg-warning'} px-3 py-2 rounded-3 fw-bold`}>
                      {item.status || 'Pending'}
                    </span>
                  </div>

                  {/* REALTIME TRACKER BAR */}
                  <div className="my-3 py-3 px-3 bg-light rounded-3">
                    <div className="d-flex justify-content-between small fw-bold text-muted mb-2">
                      <span className={step >= 1 ? 'text-primary' : ''}>1. Request Received</span>
                      <span className={step >= 2 ? 'text-primary' : ''}>2. Expert Assigned</span>
                      <span className={step >= 3 ? 'text-info fw-bold' : ''}>3. Tech Accepted / On Way</span>
                      <span className={step >= 4 ? 'text-success fw-bold' : ''}>4. Resolved</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar rounded-pill ${step === 4 ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${(step / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="row g-2 small text-muted mt-1">
                    <div className="col-12 col-md-6">👤 <b>Client:</b> {item.clientName} ({item.phone})</div>
                    <div className="col-12 col-md-6">📍 <b>Address:</b> {item.address}</div>
                    <div className="col-12 col-md-6">📅 <b>Scheduled:</b> {item.bookingDate} ({item.bookingTime})</div>
                    
                    {/* 🔧 CLICKABLE GPS LINK IN NOTES */}
                    {item.notes && (
                      <div className="col-12">
                        📝 <b>Notes:</b> {renderNotesWithLinks(item.notes)}
                      </div>
                    )}

                    {item.assignedTechnician && (
                      <div className="col-12 mt-2 pt-2 border-top text-dark fw-bold">
                        👨‍🔧 Technician: {item.assignedTechnician.name || item.technician || 'Assigned'} {item.assignedTechnician.phone ? `(📞 ${item.assignedTechnician.phone})` : ''}
                      </div>
                    )}
                    {item.applianceImage && (
                      <div className="col-12 mt-2">
                        <a href={item.applianceImage} target="_blank" rel="noreferrer" className="small text-primary fw-bold">
                          🖼️ View Uploaded Appliance Photo
                        </a>
                      </div>
                    )}
                  </div>

                  {/* RATING SECTION */}
                  {item.status === 'Completed' && (
                    <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                      {item.isRated ? (
                        <div className="bg-light p-2 rounded-3 border w-100">
                          <span className="fw-bold text-warning">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                          <span className="small text-muted ms-2 fw-bold">({item.rating}/5 Stars Given)</span>
                          {item.review && <p className="small text-dark m-0 mt-1 italic">"{item.review}"</p>}
                        </div>
                      ) : (
                        <button 
                          onClick={() => setRatingModalJob(item)} 
                          className="btn btn-sm btn-warning fw-bold text-dark rounded-3 px-3"
                        >
                          ⭐ Rate Service & Technician
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 bg-white p-3 rounded-4 border shadow-sm flex-wrap gap-2">
              <small className="text-muted fw-bold">
                Showing {indexOfFirstBooking + 1} - {Math.min(indexOfLastBooking, bookings.length)} of {bookings.length} Bookings
              </small>

              <div className="d-flex gap-2 align-items-center">
                <button
                  className="btn btn-sm btn-outline-primary fw-bold rounded-3 px-3"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ⬅️ Prev
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`btn btn-sm ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline-secondary'} fw-bold rounded-3 px-3`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="btn btn-sm btn-outline-primary fw-bold rounded-3 px-3"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next ➡️
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* RATING MODAL */}
      {ratingModalJob && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4 shadow">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h5 className="fw-bold text-dark m-0">⭐ Rate Your Repair Experience</h5>
                <button onClick={() => setRatingModalJob(null)} className="btn-close"></button>
              </div>

              <form onSubmit={handleRatingSubmit}>
                <div className="text-center mb-3">
                  <p className="small text-muted mb-2">Service: <b>{ratingModalJob.serviceType}</b></p>
                  <div className="fs-2 text-warning pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        onClick={() => setSelectedStars(star)} 
                        style={{ cursor: 'pointer', margin: '0 4px' }}
                      >
                        {star <= selectedStars ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <small className="fw-bold text-dark">{selectedStars} / 5 Stars</small>
                </div>

                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-1">Feedback / Comment (Optional)</label>
                  <textarea
                    rows="3"
                    className="form-control form-control-sm rounded-3"
                    placeholder="Technician kaisa tha? Service se satisfied ho?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                  <button type="button" onClick={() => setRatingModalJob(null)} className="btn btn-sm btn-light border fw-bold rounded-3">Cancel</button>
                  <button type="submit" disabled={submittingRating} className="btn btn-sm btn-warning text-dark fw-bold px-4 rounded-3">
                    {submittingRating ? 'Saving...' : 'Submit Rating'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CustomerDashboard;