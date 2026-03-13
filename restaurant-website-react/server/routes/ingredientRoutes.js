const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getIngredients,
  getLowStockIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getIngredientStats
} = require('../controllers/ingredientController');

router.use(protect, adminOnly);

router.get('/low-stock', getLowStockIngredients);
router.get('/stats', getIngredientStats);
router.route('/').get(getIngredients).post(createIngredient);
router.route('/:id').get(getIngredientById).put(updateIngredient).delete(deleteIngredient);

module.exports = router;
