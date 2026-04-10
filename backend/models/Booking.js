const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  buyer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  bookingType: { type: String, enum: ['rent', 'buy'], required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },

  // Buyer proof documents
  buyerCnic:         { type: String, required: true }, // CNIC number (stored from User)
  cnicFrontUrl:      { type: String, required: true }, // uploaded image
  cnicBackUrl:       { type: String, required: true }, // uploaded image
  additionalProofUrl:{ type: String },                 // optional extra doc
  buyerNote:         { type: String },

  // Agreed terms
  agreedPrice:     { type: Number, required: true },
  depositAmount:   { type: Number, default: 0 },
  startDate:       { type: Date,   required: true },
  endDate:         { type: Date },           // null = indefinite rent / buy

  // Owner response
  ownerNote:       { type: String },
  approvedAt:      { type: Date },
  rejectedReason:  { type: String },

  // Contract PDF / agreement upload
  contractUrl:     { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
