const Property = require('../models/Property');
const { hasCloudinary } = require('../config/cloudinary');

// Helper: extract image data from uploaded files
const extractImages = (files) => {
  if (!files || !files.length) return [];
  return files.map(f => ({
    url:      hasCloudinary ? f.path : `/uploads/${f.filename}`,
    publicId: hasCloudinary ? f.filename : f.filename,
  }));
};

// Helper: parse JSON string fields safely
const safeJSON = (val) => {
  if (!val || typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return val; }
};

// GET /api/properties  — public; only approved, rented, sold visible
exports.getProperties = async (req, res) => {
  try {
    const {
      type, status, city, minPrice, maxPrice,
      bedrooms, search, page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const query = {};

    // Default: only show publicly visible listings
    if (status && status !== '') {
      query.status = status;
    } else {
      query.status = { $in: ['approved', 'rented', 'sold'] };
    }

    if (type)     query.type = type;
    if (city)     query['location.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (bedrooms) query['features.bedrooms'] = { $gte: Number(bedrooms) };
    if (search)   query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
      Property.find(query).populate('owner', 'name email phone').sort(sort).skip(skip).limit(Number(limit)),
      Property.countDocuments(query),
    ]);
    res.json({ success: true, properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/properties/featured
exports.getFeatured = async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: 'approved' })
      .populate('owner', 'name').limit(6).sort('-createdAt');
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/properties/:id
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone avatar');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    property.views += 1;
    await property.save({ validateBeforeSave: false });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/properties  — owner/admin; starts as pending
exports.createProperty = async (req, res) => {
  try {
    const data = {
      ...req.body,
      owner:    req.user._id,
      status:   req.user.role === 'admin' ? 'approved' : 'pending', // admin listings auto-approve
      location: safeJSON(req.body.location),
      features: safeJSON(req.body.features),
    };
    if (req.files?.length) {
      data.images = extractImages(req.files);
    } else if (req.file) {
      data.images = extractImages([req.file]);
    }
    const property = await Property.create(data);
    res.status(201).json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/properties/:id
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const data = {
      ...req.body,
      location: safeJSON(req.body.location),
      features: safeJSON(req.body.features),
    };
    // If owner re-edits a rejected property, reset to pending
    if (property.status === 'rejected' && req.user.role !== 'admin') {
      data.status = 'pending';
      data.rejectedReason = undefined;
    }
    if (req.files?.length) data.images = extractImages(req.files);
    else if (req.file) data.images = extractImages([req.file]);
    property = await Property.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/properties/:id
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
