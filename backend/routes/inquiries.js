const router = require('express').Router();
const { createInquiry, getMyInquiries, getOwnerInquiries, replyInquiry } = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:propertyId', protect, createInquiry);
router.get('/my', protect, getMyInquiries);
router.get('/owner', protect, authorize('owner', 'admin'), getOwnerInquiries);
router.put('/:id/reply', protect, authorize('owner', 'admin'), replyInquiry);

module.exports = router;
