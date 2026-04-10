const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key'
);

let upload;

if (hasCloudinary) {
  // ─── Cloudinary storage ───────────────────────────────────────────────────
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:           'gbrentals',
      allowed_formats:  ['jpg','jpeg','png','webp'],
      transformation:   [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
    },
  });
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('✅ Cloudinary storage active');
} else {
  // ─── Local disk storage fallback ─────────────────────────────────────────
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename:    (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g,'-')}`),
  });
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('⚠️  Cloudinary not configured — using local disk storage');
}

module.exports = { cloudinary, upload, hasCloudinary };
