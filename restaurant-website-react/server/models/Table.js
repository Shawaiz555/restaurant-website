const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
      min: [1, 'Table number must be at least 1'],
    },
    name: {
      type: String,
      required: [true, 'Table name is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [20, 'Capacity cannot exceed 20'],
    },
    location: {
      type: String,
      enum: ['Indoor', 'Outdoor', 'VIP', 'Bar'],
      required: [true, 'Location is required'],
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Maintenance'],
      default: 'Available',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

tableSchema.index({ location: 1, status: 1 });
tableSchema.index({ isActive: 1 });

module.exports = mongoose.model('Table', tableSchema);
