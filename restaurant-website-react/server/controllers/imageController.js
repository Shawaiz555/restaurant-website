const { getGridFSBucket } = require('../config/database');
const mongoose = require('mongoose');
const { Readable } = require('stream');

// @desc    Upload image to GridFS
// @route   POST /api/images/upload
// @access  Private (Admin)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const gridfsBucket = getGridFSBucket();
    const filename = `${Date.now()}-${req.file.originalname}`;

    // Create a readable stream from the buffer
    const readableStream = Readable.from(req.file.buffer);

    // Create upload stream
    const uploadStream = gridfsBucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        uploadDate: new Date()
      }
    });

    // Pipe the buffer to GridFS
    readableStream.pipe(uploadStream);

    uploadStream.on('finish', () => {
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        imageId: uploadStream.id.toString(),
        filename: filename
      });
    });

    uploadStream.on('error', (error) => {
      console.error('Upload stream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message
      });
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// @desc    Get image from GridFS
// @route   GET /api/images/:id
// @access  Public
const getImage = async (req, res) => {
  try {
    const gridfsBucket = getGridFSBucket();
    const imageId = mongoose.Types.ObjectId.createFromHexString(req.params.id);

    // Check if file exists
    const files = await gridfsBucket.find({ _id: imageId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const file = files[0];

    // Set content type
    res.set('Content-Type', file.contentType);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Create read stream and pipe to response
    const readStream = gridfsBucket.openDownloadStream(imageId);
    readStream.pipe(res);

  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve image'
    });
  }
};

// @desc    Delete image from GridFS
// @route   DELETE /api/images/:id
// @access  Private (Admin)
const deleteImage = async (req, res) => {
  try {
    const gridfsBucket = getGridFSBucket();
    const imageId = mongoose.Types.ObjectId.createFromHexString(req.params.id);

    // Check if file exists
    const files = await gridfsBucket.find({ _id: imageId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    await gridfsBucket.delete(imageId);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

module.exports = {
  uploadImage,
  getImage,
  deleteImage
};
