const mongoose = require('mongoose');
const Ingredient = require('./Ingredient');

const wastageSchema = new mongoose.Schema({
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  ingredientName: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
    min: [0.001, 'Quantity must be positive']
  },
  reason: {
    type: String,
    enum: ['Spoilage', 'Spillage', 'Expired', 'Overcooked', 'Other'],
    required: true
  },
  notes: { type: String, trim: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

// After saving a wastage entry, decrement ingredient stock (floor at 0)
wastageSchema.post('save', async function (doc) {
  try {
    const ingredient = await Ingredient.findById(doc.ingredientId);
    if (ingredient) {
      const newStock = Math.max(0, ingredient.currentStock - doc.quantity);
      await Ingredient.findByIdAndUpdate(doc.ingredientId, { currentStock: newStock });
    }
  } catch (err) {
    console.error('Stock decrement error after wastage save:', err);
  }
});

module.exports = mongoose.model('Wastage', wastageSchema);
