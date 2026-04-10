const Property = require('../models/Property');
const Inquiry  = require('../models/Inquiry');

exports.getDashboard = async (req, res) => {
  try {
    const [totalProperties, newInquiries, statusCounts] = await Promise.all([
      Property.countDocuments({ owner: req.user._id }),
      Inquiry.countDocuments({ owner: req.user._id, status: 'new' }),
      Property.aggregate([
        { $match: { owner: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    const properties = await Property.find({ owner: req.user._id }).sort('-createdAt').limit(5);
    res.json({ success: true, stats: { totalProperties, newInquiries, statusCounts }, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    // Owner can only change between rented/sold (cannot approve own listing)
    const allowedStatuses = ['rented', 'sold'];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'You can only mark a property as rented or sold' });
    }
    property.status = req.body.status;
    await property.save();
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
