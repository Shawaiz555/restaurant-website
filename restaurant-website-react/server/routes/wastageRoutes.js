const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getWastage,
  createWastage,
  deleteWastage,
  getWastageStats
} = require('../controllers/wastageController');

router.use(protect, adminOnly);

router.get('/stats', getWastageStats);
router.route('/').get(getWastage).post(createWastage);
router.route('/:id').delete(deleteWastage);

module.exports = router;
