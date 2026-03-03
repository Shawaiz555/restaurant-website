const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
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

// Admin only routes
router.post('/', protect, adminOnly, createTable);
router.put('/:id', protect, adminOnly, updateTable);
router.delete('/:id', protect, adminOnly, deleteTable);

module.exports = router;
