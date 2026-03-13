const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  ingredientName: { type: String, required: true },
  unit: { type: String, required: true },
  quantityRequired: {
    type: Number,
    required: true,
    min: [0.001, 'Quantity must be positive']
  }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  productName: { type: String, required: true },
  ingredients: {
    type: [recipeIngredientSchema],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);
