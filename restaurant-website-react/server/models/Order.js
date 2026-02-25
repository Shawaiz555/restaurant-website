const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for guest orders
    index: true
  },
  customerInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    additionalNotes: String
  },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    id: String, // Original product ID for reference
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: String,
    image: String,
    cartItemId: String,
    addOns: {
      drinks: [{ id: String, name: String, price: Number, quantity: Number }],
      desserts: [{ id: String, name: String, price: Number, quantity: Number }],
      extras: [{ id: String, name: String, price: Number, quantity: Number }]
    },
    spiceLevel: {
      id: String,
      name: String
    }
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 50 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isGuestOrder: { type: Boolean, default: false, index: true },
  orderDate: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

// Generate orderId before saving if not provided
orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}`;
  }
  next();
});

// Index for common queries
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ userId: 1, orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);
