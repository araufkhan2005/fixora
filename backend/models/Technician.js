const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    specialty: { type: String, required: true }, // Jaise: AC Expert, Fridge Pro, Plumber
    age: { type: Number, required: true },
    address: { type: String, required: true },
    subscriptionPlan: { type: String, enum: ['Platinum', 'Gold', 'Basic'], default: 'Basic' },
    planPrice: { type: Number, default: 0 }, // Jiska plan price zyada hoga, wo homepage par top par dikhega
    rating: { type: Number, default: 4.3 },  // Plan ke mutabik auto-calculate hogi
    photo: { type: String, default: 'https://via.placeholder.com/150' }, // Profile pic URL
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Technician', technicianSchema);