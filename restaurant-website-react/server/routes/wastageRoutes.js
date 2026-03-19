const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getWastage,
  createWastage,
  deleteWastage,
  getWastageStats
} = require('../controllers/wastageController');

// All routes require authentication
router.use(protect);

// Chef can view and log wastage; only super_admin and manager can delete
router.get('/stats', authorize('super_admin', 'manager', 'chef'), getWastageStats);
router.get('/',      authorize('super_admin', 'manager', 'chef'), getWastage);
router.post('/',     authorize('super_admin', 'manager', 'chef'), createWastage);
router.delete('/:id', authorize('super_admin', 'manager'), deleteWastage);

module.exports = router;
