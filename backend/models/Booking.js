const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    clientName: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    // Kis appliance ke liye booking ho rahi hai
    serviceType: { 
        type: String, 
        enum: ['AC', 'Refrigerator', 'Washing Machine', 'RO Water Purifier', 'Geyser', 'Electrician', 'Plumber'], 
        required: true 
    },
    // Kaun sa technician assign hua (Yeh Technician model se linked hai)
    assignedTechnician: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Technician', 
        default: null 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Assigned', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);