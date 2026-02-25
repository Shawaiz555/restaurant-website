const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (Admin)
const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses'
    });
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private (Admin)
const addExpense = async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      createdBy: req.user._id
    };

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add expense'
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (Admin)
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update expense'
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin)
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense'
    });
  }
};

// @desc    Get expense summary
// @route   GET /api/expenses/stats/summary
// @access  Private (Admin)
const getExpenseSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Total expenses
    const totalAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const total = totalAgg[0]?.total || 0;

    // Today's expenses
    const todayAgg = await Expense.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayTotal = todayAgg[0]?.total || 0;

    // This week's expenses
    const weekAgg = await Expense.aggregate([
      { $match: { date: { $gte: weekAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const weekTotal = weekAgg[0]?.total || 0;

    // This month's expenses
    const monthAgg = await Expense.aggregate([
      { $match: { date: { $gte: monthAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthTotal = monthAgg[0]?.total || 0;

    // By category
    const byCategory = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      summary: {
        total,
        today: todayTotal,
        thisWeek: weekTotal,
        thisMonth: monthTotal,
        byCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense summary'
    });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
};
