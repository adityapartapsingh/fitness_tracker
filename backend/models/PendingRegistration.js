const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // already hashed
    otpHash: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    otpRequests: { type: [Number], default: [] },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL: auto-delete after 10 minutes
});

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
