const mongoose = require('mongoose');
const Ingredient = require('./Ingredient');

const purchaseItemSchema = new mongoose.Schema({
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  ingredientName: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: [0.01, 'Quantity must be positive'] },
  pricePerUnit: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const purchaseSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: { type: String, required: true },
  totalCost: { type: Number, default: 0, min: 0 },
  purchaseDate: { type: Date, default: Date.now, index: true },
  notes: { type: String, trim: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [purchaseItemSchema],
    validate: [(v) => v.length > 0, 'At least one item is required']
  }
}, {
  timestamps: true
});

// After saving a new purchase, increment stock for each ingredient
purchaseSchema.post('save', async function (doc) {
  try {
    const updates = doc.items.map((item) =>
      Ingredient.findByIdAndUpdate(item.ingredientId, {
        $inc: { currentStock: item.quantity }
      })
    );
    await Promise.all(updates);
  } catch (err) {
    console.error('Stock increment error after purchase save:', err);
  }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
