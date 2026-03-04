const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    reservationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // Primary table (first selected table — kept for backward compatibility)
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: false,
    },
    // All selected tables (supports multi-table reservations)
    tableIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    }],
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    reservationDate: {
      type: String, // stored as "YYYY-MM-DD"
      required: [true, 'Reservation date is required'],
      index: true,
    },
    reservationTime: {
      type: String, // stored as "HH:MM"
      required: [true, 'Reservation time is required'],
    },
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party size must be at least 1'],
    },
    specialRequests: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
      index: true,
    },
    isGuestReservation: {
      type: Boolean,
      default: false,
    },
    guestDetails: {
      hasGuestList: { type: Boolean, default: false },
      guests: [
        {
          name: { type: String, required: true, trim: true },
          note: { type: String, trim: true, default: '' },
        },
      ],
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ reservationDate: 1, reservationTime: 1 });
reservationSchema.index({ userId: 1, status: 1 });
reservationSchema.index({ email: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
