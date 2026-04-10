const router = require('express').Router();
const { getDashboard, getMyProperties, updatePropertyStatus } = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('owner', 'admin'));
router.get('/dashboard', getDashboard);
router.get('/properties', getMyProperties);
router.put('/properties/:id/status', updatePropertyStatus);

module.exports = router;

// Owner also needs to view & manage bookings on their properties
const { getOwnerBookings, approveBooking, rejectBooking } = require('../controllers/bookingController');
router.get('/bookings',              getOwnerBookings);
router.put('/bookings/:id/approve',  approveBooking);
router.put('/bookings/:id/reject',   rejectBooking);

// Owner views received transactions
const { getReceivedTransactions, verifyTransaction } = require('../controllers/transactionController');
router.get('/transactions',          getReceivedTransactions);
router.put('/transactions/:id/verify', verifyTransaction);
