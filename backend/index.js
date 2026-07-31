const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Routes Import
const serviceRoutes = require('./routes/serviceRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 🛠️ MIDDLEWARES (50MB PAYLOAD LIMIT FIX)
// ==========================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// 🔗 ROUTES LINKING
// ==========================================
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('🚀 ServiceHub Server Running Successfully!');
});

// ==========================================
// 💾 DATABASE CONNECTION
// ==========================================
const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicehub';

mongoose.connect(DB_URI)
    .then(() => {
        console.log('🚀 MongoDB Local Connected Successfully!');
        console.log('📂 Database Name: servicehub');
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err);
    });

// ==========================================
// 🚀 SERVER START
// ==========================================
app.listen(PORT, () => {
    console.log(`📡 Server running on port ${PORT}`);
});