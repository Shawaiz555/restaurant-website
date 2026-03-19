const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getAvailableTables,
} = require('../controllers/tableController');

// Public routes
router.get('/', getTables);
router.get('/available', getAvailableTables);
router.get('/:id', getTableById);

// super_admin, manager, employee can manage tables
router.post('/',      protect, authorize('super_admin', 'manager', 'employee'), createTable);
router.put('/:id',    protect, authorize('super_admin', 'manager', 'employee'), updateTable);
router.delete('/:id', protect, authorize('super_admin', 'manager'), deleteTable);

module.exports = router;
