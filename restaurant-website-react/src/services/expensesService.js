import apiClient from './apiClient';

class ExpensesService {
  async getExpenses(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/expenses?${queryParams}` : '/expenses';
      const response = await apiClient.get(endpoint);
      return response.expenses || [];
    } catch (error) {
      console.error('Get expenses error:', error);
      throw error;
    }
  }

  async addExpense(expenseData) {
    try {
      const response = await apiClient.post('/expenses', expenseData);
      return {
        success: true,
        message: response.message,
        expense: response.expense
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async updateExpense(expenseId, updates) {
    try {
      const response = await apiClient.put(`/expenses/${expenseId}`, updates);
      return {
        success: true,
        message: response.message,
        expense: response.expense
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async deleteExpense(expenseId) {
    try {
      const response = await apiClient.delete(`/expenses/${expenseId}`);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async getSummary() {
    try {
      const response = await apiClient.get('/expenses/stats/summary');
      return response.summary;
    } catch (error) {
      console.error('Get summary error:', error);
      throw error;
    }
  }

  // Utility methods
  getCategories() {
    return ['Ingredients', 'Utilities', 'Salaries', 'Rent', 'Marketing', 'Other'];
  }

  // Client-side helper for filtering by date range
  filterByDateRange(expenses, startDate, endDate) {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && expenseDate < start) return false;
      if (end && expenseDate > end) return false;
      return true;
    });
  }
}

const expensesService = new ExpensesService();
export default expensesService;
