const Transaction = require('../models/Transaction');
const Booking     = require('../models/Booking');
const { hasCloudinary } = require('../config/cloudinary');

const extractUrl = (file) => file
  ? (hasCloudinary ? file.path : `/uploads/${file.filename}`)
  : null;

// POST /api/transactions/:bookingId — renter uploads monthly payment proof
exports.createTransaction = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('property', 'title price');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the renter can upload payments' });
    }
    if (!['approved', 'active'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking must be approved before payments' });
    }
    const proofFile = req.file;
    if (!proofFile) {
      return res.status(400).json({ success: false, message: 'Payment receipt/screenshot is required' });
    }

    const tx = await Transaction.create({
      booking:         booking._id,
      property:        booking.property._id,
      payer:           req.user._id,
      receiver:        booking.owner,
      transactionType: req.body.transactionType || 'monthly_rent',
      amount:          req.body.amount,
      currency:        req.body.currency || 'PKR',
      month:           req.body.month || null,
      description:     req.body.description,
      paymentMethod:   req.body.paymentMethod,
      accountTitle:    req.body.accountTitle,
      accountNumber:   req.body.accountNumber,
      bankName:        req.body.bankName,
      proofUrl:        extractUrl(proofFile),
      transactionRef:  req.body.transactionRef,
      paidAt:          req.body.paidAt || new Date(),
    });

    res.status(201).json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/transactions/booking/:bookingId — all payments for a booking
exports.getBookingTransactions = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const allowed = [booking.buyer.toString(), booking.owner.toString()];
    if (!allowed.includes(req.user._id.toString()) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const transactions = await Transaction.find({ booking: req.params.bookingId })
      .populate('payer',    'name email cnic')
      .populate('receiver', 'name email')
      .sort('-paidAt');
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/transactions/my — renter sees their payment history
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ payer: req.user._id })
      .populate('property', 'title location images')
      .populate('receiver', 'name email phone')
      .sort('-paidAt');
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/transactions/received — owner sees received payments
exports.getReceivedTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ receiver: req.user._id })
      .populate('property', 'title location images')
      .populate('payer',    'name email phone cnic')
      .sort('-paidAt');
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/transactions/:id/verify — owner verifies or disputes
exports.verifyTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (tx.receiver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    tx.status     = req.body.status; // 'verified' or 'disputed'
    tx.ownerNote  = req.body.note || '';
    tx.verifiedAt = req.body.status === 'verified' ? new Date() : null;
    await tx.save();
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/transactions/admin — admin sees all
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('property', 'title location')
      .populate('payer',    'name email cnic')
      .populate('receiver', 'name email')
      .sort('-paidAt');
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
