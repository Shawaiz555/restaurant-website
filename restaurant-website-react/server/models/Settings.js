const mongoose = require('mongoose');

/**
 * Singleton settings document — only one document ever exists.
 * Use Settings.getSingleton() to read, Settings.setSingleton(data) to update.
 */
const settingsSchema = new mongoose.Schema({
  restaurant: {
    name:        { type: String, default: 'My Restaurant' },
    tagline:     { type: String, default: '' },
    phone:       { type: String, default: '' },
    email:       { type: String, default: '' },
    address:     { type: String, default: '' },
    city:        { type: String, default: '' },
    country:     { type: String, default: 'Pakistan' },
    openingTime: { type: String, default: '09:00' },
    closingTime: { type: String, default: '23:00' },
  },
  currency: {
    code:   { type: String, default: 'PKR' },
    symbol: { type: String, default: 'Rs' },
  },
  ordering: {
    deliveryFee:       { type: Number, default: 50 },
    minOrderAmount:    { type: Number, default: 0 },
    acceptingOrders:   { type: Boolean, default: true },
    estimatedDelivery: { type: String, default: '30-45 mins' },
  },
  reservations: {
    acceptingReservations: { type: Boolean, default: true },
    maxPartySize:          { type: Number, default: 10 },
    advanceBookingDays:    { type: Number, default: 30 },
    slotDurationMins:      { type: Number, default: 60 },
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Static helpers for singleton pattern
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

settingsSchema.statics.setSingleton = async function (data, userId) {
  let doc = await this.findOne();
  if (!doc) {
    doc = new this({});
  }
  // Deep-merge top-level sections
  ['restaurant', 'currency', 'ordering', 'reservations'].forEach((section) => {
    if (data[section]) {
      Object.assign(doc[section], data[section]);
    }
  });
  if (userId) doc.updatedBy = userId;
  doc.markModified('restaurant');
  doc.markModified('currency');
  doc.markModified('ordering');
  doc.markModified('reservations');
  await doc.save();
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
