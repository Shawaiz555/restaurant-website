const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
  getPurchaseStats
} = require('../controllers/purchaseController');

router.use(protect, adminOnly);

router.get('/stats', getPurchaseStats);
router.route('/').get(getPurchases).post(createPurchase);
router.route('/:id').get(getPurchaseById).delete(deletePurchase);

module.exports = router;
