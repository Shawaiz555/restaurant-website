const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    unique: true,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['g', 'kg', 'ml', 'L', 'pcs', 'cups', 'tbsp', 'tsp']
  },
  currentStock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  minimumStock: {
    type: Number,
    default: 0,
    min: [0, 'Minimum stock cannot be negative']
  },
  costPerUnit: {
    type: Number,
    default: 0,
    min: [0, 'Cost cannot be negative']
  },
  category: {
    type: String,
    enum: ['Produce', 'Meat', 'Dairy', 'Spices', 'Grains', 'Beverages', 'Other'],
    default: 'Other'
  }
}, {
  timestamps: true
});

ingredientSchema.index({ category: 1 });

module.exports = mongoose.model('Ingredient', ingredientSchema);
