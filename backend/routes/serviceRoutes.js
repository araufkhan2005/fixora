const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Technician = require('../models/Technician');
const cloudinary = require('../config/cloudinary');

// 🛡️ Auth Middlewares Import
const { protect, authorize } = require('../middleware/authMiddleware');

// ⚡ DEFAULT 18 TECHNICIANS WITH WORKING HD PROFILE IMAGES
const INITIAL_TECHNICIANS = [
    { 
        name: 'daksh123', email: 'daksh123@fixora.com', phone: '9876543210', role: 'technician', specialty: 'Plumbing Expert', subscriptionPlan: 'Platinum', planPrice: 51563, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Tejas', email: 'tejas@fixora.com', phone: '9876543211', role: 'technician', specialty: 'Fridge expert', subscriptionPlan: 'Platinum', planPrice: 5800, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Aarav', email: 'aarav@fixora.com', phone: '9876543212', role: 'technician', specialty: 'Electrical Services', subscriptionPlan: 'Platinum', planPrice: 5500, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Vedanth', email: 'vedanth@fixora.com', phone: '9876543213', role: 'technician', specialty: 'Washing Machine Expert', subscriptionPlan: 'Platinum', planPrice: 5500, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Vivaan', email: 'vivaan@fixora.com', phone: '9876543214', role: 'technician', specialty: 'RO', subscriptionPlan: 'Platinum', planPrice: 5199, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Ansh', email: 'ansh@fixora.com', phone: '9876543215', role: 'technician', specialty: 'AC expert', subscriptionPlan: 'Platinum', planPrice: 5050, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Gautam', email: 'gautam@fixora.com', phone: '9876543216', role: 'technician', specialty: 'Fridge expert', subscriptionPlan: 'Gold', planPrice: 4591, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Reyansh', email: 'reyansh@fixora.com', phone: '9876543217', role: 'technician', specialty: 'Electrical Services', subscriptionPlan: 'Gold', planPrice: 4500, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Kabir', email: 'kabir@fixora.com', phone: '9876543218', role: 'technician', specialty: 'Washing Machine Expert', subscriptionPlan: 'Gold', planPrice: 4100, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Arjun', email: 'arjun@fixora.com', phone: '9876543219', role: 'technician', specialty: 'RO', subscriptionPlan: 'Gold', planPrice: 3503, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Manish', email: 'manish@fixora.com', phone: '9876543220', role: 'technician', specialty: 'AC expert', subscriptionPlan: 'Gold', planPrice: 3200, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Zayan', email: 'zayan@fixora.com', phone: '9876543221', role: 'technician', specialty: 'Plumbing Expert', subscriptionPlan: 'Gold', planPrice: 3000, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Chandan', email: 'chandan@fixora.com', phone: '9876543222', role: 'technician', specialty: 'AC expert', subscriptionPlan: 'Silver', planPrice: 2800, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Rohan', email: 'rohan@fixora.com', phone: '9876543223', role: 'technician', specialty: 'Fridge expert', subscriptionPlan: 'Silver', planPrice: 2502, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Ayan', email: 'ayan@fixora.com', phone: '9876543224', role: 'technician', specialty: 'Electrical Services', subscriptionPlan: 'Silver', planPrice: 2000, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Shaurya', email: 'shaurya@fixora.com', phone: '9876543225', role: 'technician', specialty: 'RO', subscriptionPlan: 'Basic', planPrice: 1400, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Nikhil', email: 'nikhil@fixora.com', phone: '9876543226', role: 'technician', specialty: 'Plumbing Expert', subscriptionPlan: 'Basic', planPrice: 1000, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
    },
    { 
        name: 'Madhav', email: 'madhav@fixora.com', phone: '9876543227', role: 'technician', specialty: 'Washing Machine Expert', subscriptionPlan: 'Basic', planPrice: 997, rating: 4.5,
        photo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'
    }
];

// Helper Function: Fetch or Auto-Seed Technicians
const getOrSeedTechnicians = async () => {
    let technicians = await Technician.find().sort({ planPrice: -1, rating: -1 });

    if (!technicians || technicians.length === 0) {
        technicians = await User.find({ role: 'technician' })
            .sort({ planPrice: -1, rating: -1 })
            .select('-password');
    }

    // Auto-Seed if DB is empty
    if (!technicians || technicians.length === 0) {
        await Technician.insertMany(INITIAL_TECHNICIANS);
        technicians = await Technician.find().sort({ planPrice: -1, rating: -1 });
    } else {
        // Fallback for existing records without photo
        technicians = technicians.map(tech => {
            const techObj = tech.toObject ? tech.toObject() : tech;
            if (!techObj.photo && !techObj.image) {
                techObj.photo = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80';
                techObj.image = techObj.photo;
            }
            return techObj;
        });
    }

    return technicians;
};

// ==========================================
// ☁️ CLOUDINARY IMAGE UPLOAD API
// ==========================================
router.post('/upload-image', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ message: 'No image provided' });

        const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
            folder: 'fixora_uploads'
        });

        res.status(200).json({ url: uploadResponse.secure_url });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ message: "Image upload failed", error: error.message });
    }
});

// ==========================================
// 📝 CUSTOMER BOOKING CREATION
// ==========================================
router.post('/book', async (req, res) => {
    try {
        const { clientName, phone, address, serviceType, bookingDate, bookingTime, applianceImage, customerId, requestedTechId, notes } = req.body;

        if (!clientName || !phone || !address || !serviceType) {
            return res.status(400).json({ message: 'Name, Phone, Address and Service Type are required!' });
        }

        const targetTechId = requestedTechId || customerId;

        const newBooking = new Booking({
            customer: targetTechId && mongoose.Types.ObjectId.isValid(targetTechId) ? targetTechId : null,
            clientName,
            phone,
            address,
            serviceType,
            bookingDate: bookingDate || new Date().toISOString().split('T')[0],
            bookingTime: bookingTime || 'Morning Slot (9 AM - 12 PM)',
            applianceImage: applianceImage || '',
            notes: notes || ''
        });

        await newBooking.save();
        res.status(201).json({ message: '🎉 Booking successfully placed!', bookingDetails: newBooking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 📂 GET BOOKINGS BY CUSTOMER / PHONE
// ==========================================
router.get('/customer-bookings/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        let query = {};

        if (mongoose.Types.ObjectId.isValid(identifier)) {
            query = { $or: [{ customer: identifier }, { phone: identifier }] };
        } else {
            query = { phone: identifier };
        }

        const myBookings = await Booking.find(query)
            .populate('assignedTechnician', 'name phone specialty image photo')
            .sort({ _id: -1 });

        res.status(200).json(myBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 📥 FETCH LIVE TECHNICIANS FOR HOME & ADMIN
// ==========================================
router.get('/homepage-techs', async (req, res) => {
    try {
        const technicians = await getOrSeedTechnicians();
        res.status(200).json(technicians);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/get-technicians', async (req, res) => {
    try {
        const technicians = await getOrSeedTechnicians();
        res.status(200).json(technicians);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 📥 FETCH ALL BOOKINGS QUEUE
// ==========================================
router.get('/', async (req, res) => {
    try {
        const allBookings = await Booking.find()
            .populate('assignedTechnician', 'name email phone specialty image photo')
            .sort({ _id: -1 });
        
        const formatted = allBookings.map(b => ({
            ...b.toObject(),
            technician: b.assignedTechnician ? b.assignedTechnician.name : null
        }));
        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// ⚙️ ADD TECHNICIAN (AUTO RATING & PLAN BY PRICE)
// ==========================================
router.post('/add-technician', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, email, password, phone, specialty, age, address, subscriptionPlan, planPrice, image } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Name, Email, Password, and Phone are required fields!' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Is email se pehle se user registered hai!' });

        const photoUrl = image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80';
        const numericPlanPrice = Number(planPrice) || 0;

        let calculatedRating = 4.3;
        let finalPlan = subscriptionPlan;

        if (numericPlanPrice >= 5000) {
            calculatedRating = 4.9;
            finalPlan = finalPlan || 'Platinum';
        } else if (numericPlanPrice >= 3000) {
            calculatedRating = 4.7;
            finalPlan = finalPlan || 'Gold';
        } else if (numericPlanPrice >= 1500) {
            calculatedRating = 4.5;
            finalPlan = finalPlan || 'Silver';
        } else {
            calculatedRating = 4.3;
            finalPlan = finalPlan || 'Basic';
        }

        const newTechUser = await User.create({
            name, 
            email, 
            password, 
            phone, 
            role: 'technician',
            specialty: specialty || 'General Expert', 
            age: Number(age) || 25,
            address: address || '', 
            subscriptionPlan: finalPlan,
            planPrice: numericPlanPrice, 
            image: photoUrl, 
            photo: photoUrl, 
            rating: calculatedRating
        });

        try {
            await Technician.create({
                _id: newTechUser._id, 
                name, 
                email, 
                phone,
                specialty: specialty || 'General Expert', 
                age: Number(age) || 25,
                address: address || '', 
                subscriptionPlan: finalPlan,
                planPrice: numericPlanPrice, 
                photo: photoUrl, 
                rating: calculatedRating
            });
        } catch (techErr) {
            await User.findByIdAndDelete(newTechUser._id);
            return res.status(500).json({ message: "Technician Profile Creation Failed", error: techErr.message });
        }

        res.status(201).json({ message: '🎉 Technician successfully added with auto rating!', data: newTechUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 🗑️ DELETE / REMOVE TECHNICIAN ROUTE
// ==========================================
const deleteTechnicianHandler = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Technician ID format!' });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        const deletedTech = await Technician.findByIdAndDelete(id);

        if (!deletedUser && !deletedTech) {
            return res.status(404).json({ message: 'Technician not found in database!' });
        }

        await Booking.updateMany(
            { assignedTechnician: id },
            { $set: { assignedTechnician: null, status: 'Pending' } }
        );

        res.status(200).json({ message: '🗑️ Technician successfully removed!' });
    } catch (error) {
        console.error("Delete Technician Error:", error);
        res.status(500).json({ message: error.message });
    }
};

router.delete('/delete-technician/:id', protect, authorize('admin'), deleteTechnicianHandler);
router.delete('/delete-tech/:id', protect, authorize('admin'), deleteTechnicianHandler);
router.delete('/technician/:id', protect, authorize('admin'), deleteTechnicianHandler);

// ==========================================
// 📤 ADMIN ALLOCATE TECHNICIAN ROUTE
// ==========================================
router.put('/allocate/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { technician, status } = req.body;
        let techRecord = null;

        if (technician && typeof technician === 'string' && technician.trim() !== "") {
            if (mongoose.Types.ObjectId.isValid(technician)) {
                techRecord = await User.findById(technician);
            } else {
                const baseName = technician.split(' (')[0].trim();
                const escapedName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                techRecord = await User.findOne({ 
                    name: { $regex: new RegExp(`^${escapedName}$`, "i") }, 
                    role: 'technician' 
                });
            }
        }

        const updated = await Booking.findByIdAndUpdate(
            req.params.id,
            { assignedTechnician: techRecord ? techRecord._id : null, status: status || "Assigned" },
            { returnDocument: 'after' }
        );

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// ⚡ TECHNICIAN PORTAL UPDATE ROUTE
// ==========================================
router.put('/portal-update/:id', protect, authorize('technician', 'admin'), async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status, beforeImage, afterImage, spareParts, totalAmount } = req.body;

        const updateFields = {};
        if (status) updateFields.status = status;
        if (beforeImage) updateFields.beforeImage = beforeImage;
        if (afterImage) updateFields.afterImage = afterImage;
        if (spareParts) updateFields.spareParts = spareParts;
        if (totalAmount !== undefined) updateFields.totalAmount = totalAmount;

        const updated = await Booking.findByIdAndUpdate(
            bookingId, 
            { $set: updateFields }, 
            { returnDocument: 'after' }
        );

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// ❌ CANCEL / REJECT JOB ROUTE
// ==========================================
router.put('/cancel-job/:id', protect, async (req, res) => {
    try {
        const updated = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status: 'Pending', assignedTechnician: null }, 
            { returnDocument: 'after' }
        );

        if (!updated) return res.status(404).json({ message: "Job record not found!" });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// ⭐ SUBMIT CUSTOMER RATING & REVIEW ROUTE
// ==========================================
router.put('/rate-service/:id', async (req, res) => {
    try {
        const { rating, review } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Valid rating (1-5 stars) required!" });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: { rating: Number(rating), review: review || '', isRated: true } },
            { returnDocument: 'after' }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking record not found!" });
        }

        try {
            if (updatedBooking.assignedTechnician) {
                const techId = updatedBooking.assignedTechnician._id || updatedBooking.assignedTechnician;
                
                const ratedBookings = await Booking.find({
                    assignedTechnician: techId,
                    isRated: true
                });

                if (ratedBookings.length > 0) {
                    const totalScore = ratedBookings.reduce((sum, item) => sum + Number(item.rating || 0), 0);
                    const avgRating = Number((totalScore / ratedBookings.length).toFixed(1));

                    await Promise.all([
                        User.findByIdAndUpdate(techId, { rating: avgRating }),
                        Technician.findByIdAndUpdate(techId, { rating: avgRating })
                    ]);
                }
            }
        } catch (techErr) {
            console.warn("Tech rating update warning:", techErr.message);
        }

        res.status(200).json({ message: "⭐ Rating & feedback saved successfully!", updatedBooking });
    } catch (error) {
        console.error("Rate service error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;