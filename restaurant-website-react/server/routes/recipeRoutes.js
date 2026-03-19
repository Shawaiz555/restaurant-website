const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getRecipes,
  getRecipeByProductId,
  createOrUpdateRecipe,
  deleteRecipe
} = require('../controllers/recipeController');

// All routes require authentication
router.use(protect);

// Chef can read and write recipes; super_admin and manager can delete
router.get('/product/:productId', authorize('super_admin', 'manager', 'chef'), getRecipeByProductId);
router.get('/',   authorize('super_admin', 'manager', 'chef'), getRecipes);
router.post('/',  authorize('super_admin', 'manager', 'chef'), createOrUpdateRecipe);
router.delete('/:id', authorize('super_admin', 'manager'), deleteRecipe);

module.exports = router;
