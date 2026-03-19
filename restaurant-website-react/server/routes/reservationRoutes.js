const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  createReservation,
  getReservations,
  getReservationStats,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
  assignStackedTables,
  cancelMyReservation,
  deleteReservation,
  getBookedTimes,
} = require('../controllers/reservationController');

// Public route — guests and users can create reservations
router.post('/', optionalAuth, createReservation);

// Public route — get booked time slots for a date
router.get('/booked-times', getBookedTimes);

// Protected user routes
router.get('/my', protect, getMyReservations);
router.put('/:id/cancel', protect, cancelMyReservation);

// Staff routes — super_admin, manager, employee can manage reservations
router.get('/stats',       protect, authorize('super_admin', 'manager', 'employee'), getReservationStats);
router.get('/',            protect, authorize('super_admin', 'manager', 'employee'), getReservations);
router.get('/:id',         protect, authorize('super_admin', 'manager', 'employee'), getReservationById);
router.put('/:id/status',  protect, authorize('super_admin', 'manager', 'employee'), updateReservationStatus);
router.put('/:id/tables',  protect, authorize('super_admin', 'manager', 'employee'), assignStackedTables);
router.delete('/:id',      protect, authorize('super_admin', 'manager'), deleteReservation);

module.exports = router;
