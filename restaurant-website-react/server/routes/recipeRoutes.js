const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getRecipes,
  getRecipeByProductId,
  createOrUpdateRecipe,
  deleteRecipe
} = require('../controllers/recipeController');

router.use(protect, adminOnly);

router.get('/product/:productId', getRecipeByProductId);
router.route('/').get(getRecipes).post(createOrUpdateRecipe);
router.route('/:id').delete(deleteRecipe);

module.exports = router;
