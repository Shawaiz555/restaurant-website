const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
  getPurchaseStats
} = require('../controllers/purchaseController');

// Purchases: super_admin and manager only
router.use(protect, authorize('super_admin', 'manager'));

router.get('/stats', getPurchaseStats);
router.route('/').get(getPurchases).post(createPurchase);
router.route('/:id').get(getPurchaseById).delete(deletePurchase);

module.exports = router;
