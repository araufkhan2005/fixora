const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    specialty: { type: String, default: 'General Expert' },
    address: { type: String, default: '' },
    photo: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
    age: { type: Number, default: 25 },
    subscriptionPlan: { type: String, default: 'Basic' },
    planPrice: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Technician', technicianSchema);