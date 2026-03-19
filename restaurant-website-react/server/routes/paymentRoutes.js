const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentSummary
} = require('../controllers/paymentController');

// All routes require auth
router.use(protect);

// Stats — super_admin, manager
router.get('/stats/summary', authorize('super_admin', 'manager'), getPaymentSummary);

// List + create — super_admin, manager, employee
router.get('/', authorize('super_admin', 'manager', 'employee'), getPayments);
router.post('/', authorize('super_admin', 'manager', 'employee'), createPayment);

// Single — super_admin, manager, employee
router.get('/:id', authorize('super_admin', 'manager', 'employee'), getPaymentById);

// Update — super_admin, manager
router.put('/:id', authorize('super_admin', 'manager'), updatePayment);

// Delete — super_admin only
router.delete('/:id', authorize('super_admin'), deletePayment);

module.exports = router;
