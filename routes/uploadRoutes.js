const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp|gif/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp|image\/gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // add return here
  } else {
    cb(new Error('ONLY JPG, JPEG, PNG, WEBP, GIF IMAGES ALLOWED ❌'), false);
  }
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `img-${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file' });
  }
  res.status(200).json(`/uploads/${req.file.filename}`);
});

// Error handler for multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'FILE TOO LARGE. MAX 5MB' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;