const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route (guests can place orders)
router.post('/', placeOrder);

// Protected routes
router.get('/', protect, adminOnly, getOrders);
router.get('/stats/summary', protect, adminOnly, getOrderStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;
