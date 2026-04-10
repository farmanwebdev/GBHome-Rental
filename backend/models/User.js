const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  cnic:     { type: String, required: true, unique: true, trim: true,
              match: [/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X'] },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone:    { type: String, trim: true },
  avatar:   { type: String },
  isActive: { type: Boolean, default: true },
  favorites:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  // CNIC document upload proof
  cnicFrontUrl: { type: String },
  cnicBackUrl:  { type: String },
  isVerified:   { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
