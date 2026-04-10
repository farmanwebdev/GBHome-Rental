const router = require('express').Router();
const { getProperties, getProperty, createProperty, updateProperty, deleteProperty, getFeatured } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getProperties);
router.get('/featured', getFeatured);
router.get('/:id', getProperty);
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 10), createProperty);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 10), updateProperty);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);

module.exports = router;
