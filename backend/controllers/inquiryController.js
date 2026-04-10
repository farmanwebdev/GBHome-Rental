const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');

exports.createInquiry = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (['sold', 'rented'].includes(property.status)) {
      return res.status(400).json({ success: false, message: 'Property not available for inquiries' });
    }
    const inquiry = await Inquiry.create({
      property: property._id, sender: req.user._id,
      owner: property.owner, message: req.body.message, phone: req.body.phone,
    });
    property.inquiryCount += 1;
    await property.save({ validateBeforeSave: false });
    res.status(201).json({ success: true, inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ sender: req.user._id })
      .populate('property', 'title images location status').sort('-createdAt');
    res.json({ success: true, inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOwnerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ owner: req.user._id })
      .populate('property', 'title images location').populate('sender', 'name email phone').sort('-createdAt');
    res.json({ success: true, inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.replyInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    if (inquiry.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    inquiry.reply = req.body.reply;
    inquiry.status = 'replied';
    inquiry.repliedAt = Date.now();
    await inquiry.save();
    res.json({ success: true, inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
