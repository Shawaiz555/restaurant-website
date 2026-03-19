const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  orderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  method: {
    type: String,
    required: true,
    enum: ['Cash', 'Card', 'Online', 'Bank Transfer'],
    default: 'Cash'
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
    default: 'Pending',
  },
  transactionRef: {
    type: String,
    default: null  // Card/online transaction reference
  },
  notes: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ processedBy: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
