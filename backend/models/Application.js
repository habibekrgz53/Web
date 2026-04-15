const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Bekliyor', 'Onaylandı', 'Reddedildi'], default: 'Bekliyor' }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
