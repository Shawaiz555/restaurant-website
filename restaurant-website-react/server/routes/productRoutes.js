const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/categories/list', getCategories);
router.get('/:id', getProductById);

// super_admin and manager can manage products
router.post('/',    protect, authorize('super_admin', 'manager'), addProduct);
router.put('/:id',  protect, authorize('super_admin', 'manager'), updateProduct);
router.delete('/:id', protect, authorize('super_admin', 'manager'), deleteProduct);

module.exports = router;
