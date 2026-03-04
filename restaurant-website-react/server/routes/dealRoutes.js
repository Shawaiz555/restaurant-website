const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  toggleDealActive,
  deleteDeal,
} = require('../controllers/dealController');

// Public routes
router.get('/', getDeals);
router.get('/:id', getDealById);

// Admin only routes
router.post('/', protect, adminOnly, createDeal);
router.put('/:id', protect, adminOnly, updateDeal);
router.patch('/:id/toggle', protect, adminOnly, toggleDealActive);
router.delete('/:id', protect, adminOnly, deleteDeal);

module.exports = router;
