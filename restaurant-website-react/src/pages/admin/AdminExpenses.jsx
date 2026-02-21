import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setExpenses,
  addExpense as addExpenseAction,
  deleteExpense as deleteExpenseAction,
  calculateSummary,
} from "../../store/slices/expensesSlice";
import {
  selectAllExpenses,
  selectExpenseSummary,
  selectExpenseCategories,
} from "../../store/slices/expensesSlice";
import expensesService from "../../services/expensesService";
import { showNotification } from "../../store/slices/notificationSlice";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import StatsCard from "../../components/admin/common/StatsCard";

const AdminExpenses = () => {
  const dispatch = useDispatch();
  const expenses = useSelector(selectAllExpenses);
  const summary = useSelector(selectExpenseSummary);
  const categories = useSelector(selectExpenseCategories);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Ingredients",
    description: "",
    amount: "",
    paymentMethod: "Cash",
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const allExpenses = expensesService.getExpenses();
    dispatch(setExpenses(allExpenses));
    dispatch(calculateSummary());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      dispatch(
        showNotification({
          type: "error",
          message: "Description is required",
        }),
      );
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      dispatch(
        showNotification({
          type: "error",
          message: "Amount must be a positive number",
        }),
      );
      return;
    }

    if (editingExpense) {
      // Update expense
      const result = expensesService.updateExpense(editingExpense.id, formData);
      if (result.success) {
        loadExpenses();
        dispatch(
          showNotification({
            type: "success",
            message: "Expense updated successfully",
          }),
        );
        resetForm();
      } else {
        dispatch(
          showNotification({
            type: "error",
            message: result.message,
          }),
        );
      }
    } else {
      // Add new expense
      const result = expensesService.addExpense(formData);
      if (result.success) {
        dispatch(addExpenseAction(result.expense));
        dispatch(calculateSummary());
        dispatch(
          showNotification({
            type: "success",
            message: "Expense added successfully",
          }),
        );
        resetForm();
      } else {
        dispatch(
          showNotification({
            type: "error",
            message: result.message,
          }),
        );
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const result = expensesService.deleteExpense(expenseToDelete.id);
    if (result.success) {
      dispatch(deleteExpenseAction(expenseToDelete.id));
      dispatch(calculateSummary());
      dispatch(
        showNotification({
          type: "success",
          message: "Expense deleted successfully",
        }),
      );
    } else {
      dispatch(
        showNotification({
          type: "error",
          message: result.message,
        }),
      );
    }
    setShowDeleteConfirm(false);
    setExpenseToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: "Ingredients",
      description: "",
      amount: "",
      paymentMethod: "Cash",
    });
    setEditingExpense(null);
    setShowAddForm(false);
  };

  const filteredExpenses = expenses
    .filter((expense) => {
      if (selectedCategory === "All") return true;
      return expense.category === selectedCategory;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatCurrency = (amount) => {
    return `Rs ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-primary mb-2">
              Expense Tracker
            </h1>
            <p className="text-dark-gray">
              Track and manage restaurant expenses
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
          >
            <span className="text-xl">➕</span>
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          icon="💸"
          label="Today"
          value={formatCurrency(summary.today)}
        />
        <StatsCard
          icon="📅"
          label="This Week"
          value={formatCurrency(summary.thisWeek)}
        />
        <StatsCard
          icon="📆"
          label="This Month"
          value={formatCurrency(summary.thisMonth)}
        />
        <StatsCard
          icon="💰"
          label="All Time"
          value={formatCurrency(summary.total)}
        />
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </h2>
            <button
              onClick={resetForm}
              className="text-dark-gray hover:text-dark transition-colors"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-base"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-dark mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g., Monthly grocery shopping"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Amount (Rs) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-base"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg font-semibold"
              >
                {editingExpense ? "Update Expense" : "Add Expense"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl bg-gray-200 text-dark hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Breakdown */}
      {summary.byCategory && Object.keys(summary.byCategory).length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-dark mb-4">
            Expense by Category (This Month)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(summary.byCategory).map(([category, amount]) => (
              <div
                key={category}
                className="bg-cream-light rounded-xl p-4 text-center"
              >
                <p className="text-xs text-dark-gray mb-1">{category}</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <label className="text-sm font-semibold text-dark whitespace-nowrap">
            Filter by Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-base min-w-[180px]"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-dark mb-2">
              No Expenses Found
            </h3>
            <p className="text-dark-gray mb-4">
              {selectedCategory !== "All"
                ? "No expenses in this category"
                : 'Click "Add Expense" to start tracking'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-cream-light transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-dark whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-gray">
                      {expense.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-primary hover:text-primary-dark text-sm font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-cream-light border-t-2 border-gray-200">
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-sm font-bold text-dark"
                  >
                    Total ({selectedCategory})
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-red-600">
                    -
                    {formatCurrency(
                      filteredExpenses.reduce(
                        (sum, exp) => sum + parseFloat(exp.amount),
                        0,
                      ),
                    )}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense: "${expenseToDelete?.description}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setExpenseToDelete(null);
        }}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminExpenses;
