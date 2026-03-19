const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

// Suppliers: super_admin and manager only
router.use(protect, authorize('super_admin', 'manager'));

router.route('/').get(getSuppliers).post(createSupplier);
router.route('/:id').get(getSupplierById).put(updateSupplier).delete(deleteSupplier);

module.exports = router;
