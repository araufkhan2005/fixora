const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    role: {
        type: String,
        enum: ['customer', 'technician', 'admin'],
        default: 'customer'
    },
    specialty: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    photo: {
        type: String,
        default: ''
    },
    age: {
        type: Number,
        default: 25
    },
    subscriptionPlan: {
        type: String,
        default: 'Basic'
    },
    planPrice: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// 🔒 Password Hash
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 Password Match Method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);