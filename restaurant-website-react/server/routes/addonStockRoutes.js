const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAddonStocks,
  getAddonStockStats,
  getAddonStockById,
  createAddonStock,
  updateAddonStock,
  deleteAddonStock,
} = require('../controllers/addonStockController');

// Addon stock: super_admin and manager only
router.use(protect, authorize('super_admin', 'manager'));

router.get('/stats', getAddonStockStats);
router.get('/', getAddonStocks);
router.get('/:id', getAddonStockById);
router.post('/', createAddonStock);
router.put('/:id', updateAddonStock);
router.delete('/:id', deleteAddonStock);

module.exports = router;
