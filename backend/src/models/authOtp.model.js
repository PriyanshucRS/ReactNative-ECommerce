const mongoose = require('mongoose');

const authOtpSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    otp: { type: String, required: true },
    uid: { type: String, required: true },
    type: { type: String, enum: ['email'], required: true },
    value: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.AuthOtp || mongoose.model('AuthOtp', authOtpSchema);
