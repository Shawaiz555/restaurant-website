import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  expenses: [],
  categories: [
    'Ingredients',
    'Utilities',
    'Salaries',
    'Rent',
    'Marketing',
    'Other',
  ],
  summary: {
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byCategory: {},
  },
  loading: false,
  error: null,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action) => {
      const expenses = (Array.isArray(action.payload) ? action.payload : []).map(e => ({
        ...e,
        id: e.id || e._id // Ensure every expense has an id property
      }));
      state.expenses = expenses;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addExpense: (state, action) => {
      const expense = { ...action.payload, id: action.payload.id || action.payload._id };
      state.expenses.push(expense);
    },
    updateExpense: (state, action) => {
      const payload = action.payload;
      const id = payload.id || payload._id;
      const index = state.expenses.findIndex((e) => (e.id || e._id) === id);
      if (index !== -1) {
        state.expenses[index] = { ...state.expenses[index], ...payload, id };
      }
    },
    deleteExpense: (state, action) => {
      const id = action.payload;
      state.expenses = state.expenses.filter((e) => (e.id || e._id) !== id);
    },
    calculateSummary: (state) => {
      if (!Array.isArray(state.expenses)) {
        state.expenses = [];
      }
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      let total = 0;
      let todayTotal = 0;
      let weekTotal = 0;
      let monthTotal = 0;
      const byCategory = {};

      state.expenses.forEach((expense) => {
        const amount = parseFloat(expense.amount) || 0;
        const expenseDate = new Date(expense.date);

        total += amount;

        if (expenseDate >= today) {
          todayTotal += amount;
        }
        if (expenseDate >= weekStart) {
          weekTotal += amount;
        }
        if (expenseDate >= monthStart) {
          monthTotal += amount;
        }

        if (!byCategory[expense.category]) {
          byCategory[expense.category] = 0;
        }
        byCategory[expense.category] += amount;
      });

      state.summary = {
        total,
        today: todayTotal,
        thisWeek: weekTotal,
        thisMonth: monthTotal,
        byCategory,
      };
    },
  },
});

export const {
  setExpenses,
  setLoading,
  setError,
  addExpense,
  updateExpense,
  deleteExpense,
  calculateSummary,
} = expensesSlice.actions;

// Selectors
export const selectAllExpenses = (state) => state.expenses.expenses;
export const selectExpenseCategories = (state) => state.expenses.categories;
export const selectExpenseSummary = (state) => state.expenses.summary;
export const selectLoading = (state) => state.expenses.loading;

export default expensesSlice.reducer;
