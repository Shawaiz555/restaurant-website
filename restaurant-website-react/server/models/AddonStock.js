const mongoose = require('mongoose');

const addonStockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Addon name is required'],
      trim: true,
      unique: true,
    },
    addonType: {
      type: String,
      required: true,
      enum: ['Drink', 'Dessert', 'Extra'],
    },
    unit: {
      type: String,
      required: true,
      enum: ['pcs', 'ml', 'L', 'g', 'kg', 'cups'],
      default: 'pcs',
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    costPerUnit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

addonStockSchema.index({ addonType: 1 });

module.exports = mongoose.model('AddonStock', addonStockSchema);
