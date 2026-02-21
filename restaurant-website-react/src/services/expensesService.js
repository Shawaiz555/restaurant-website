class ExpensesService {
  // Get all expenses from localStorage
  getExpenses() {
    try {
      const expenses = localStorage.getItem('expenses');
      return expenses ? JSON.parse(expenses) : [];
    } catch (error) {
      console.error('Error reading expenses:', error);
      return [];
    }
  }

  // Save expenses to localStorage
  saveExpenses(expenses) {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
      return true;
    } catch (error) {
      console.error('Error saving expenses:', error);
      return false;
    }
  }

  // Generate unique ID
  generateId() {
    return 'expense_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Add new expense
  addExpense(expenseData) {
    const { date, category, description, amount, paymentMethod } = expenseData;

    // Validation
    if (!date) {
      return { success: false, message: 'Date is required' };
    }
    if (!category) {
      return { success: false, message: 'Category is required' };
    }
    if (!description || description.trim().length === 0) {
      return { success: false, message: 'Description is required' };
    }
    if (!amount || parseFloat(amount) <= 0) {
      return { success: false, message: 'Amount must be a positive number' };
    }
    if (!paymentMethod) {
      return { success: false, message: 'Payment method is required' };
    }

    const newExpense = {
      id: this.generateId(),
      date,
      category,
      description: description.trim(),
      amount: parseFloat(amount),
      paymentMethod,
      createdAt: new Date().toISOString(),
      createdBy: 'admin', // Could be dynamic based on logged-in admin
    };

    const expenses = this.getExpenses();
    expenses.push(newExpense);
    this.saveExpenses(expenses);

    return {
      success: true,
      message: 'Expense added successfully',
      expense: newExpense,
    };
  }

  // Update expense
  updateExpense(expenseId, updates) {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === expenseId);

    if (index === -1) {
      return { success: false, message: 'Expense not found' };
    }

    expenses[index] = {
      ...expenses[index],
      ...updates,
      amount: parseFloat(updates.amount),
      updatedAt: new Date().toISOString(),
    };

    this.saveExpenses(expenses);

    return {
      success: true,
      message: 'Expense updated successfully',
      expense: expenses[index],
    };
  }

  // Delete expense
  deleteExpense(expenseId) {
    const expenses = this.getExpenses();
    const filtered = expenses.filter((e) => e.id !== expenseId);

    if (filtered.length === expenses.length) {
      return { success: false, message: 'Expense not found' };
    }

    this.saveExpenses(filtered);
    return { success: true, message: 'Expense deleted successfully' };
  }

  // Get expenses by category
  getExpensesByCategory(category) {
    const expenses = this.getExpenses();
    return expenses.filter((e) => e.category === category);
  }

  // Calculate totals by time period
  calculateTotals(dateRange = 'all') {
    const expenses = this.getExpenses();
    const now = new Date();
    let filtered = expenses;

    if (dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = expenses.filter((e) => new Date(e.date) >= today);
    } else if (dateRange === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      filtered = expenses.filter((e) => new Date(e.date) >= weekStart);
    } else if (dateRange === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = expenses.filter((e) => new Date(e.date) >= monthStart);
    } else if (dateRange === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = expenses.filter((e) => new Date(e.date) >= yearStart);
    }

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};

    filtered.forEach((expense) => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = 0;
      }
      byCategory[expense.category] += expense.amount;
    });

    return {
      total,
      count: filtered.length,
      byCategory,
    };
  }

  // Get summary for dashboard
  getSummary() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      today: this.calculateTotals('today'),
      thisWeek: this.calculateTotals('week'),
      thisMonth: this.calculateTotals('month'),
      all: this.calculateTotals('all'),
    };
  }
}

const expensesService = new ExpensesService();
export default expensesService;
