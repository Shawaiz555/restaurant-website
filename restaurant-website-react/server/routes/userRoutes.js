const express = require('express');
const router = express.Router();
const { getCart, updateCart, clearCart } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All user routes are protected

router.get('/cart', getCart);
router.put('/cart', updateCart);
router.delete('/cart', clearCart);

module.exports = router;
