const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAddonStocks,
  getAddonStockStats,
  getAddonStockById,
  createAddonStock,
  updateAddonStock,
  deleteAddonStock,
} = require('../controllers/addonStockController');

router.use(protect, adminOnly);

router.get('/stats', getAddonStockStats);
router.get('/', getAddonStocks);
router.get('/:id', getAddonStockById);
router.post('/', createAddonStock);
router.put('/:id', updateAddonStock);
router.delete('/:id', deleteAddonStock);

module.exports = router;
