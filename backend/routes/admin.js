const router = require('express').Router();
const {
  getDashboard, getAllProperties, approveProperty, rejectProperty,
  updateProperty, getAllUsers, updateUser, deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard',          getDashboard);
router.get('/properties',         getAllProperties);
router.put('/properties/:id/approve', approveProperty);
router.put('/properties/:id/reject',  rejectProperty);
router.put('/properties/:id',     updateProperty);
router.get('/users',              getAllUsers);
router.put('/users/:id',          updateUser);
router.delete('/users/:id',       deleteUser);

module.exports = router;
