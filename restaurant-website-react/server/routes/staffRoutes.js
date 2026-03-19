const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  resetStaffPassword,
  getLiveSessions,
} = require('../controllers/staffController');

// All staff routes require authentication
router.use(protect);

// Live sessions — super_admin + manager
router.get('/live-sessions', authorize('super_admin', 'manager'), getLiveSessions);

// Staff CRUD — super_admin (all) + manager (subordinates only, enforced in controller)
router.get('/',     authorize('super_admin', 'manager'), getStaff);
router.get('/:id',  authorize('super_admin', 'manager'), getStaffById);
router.post('/',    authorize('super_admin', 'manager'), createStaff);
router.put('/:id',  authorize('super_admin', 'manager'), updateStaff);

// Status toggle + password reset
router.patch('/:id/status',         authorize('super_admin', 'manager'), toggleStaffStatus);
router.patch('/:id/reset-password', authorize('super_admin', 'manager'), resetStaffPassword);

module.exports = router;
