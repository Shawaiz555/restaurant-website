const Recipe = require('../models/Recipe');
const Product = require('../models/Product');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Private (Admin)
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('productId', 'name category basePrice')
      .sort({ productName: 1 });

    res.json({ success: true, count: recipes.length, recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipes' });
  }
};

// @desc    Get recipe by product ID
// @route   GET /api/recipes/product/:productId
// @access  Private (Admin)
const getRecipeByProductId = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ productId: req.params.productId })
      .populate('productId', 'name category basePrice imageUrl');

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'No recipe found for this product' });
    }
    res.json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipe' });
  }
};

// @desc    Create or update recipe (upsert by productId)
// @route   POST /api/recipes
// @access  Private (Admin)
const createOrUpdateRecipe = async (req, res) => {
  try {
    const { productId, ingredients } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Get product name snapshot
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const recipe = await Recipe.findOneAndUpdate(
      { productId },
      { productId, productName: product.name, ingredients: ingredients || [] },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Recipe saved successfully',
      recipe
    });
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save recipe' });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private (Admin)
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    await recipe.deleteOne();
    res.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete recipe' });
  }
};

module.exports = { getRecipes, getRecipeByProductId, createOrUpdateRecipe, deleteRecipe };
