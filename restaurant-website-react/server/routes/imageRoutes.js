const express = require('express');
const router = express.Router();
const { uploadImage, getImage, deleteImage } = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

// Public route - get image
router.get('/:id', getImage);

// super_admin and manager can upload and delete images
router.post('/upload', protect, authorize('super_admin', 'manager'), upload.single('image'), uploadImage);
router.delete('/:id',  protect, authorize('super_admin', 'manager'), deleteImage);

module.exports = router;
