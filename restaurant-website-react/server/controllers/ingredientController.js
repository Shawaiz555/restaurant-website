const Ingredient = require('../models/Ingredient');

// @desc    Get all ingredients
// @route   GET /api/ingredients
// @access  Private (Admin)
const getIngredients = async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minimumStock'] };
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const ingredients = await Ingredient.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: ingredients.length,
      ingredients
    });
  } catch (error) {
    console.error('Get ingredients error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ingredients' });
  }
};

// @desc    Get low stock ingredients
// @route   GET /api/ingredients/low-stock
// @access  Private (Admin)
const getLowStockIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    }).sort({ currentStock: 1 });

    res.json({
      success: true,
      count: ingredients.length,
      ingredients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch low stock ingredients' });
  }
};

// @desc    Get single ingredient
// @route   GET /api/ingredients/:id
// @access  Private (Admin)
const getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    res.json({ success: true, ingredient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ingredient' });
  }
};

// @desc    Create ingredient
// @route   POST /api/ingredients
// @access  Private (Admin)
const createIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully',
      ingredient
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ingredient with this name already exists' });
    }
    console.error('Create ingredient error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create ingredient' });
  }
};

// @desc    Update ingredient
// @route   PUT /api/ingredients/:id
// @access  Private (Admin)
const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    res.json({ success: true, message: 'Ingredient updated successfully', ingredient });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ingredient with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to update ingredient' });
  }
};

// @desc    Delete ingredient
// @route   DELETE /api/ingredients/:id
// @access  Private (Admin)
const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    await ingredient.deleteOne();
    res.json({ success: true, message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete ingredient' });
  }
};

// @desc    Get ingredient stats
// @route   GET /api/ingredients/stats
// @access  Private (Admin)
const getIngredientStats = async (req, res) => {
  try {
    const total = await Ingredient.countDocuments();
    const lowStock = await Ingredient.countDocuments({
      $expr: { $and: [{ $gt: ['$currentStock', 0] }, { $lte: ['$currentStock', '$minimumStock'] }] }
    });
    const outOfStock = await Ingredient.countDocuments({ currentStock: 0 });
    const categoryBreakdown = await Ingredient.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: { total, lowStock, outOfStock, categoryBreakdown }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ingredient stats' });
  }
};

module.exports = {
  getIngredients,
  getLowStockIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getIngredientStats
};
