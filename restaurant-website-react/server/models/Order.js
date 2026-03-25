const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    // Not required here — the pre-save hook always generates it before validation
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for guest orders
  },
  customerInfo: {
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
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
    },
    // Deal-specific fields (only present when isDeal is true)
    isDeal: { type: Boolean, default: false },
    dealId: String,
    dealTitle: String,
    dealItems: [{
      name: String,
      imageUrl: String,
      category: String,
      quantity: { type: Number, default: 1 }
    }]
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 50 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isGuestOrder: { type: Boolean, default: false, index: true },
  orderSource: { type: String, enum: ['online', 'in-store'], default: 'online', index: true },
  orderType: { type: String, enum: ['delivery', 'takeaway', 'dine-in'], default: 'delivery' },
  tableNumber: { type: String, default: null },
  orderDate: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

// Generate orderId before saving if not provided
// Also enforce required fields for online orders
orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}`;
  }
  // Online orders require delivery address fields
  if (this.orderSource === 'online' || !this.orderSource) {
    const ci = this.customerInfo || {};
    if (!ci.email) return next(new Error('Email is required for online orders'));
    if (!ci.phone) return next(new Error('Phone is required for online orders'));
    if (!ci.address) return next(new Error('Address is required for online orders'));
    if (!ci.city) return next(new Error('City is required for online orders'));
    if (!ci.postalCode) return next(new Error('Postal code is required for online orders'));
  }
  // Default fullName for in-store anonymous orders
  if (this.orderSource === 'in-store' && !this.customerInfo?.fullName) {
    if (!this.customerInfo) this.customerInfo = {};
    this.customerInfo.fullName = 'Walk-in Customer';
  }
  next();
});

// Index for common queries
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ userId: 1, orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);
