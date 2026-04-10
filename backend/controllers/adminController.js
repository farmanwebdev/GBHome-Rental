const User     = require('../models/User');
const Property = require('../models/Property');
const Inquiry  = require('../models/Inquiry');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProperties, totalInquiries, statusCounts] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Inquiry.countDocuments(),
      Property.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    const pendingProperties = await Property.find({ status: 'pending' })
      .populate('owner', 'name email').sort('-createdAt').limit(10);
    const recentUsers = await User.find().sort('-createdAt').limit(5);
    res.json({
      success: true,
      stats: { totalUsers, totalProperties, totalInquiries, statusCounts },
      pendingProperties,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/properties?status=pending|approved|rejected|all
exports.getAllProperties = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    const properties = await Property.find(filter)
      .populate('owner', 'name email phone').sort('-createdAt');
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/properties/:id/approve
exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', rejectedReason: undefined },
      { new: true }
    ).populate('owner', 'name email');
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, property, message: 'Property approved and now live' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/properties/:id/reject
exports.rejectProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectedReason: req.body.reason || 'Does not meet our guidelines.' },
      { new: true }
    ).populate('owner', 'name email');
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, property, message: 'Property rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/properties/:id  — update status, featured flag
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
