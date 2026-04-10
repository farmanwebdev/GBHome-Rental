const router = require('express').Router();
const {
  createTransaction, getBookingTransactions, getMyTransactions,
  getReceivedTransactions, verifyTransaction, getAllTransactions,
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/:bookingId',            protect, upload.single('proof'), createTransaction);
router.get('/booking/:bookingId',      protect, getBookingTransactions);
router.get('/my',                      protect, getMyTransactions);
router.get('/received',                protect, authorize('owner', 'admin'), getReceivedTransactions);
router.get('/admin/all',               protect, authorize('admin'), getAllTransactions);
router.put('/:id/verify',              protect, authorize('owner', 'admin'), verifyTransaction);

module.exports = router;
