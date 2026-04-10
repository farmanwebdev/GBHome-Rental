const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type:        { type: String, enum: ['apartment','house','villa','studio','commercial'], required: true },
  status:      { type: String, enum: ['pending','approved','rejected','rented','sold'], default: 'pending' },
  price:       { type: Number, required: true },
  priceType:   { type: String, enum: ['total','monthly','yearly'], default: 'monthly' },
  location: {
    address: { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String },
    country: { type: String, default: 'USA' },
    zipCode: { type: String },
  },
  features: {
    bedrooms:    { type: Number, default: 0 },
    bathrooms:   { type: Number, default: 0 },
    area:        { type: Number },
    parking:     { type: Boolean, default: false },
    furnished:   { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    pool:        { type: Boolean, default: false },
    gym:         { type: Boolean, default: false },
  },
  images:         [{ url: String, publicId: String }],
  owner:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availableFrom:  { type: Date },
  availableTo:    { type: Date },
  isFeatured:     { type: Boolean, default: false },
  views:          { type: Number, default: 0 },
  inquiryCount:   { type: Number, default: 0 },
  rejectedReason: { type: String },
}, { timestamps: true });

propertySchema.index({ 'location.city': 1, type: 1, status: 1, price: 1 });
propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Property', propertySchema);
