const Order = require('../models/Order');
const { sendOrderEmails } = require('../../api/_lib/emailService');

// @desc    Place new order
// @route   POST /api/orders
// @access  Public (guests) / Private (logged-in users)
const placeOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Validate order data
    if (!orderData.customerInfo || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data'
      });
    }

    // Set userId if user is authenticated
    if (req.user) {
      orderData.userId = req.user._id;
      orderData.isGuestOrder = false;
    } else {
      orderData.userId = null;
      orderData.isGuestOrder = true;
    }

    // Create order in database
    const order = await Order.create(orderData);

    // Send emails
    const emailStatus = await sendOrderEmails(order.toObject());

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderId: order.orderId,
        _id: order._id,
        status: order.status,
        total: order.total
      },
      emailStatus
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
};

// @desc    Get all orders (with filters)
// @route   GET /api/orders
// @access  Private (Admin)
const getOrders = async (req, res) => {
  try {
    const { status, userType, search, sortBy = 'orderDate', order = 'desc' } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by user type
    if (userType === 'Guest') {
      query.isGuestOrder = true;
    } else if (userType === 'Registered') {
      query.isGuestOrder = false;
    }

    // Search
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customerInfo.fullName': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Owner or Admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization (admin or order owner)
    if (req.user.role !== 'admin' && order.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.deleteOne();

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/summary
// @access  Private (Admin)
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const completedOrders = await Order.countDocuments({ status: 'Completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    const guestOrders = await Order.countDocuments({ isGuestOrder: true });
    const registeredOrders = await Order.countDocuments({ isGuestOrder: false });

    // Calculate total revenue
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        guestOrders,
        registeredOrders,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
};
