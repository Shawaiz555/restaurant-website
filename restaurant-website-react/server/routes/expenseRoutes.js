const express = require('express');
const router = express.Router();
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

// Expenses: super_admin and manager only
router.use(protect, authorize('super_admin', 'manager'));

router.get('/', getExpenses);
router.get('/stats/summary', getExpenseSummary);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
