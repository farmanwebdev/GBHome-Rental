const router = require('express').Router();
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFavorites);
router.post('/:propertyId', protect, toggleFavorite);

module.exports = router;
