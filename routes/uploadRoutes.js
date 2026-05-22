const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp|gif/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp|image\/gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only! Use JPG, PNG, WEBP or GIF'), false);
  }
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }
  res.status(200).json(`/uploads/${req.file.filename}`);
});

module.exports = router;