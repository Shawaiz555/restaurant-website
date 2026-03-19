const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getIngredients,
  getLowStockIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getIngredientStats
} = require('../controllers/ingredientController');

// All routes require authentication
router.use(protect);

// Chef can read stock levels; super_admin and manager can write
router.get('/low-stock', authorize('super_admin', 'manager', 'chef'), getLowStockIngredients);
router.get('/stats',     authorize('super_admin', 'manager', 'chef'), getIngredientStats);
router.get('/',          authorize('super_admin', 'manager', 'chef'), getIngredients);
router.post('/',         authorize('super_admin', 'manager'), createIngredient);
router.get('/:id',       authorize('super_admin', 'manager', 'chef'), getIngredientById);
router.put('/:id',       authorize('super_admin', 'manager'), updateIngredient);
router.delete('/:id',    authorize('super_admin', 'manager'), deleteIngredient);

module.exports = router;
