const express = require('express');
const router = express.Router();
const { uploadImage, getImage, deleteImage } = require('../controllers/imageController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../config/multer');

// Public route - get image
router.get('/:id', getImage);

// Admin routes - upload and delete
router.post('/upload', protect, adminOnly, upload.single('image'), uploadImage);
router.delete('/:id', protect, adminOnly, deleteImage);

module.exports = router;
