const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, cnic, password, role, phone } = req.body;

    if (!cnic) return res.status(400).json({ success: false, message: 'CNIC is required' });

    // Validate CNIC format XXXXX-XXXXXXX-X
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(cnic)) {
      return res.status(400).json({ success: false, message: 'CNIC must be in format XXXXX-XXXXXXX-X (e.g. 35201-1234567-9)' });
    }

    const [emailExists, cnicExists] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ cnic }),
    ]);
    if (emailExists) return res.status(400).json({ success: false, message: 'Email already registered' });
    if (cnicExists)  return res.status(400).json({ success: false, message: 'CNIC already registered' });

    const allowedRoles = ['user', 'owner'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const user = await User.create({ name, email, cnic, password, role: userRole, phone });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login  — accepts CNIC OR email + password
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;   // identifier = CNIC or email
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Provide CNIC/Email and password' });
    }

    // Detect if identifier is CNIC (contains dashes + digits pattern) or email
    const isCnic  = /^\d{5}-\d{7}-\d{1}$/.test(identifier.trim());
    const query   = isCnic ? { cnic: identifier.trim() } : { email: identifier.trim().toLowerCase() };

    const user = await User.findOne(query).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
