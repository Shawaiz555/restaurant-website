const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (super_admin, manager, employee)
const getPayments = async (req, res) => {
  try {
    const { status, method, startDate, endDate } = req.query;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (method && method !== 'All') query.method = method;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('processedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// @desc    Get single payment by ID
// @route   GET /api/payments/:id
// @access  Private (super_admin, manager, employee)
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('processedBy', 'name email role');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment' });
  }
};

// @desc    Create payment (mark order as paid)
// @route   POST /api/payments
// @access  Private (super_admin, manager, employee)
const createPayment = async (req, res) => {
  try {
    const { orderId, amount, method, transactionRef, notes } = req.body;

    if (!orderId || !amount || !method) {
      return res.status(400).json({ success: false, message: 'orderId, amount and method are required' });
    }

    // Check if order exists
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const payment = await Payment.create({
      orderId,
      orderRef: order._id,
      amount,
      method,
      status: 'Paid',
      transactionRef: transactionRef || null,
      notes: notes || '',
      processedBy: req.user._id,
      paidAt: new Date()
    });

    await payment.populate('processedBy', 'name email role');

    res.status(201).json({ success: true, message: 'Payment recorded successfully', payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create payment' });
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private (super_admin, manager)
const updatePayment = async (req, res) => {
  try {
    const { status, notes, transactionRef } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status, notes, transactionRef, ...(status === 'Paid' && { paidAt: new Date() }) },
      { new: true, runValidators: true }
    ).populate('processedBy', 'name email role');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, message: 'Payment updated', payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update payment' });
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private (super_admin only)
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    await payment.deleteOne();
    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete payment' });
  }
};

// @desc    Get payment summary/stats
// @route   GET /api/payments/stats/summary
// @access  Private (super_admin, manager)
const getPaymentSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalAgg, todayAgg, monthAgg, byMethod] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'Paid', paidAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'Paid', paidAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ])
    ]);

    const pendingCount = await Payment.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      summary: {
        total: totalAgg[0]?.total || 0,
        totalCount: totalAgg[0]?.count || 0,
        today: todayAgg[0]?.total || 0,
        todayCount: todayAgg[0]?.count || 0,
        thisMonth: monthAgg[0]?.total || 0,
        thisMonthCount: monthAgg[0]?.count || 0,
        pendingCount,
        byMethod
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment summary' });
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentSummary
};
