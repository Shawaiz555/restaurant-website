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
const { protect, authorize } = require('../middleware/auth');

// Public — guests and logged-in users can place orders
router.post('/', placeOrder);

// All staff can view orders and update status
router.get('/',              protect, authorize('super_admin', 'manager', 'employee', 'chef'), getOrders);
router.get('/stats/summary', protect, authorize('super_admin', 'manager'), getOrderStats);
router.get('/:id',           protect, authorize('super_admin', 'manager', 'employee', 'chef'), getOrderById);
router.put('/:id/status',    protect, authorize('super_admin', 'manager', 'employee', 'chef'), updateOrderStatus);

// Only super_admin and manager can delete orders
router.delete('/:id', protect, authorize('super_admin', 'manager'), deleteOrder);

module.exports = router;
