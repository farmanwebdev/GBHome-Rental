const User = require('../models/User');
const Property = require('../models/Property');

exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;
    const idx = user.favorites.indexOf(propertyId);
    if (idx === -1) {
      user.favorites.push(propertyId);
    } else {
      user.favorites.splice(idx, 1);
    }
    await user.save();
    res.json({ success: true, favorites: user.favorites, isFavorited: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'owner', select: 'name email' },
    });
    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
