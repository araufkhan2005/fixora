const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// ServiceHub ke naye appliance booking routes ko import kiya
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 🛠️ MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json()); // Frontend se JSON data accept karne ke liye

// ==========================================
// 🔗 ROUTES LINKING
// ==========================================
// Saari home services aur technicians ki APIs is path par chalengi
app.use('/api/services', serviceRoutes);

// Base Route (Browser par check karne ke liye ki server active hai ya nahi)
app.get('/', (req, res) => {
    res.send('🚀 ServiceHub Multi-Service Server Ekdam Mast Chal Raha Hai!');
});

// ==========================================
// 💾 DATABASE CONNECTION (MongoDB Local)
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('🚀 MongoDB Local Se Connect Ho Gaya!');
        console.log('📂 Database Name: servicehub');
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err);
    });

// ==========================================
// 🚀 SERVER START
// ==========================================
app.listen(PORT, () => {
    console.log(`📡 Server is running on port ${PORT}`);
});