const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Gönüllü', 'Düzenleyici', 'Admin'], default: 'Gönüllü' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  city: { type: String },
  availability: { type: String },
  bio: { type: String },
  phone: { type: String },
  occupation: { type: String },
  gender: { type: String },
  birthDate: { type: Date },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
