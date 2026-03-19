const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getSettings, updateSettings, getPublicSettings } = require('../controllers/settingsController');

// Public — no auth required (read-only subset for frontend display)
router.get('/public', getPublicSettings);

// Admin only
router.use(protect, authorize('super_admin'));
router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
