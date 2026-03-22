const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');

// Ensure local uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let storage;
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'campusfix_complaints',
      allowedFormats: ['jpeg', 'png', 'jpg'],
    },
  });
} else {
  console.warn("Cloudinary API keys are missing or placeholder. Falling back to local disk storage mapping.");
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const ext = file.originalname.split('.').pop() || 'jpg';
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext);
    }
  });
}

const upload = multer({ storage: storage });

module.exports = { cloudinary: hasCloudinary ? cloudinary : null, upload };
