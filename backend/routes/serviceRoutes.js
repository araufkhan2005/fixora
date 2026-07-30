const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Technician = require('../models/Technician');

// ==========================================
// 📥 1. HOME PAGE & PORTAL API
// ==========================================
router.get('/homepage-techs', async (req, res) => {
    try {
        const rankedTechs = await Technician.find({})
            .sort({ planPrice: -1 })
            .select('name specialty photo rating subscriptionPlan');
            
        res.status(200).json(rankedTechs);
    } catch (error) {
        res.status(500).json({ message: "Homepage layout fetch failed!", error: error.message });
    }
});

// ==========================================
// 📥 2. GET ROUTE: All Bookings Queue
// ==========================================
router.get('/', async (req, res) => {
    try {
        const allBookings = await Booking.find().populate('assignedTechnician').sort({ _id: -1 }); 
        
        const formattedBookings = allBookings.map(booking => {
            const bookingObj = booking.toObject();
            return {
                ...bookingObj,
                technician: booking.assignedTechnician ? booking.assignedTechnician.name : null
            };
        });
        res.status(200).json(formattedBookings);
    } catch (error) {
        res.status(500).json({ message: "Database queue fetch failed!", error: error.message });
    }
});

// ==========================================
// ⚙️ 3. ADMIN PANEL API: Add Technician
// ==========================================
router.post('/add-technician', async (req, res) => {
    try {
        const { name, phone, specialty, age, address, subscriptionPlan, planPrice, photo } = req.body;
        
        let calculatedRating = 4.3;
        if (subscriptionPlan === 'Platinum') calculatedRating = 4.9;
        else if (subscriptionPlan === 'Gold') calculatedRating = 4.7;

        const newTech = new Technician({ 
            name, phone, specialty, age, address, subscriptionPlan,
            planPrice: Number(planPrice) || 0,
            rating: calculatedRating,
            photo: photo || 'https://via.placeholder.com/150'
        });
        
        await newTech.save();
        res.status(201).json({ message: 'Technician successfully added!', data: newTech });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 📝 4. CUSTOMER DIRECT BOOKING API
// ==========================================
router.post('/book', async (req, res) => {
    try {
        const { clientName, phone, address, serviceType, requestedTechId, coordinates } = req.body;

        const newBooking = new Booking({
            clientName, phone, address, serviceType,
            coordinates: coordinates || null,
            assignedTechnician: requestedTechId || null, 
            status: 'Pending' 
        });

        await newBooking.save();
        res.status(201).json({ message: 'Booking request generated!', bookingDetails: newBooking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 📤 5. ADMIN PANEL ONLY: Allocate Route
// ==========================================
router.put('/allocate/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { technician, status } = req.body; 

        let techRecord = null;
        if (technician && typeof technician === 'string' && technician.trim() !== "") {
            const baseName = technician.split(' (')[0].trim(); 
            const nameWords = baseName.split(/\s+/).filter(word => word.length > 0);
            const searchConditions = nameWords.map(word => ({
                name: { $regex: new RegExp(word, "i") }
            }));
            techRecord = await Technician.findOne({ $and: searchConditions });
        }

        const updatedRequest = await Booking.findByIdAndUpdate(
            bookingId,
            { 
                assignedTechnician: techRecord ? techRecord._id : null,
                status: status || "Assigned"
            },
            { new: true } 
        );

        res.status(200).json({ message: "Admin allocation updated successfully!", updatedRequest });
    } catch (error) {
        res.status(500).json({ message: "Allocation failed!", error: error.message });
    }
});

// ==========================================
// ⚡ 6. DEDICATED PORTAL UPDATE ROUTE (FIXES THE ACCEPT BUG)
// ==========================================
router.put('/portal-update/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;

        // 🟢 ONLY updates the status field, leaves the assignedTechnician completely untouched!
        const updatedRequest = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { status: status } },
            { new: true }
        );

        res.status(200).json({ message: "Portal status synchronized!", updatedRequest });
    } catch (error) {
        res.status(500).json({ message: "Status update failed!", error: error.message });
    }
});

// ==========================================
// ❌ 7. TECHNICIAN PORTAL API: Cancel Job (Resets back to Admin Queue)
// ==========================================
router.put('/cancel-job/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { 
                status: 'Pending',
                assignedTechnician: null
            },
            { new: true }
        );

        if (!updatedBooking) return res.status(404).json({ message: "Job record not found!" });

        res.status(200).json({ message: "Job cancelled successfully!", updatedBooking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;