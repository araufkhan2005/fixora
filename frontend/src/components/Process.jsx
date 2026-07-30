import React from 'react';

function Process() {
  return (
    <section id="process-section" className="container my-5 py-5 border-top">
      <div className="row g-4 mb-5">
        <div className="col-lg-6" data-aos="fade-up">
          <span className="text-primary fw-bold text-uppercase tracking-wider small">Workflow Process</span>
          <h2 className="fw-bold fs-1 mt-2 text-dark">3 Easy Steps to Fix</h2>
        </div>
        <div className="col-lg-6 d-flex align-items-center" data-aos="fade-up" data-aos-delay="100">
          <p className="text-muted m-0">Customer data stays isolated. Admin schedules allocations manually to deliver rapid doorstep fixes without compromising privacy boundaries.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="card flow-step-card h-100">
            <div className="step-number">01</div>
            <h5 className="fw-bold text-primary mb-3">Select System</h5>
            <p className="text-muted small m-0">Choose your required appliance service (AC, Fridge, RO, etc.) and add details securely.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="card flow-step-card h-100">
            <div className="step-number">02</div>
            <h5 className="fw-bold text-primary mb-3">Admin Routing</h5>
            <p className="text-muted small m-0">The request safely populates the dashboard where a verified expert is securely assigned.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
          <div className="card flow-step-card h-100">
            <div className="step-number">03</div>
            <h5 className="fw-bold text-primary mb-3">Doorstep Resolution</h5>
            <p className="text-muted small m-0">The assigned provider reaches your home to complete the task with dynamic status updates.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Process;