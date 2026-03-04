const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  createReservation,
  getReservations,
  getReservationStats,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
  cancelMyReservation,
  deleteReservation,
  getBookedTimes,
} = require('../controllers/reservationController');

// Public route — guests and users can create reservations
// Optionally attach user if token is present (soft auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { verifyAccessToken } = require('../utils/jwt');
      const User = require('../models/User');
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);
        req.user = await User.findById(decoded.userId).select('-password');
      } catch {
        // Token invalid — treat as guest, continue
        req.user = null;
      }
    }
    next();
  } catch {
    next();
  }
};

router.post('/', optionalAuth, createReservation);

// Public route — get booked time slots for a date
router.get('/booked-times', getBookedTimes);

// Protected user routes
router.get('/my', protect, getMyReservations);
router.put('/:id/cancel', protect, cancelMyReservation);

// Admin routes
router.get('/stats', protect, adminOnly, getReservationStats);
router.get('/', protect, adminOnly, getReservations);
router.get('/:id', protect, adminOnly, getReservationById);
router.put('/:id/status', protect, adminOnly, updateReservationStatus);
router.delete('/:id', protect, adminOnly, deleteReservation);

module.exports = router;
