const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  phone: { type: String },
  status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  reply: { type: String },
  repliedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
