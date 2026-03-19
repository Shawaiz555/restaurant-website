const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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

// super_admin and manager can manage deals
router.post('/',            protect, authorize('super_admin', 'manager'), createDeal);
router.put('/:id',          protect, authorize('super_admin', 'manager'), updateDeal);
router.patch('/:id/toggle', protect, authorize('super_admin', 'manager'), toggleDealActive);
router.delete('/:id',       protect, authorize('super_admin', 'manager'), deleteDeal);

module.exports = router;
