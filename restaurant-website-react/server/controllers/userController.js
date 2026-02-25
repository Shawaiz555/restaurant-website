const User = require('../models/User');

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      cart: user.cart || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

// @desc    Update user cart
// @route   PUT /api/users/cart
// @access  Private
const updateCart = async (req, res) => {
  try {
    const { cart } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { cart },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
};

// @desc    Clear user cart
// @route   DELETE /api/users/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { cart: [] },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

module.exports = {
  getCart,
  updateCart,
  clearCart
};
