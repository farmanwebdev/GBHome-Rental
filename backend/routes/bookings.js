const router = require('express').Router();
const {
  createBooking, getMyBookings, getOwnerBookings,
  getBooking, approveBooking, rejectBooking, getAllBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Upload: cnicFront, cnicBack, additionalProof
const bookingUpload = upload.fields([
  { name: 'cnicFront',       maxCount: 1 },
  { name: 'cnicBack',        maxCount: 1 },
  { name: 'additionalProof', maxCount: 1 },
]);

router.post('/:propertyId',         protect, authorize('user'), bookingUpload, createBooking);
router.get('/my',                    protect, getMyBookings);
router.get('/owner',                 protect, authorize('owner', 'admin'), getOwnerBookings);
router.get('/admin/all',             protect, authorize('admin'), getAllBookings);
router.get('/:id',                   protect, getBooking);
router.put('/:id/approve',           protect, authorize('owner', 'admin'), approveBooking);
router.put('/:id/reject',            protect, authorize('owner', 'admin'), rejectBooking);

module.exports = router;
