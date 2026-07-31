const mongoose = require('mongoose');

delete mongoose.models.Booking;

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    clientName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    serviceType: { type: String, required: true },
    bookingDate: { type: String, default: '' },
    bookingTime: { type: String, default: '' },
    applianceImage: { type: String, default: '' },
    beforeImage: { type: String, default: '' },
    afterImage: { type: String, default: '' },
    spareParts: [
        {
            name: { type: String },
            price: { type: Number, default: 0 }
        }
    ],
    totalAmount: { type: Number, default: 0 },
    assignedTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'Accepted', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    notes: { type: String, default: '' },

    // 🟢 RATING & REVIEW FIELDS
    rating: { type: Number, default: 0 },
    review: { type: String, default: '' },
    isRated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);