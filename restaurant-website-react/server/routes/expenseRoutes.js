const express = require('express');
const router = express.Router();
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly); // All expense routes are admin-only

router.get('/', getExpenses);
router.get('/stats/summary', getExpenseSummary);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
