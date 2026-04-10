const Booking  = require('../models/Booking');
const Property = require('../models/Property');
const User     = require('../models/User');
const { hasCloudinary } = require('../config/cloudinary');
const { sendBookingNotification } = require('../config/email');

const extractUrl = (file) => file
  ? (hasCloudinary ? file.path : `/uploads/${file.filename}`)
  : null;

// POST /api/bookings/:propertyId — buyer submits booking request with CNIC proof
exports.createBooking = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only tenant/buyer accounts may book properties' });
    }

    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Property is not available for booking' });
    }

    // Ensure CNIC images were uploaded
    const cnicFront = req.files?.cnicFront?.[0];
    const cnicBack  = req.files?.cnicBack?.[0];
    if (!cnicFront || !cnicBack) {
      return res.status(400).json({ success: false, message: 'Both CNIC front and back images are required' });
    }

    const buyer = await User.findById(req.user._id);

    const booking = await Booking.create({
      property:          property._id,
      buyer:             req.user._id,
      owner:             property.owner,
      bookingType:       req.body.bookingType,
      buyerCnic:         buyer.cnic,
      cnicFrontUrl:      extractUrl(cnicFront),
      cnicBackUrl:       extractUrl(cnicBack),
      additionalProofUrl:extractUrl(req.files?.additionalProof?.[0]),
      buyerNote:         req.body.buyerNote,
      agreedPrice:       req.body.agreedPrice || property.price,
      depositAmount:     req.body.depositAmount || 0,
      startDate:         req.body.startDate,
      endDate:           req.body.endDate || null,
    });

    // Send notification emails to owner and admins
    try {
      const owner = await User.findById(property.owner);
      const populatedProperty = await Property.findById(property._id).populate('location');
      await sendBookingNotification(booking, populatedProperty, buyer, owner);
    } catch (emailError) {
      console.error('Email notification failed:', emailError.message);
      // Don't fail the booking if email fails
    }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/my — buyer sees their bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ buyer: req.user._id })
      .populate('property', 'title images location price priceType status')
      .populate('owner', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/owner — owner sees bookings on their properties
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('property', 'title images location price priceType')
      .populate('buyer', 'name email phone cnic')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/:id — single booking detail
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title images location price priceType features')
      .populate('buyer',    'name email phone cnic')
      .populate('owner',    'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    // Only buyer, owner, or admin may view
    const allowed = [booking.buyer._id.toString(), booking.owner._id.toString()];
    if (!allowed.includes(req.user._id.toString()) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/bookings/:id/approve — owner approves
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    booking.status     = 'approved';
    booking.ownerNote  = req.body.ownerNote || '';
    booking.approvedAt = new Date();
    await booking.save();
    // Mark property as rented/sold
    await Property.findByIdAndUpdate(booking.property,
      { status: booking.bookingType === 'buy' ? 'sold' : 'rented' }
    );
    res.json({ success: true, booking, message: 'Booking approved. Property status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/bookings/:id/reject — owner rejects
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    booking.status         = 'rejected';
    booking.rejectedReason = req.body.reason || 'Application not accepted.';
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/admin — admin sees all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('property', 'title location')
      .populate('buyer',    'name email cnic')
      .populate('owner',    'name email')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
