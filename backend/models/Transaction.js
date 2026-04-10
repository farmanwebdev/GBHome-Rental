const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking',  required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  payer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true }, // buyer/renter
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true }, // owner

  transactionType: {
    type: String,
    enum: ['deposit', 'monthly_rent', 'purchase_payment', 'partial_payment', 'refund'],
    required: true,
  },

  amount:      { type: Number, required: true },
  currency:    { type: String, default: 'PKR' },
  month:       { type: String },  // e.g. "2026-04" for monthly rent
  description: { type: String },

  // Payment method
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'easypaisa', 'jazzcash', 'cash', 'cheque', 'other'],
    required: true,
  },
  accountTitle:  { type: String },  // receiver account title
  accountNumber: { type: String },  // receiver account number
  bankName:      { type: String },

  // Proof upload (screenshot / receipt)
  proofUrl:         { type: String, required: true },
  transactionRef:   { type: String },  // bank ref / TID

  // Verification
  status: {
    type: String,
    enum: ['pending', 'verified', 'disputed', 'rejected'],
    default: 'pending',
  },
  verifiedAt:    { type: Date },
  ownerNote:     { type: String },  // owner can confirm or dispute

  paidAt: { type: Date, default: Date.now },

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
