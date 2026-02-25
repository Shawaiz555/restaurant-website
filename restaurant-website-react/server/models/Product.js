const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // GridFS file ID
  },
  imageUrl: String, // External URL fallback
  sizes: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' }
  }],
  spiceLevels: [{
    name: { type: String, required: true },
    description: { type: String, default: '' }
  }],
  ingredients: [String],
  nutritionInfo: [{
    label: String,
    value: String,
    unit: String
  }],
  addOnsConfig: {
    showSpiceLevel: { type: Boolean, default: false },
    showDrinks: { type: Boolean, default: false },
    showDesserts: { type: Boolean, default: false },
    showExtras: { type: Boolean, default: false }
  },
  // Dynamic add-ons
  drinks: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' }
  }],
  desserts: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' }
  }],
  extras: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' }
  }],
  rating: {
    type: Number,
    default: 4,
    min: 0,
    max: 5
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, available: 1 });

module.exports = mongoose.model('Product', productSchema);
