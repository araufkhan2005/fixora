import React from 'react';

function Process() {
  return (
    <section id="process-section" className="container my-5 py-5 border-top">
      <div className="row g-4 mb-5">
        <div className="col-lg-6" data-aos="fade-up">
          <span className="text-primary fw-bold text-uppercase tracking-wider small">Workflow Process</span>
          <h2 className="fw-bold fs-1 mt-2 text-dark">4 Easy Steps to Fix</h2>
        </div>
        <div className="col-lg-6 d-flex align-items-center" data-aos="fade-up" data-aos-delay="100">
          <p className="text-muted m-0">Customer data stays isolated. Admin schedules allocations via GPS pin-drop to deliver rapid doorstep fixes with 3-stage visual verification.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-3" data-aos="fade-up" data-aos-delay="200">
          <div className="card flow-step-card h-100 p-4 border rounded-3 shadow-sm bg-white">
            <div className="step-number fw-bold text-primary fs-3 mb-2">01</div>
            <h5 className="fw-bold text-dark mb-2">Select & Drop GPS</h5>
            <p className="text-muted small m-0">Choose your required appliance service (AC, Fridge, RO, etc.) and drop your live GPS pin.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="fade-up" data-aos-delay="300">
          <div className="card flow-step-card h-100 p-4 border rounded-3 shadow-sm bg-white">
            <div className="step-number fw-bold text-primary fs-3 mb-2">02</div>
            <h5 className="fw-bold text-dark mb-2">Smart Auto-Dispatch</h5>
            <p className="text-muted small m-0">System auto-assigns nearest verified specialist via one-click Google Maps navigation.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="fade-up" data-aos-delay="400">
          <div className="card flow-step-card h-100 p-4 border rounded-3 shadow-sm bg-white">
            <div className="step-number fw-bold text-primary fs-3 mb-2">03</div>
            <h5 className="fw-bold text-dark mb-2">3-Stage Photo Proof</h5>
            <p className="text-muted small m-0">Technician uploads mandatory Issue, Before, and After repair photos directly to Cloudinary.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="fade-up" data-aos-delay="500">
          <div className="card flow-step-card h-100 p-4 border rounded-3 shadow-sm bg-white">
            <div className="step-number fw-bold text-primary fs-3 mb-2">04</div>
            <h5 className="fw-bold text-dark mb-2">Dynamic UPI Pay</h5>
            <p className="text-muted small m-0">Scan auto-generated UPI QR code on invoice and submit your 5-star customer review.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Process;