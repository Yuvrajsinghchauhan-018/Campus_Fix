const multer = require('multer');
const fs = require('fs');

// Ensure local uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Strictly using local disk storage as requested by user
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop() || 'jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext);
  }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary: null, upload };
