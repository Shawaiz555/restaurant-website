import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setExpenses,
  addExpense as addExpenseAction,
  deleteExpense as deleteExpenseAction,
  calculateSummary,
  updateExpense as updateExpenseAction,
} from "../../store/slices/expensesSlice";
import {
  selectAllExpenses,
  selectExpenseSummary,
  selectExpenseCategories,
} from "../../store/slices/expensesSlice";
import expensesService from "../../services/expensesService";
import { showNotification } from "../../store/slices/notificationSlice";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import PrintButton from "../../components/admin/common/PrintButton";
import { printTable, getSelectionSummary } from "../../utils/printUtils";
import {
  Plus,
  DollarSign,
  Calendar,
  CalendarDays,
  TrendingDown,
  Tag,
  X,
  Zap,
  Users,
  Home,
  Megaphone,
  MoreHorizontal,
  ShoppingCart,
  Wrench,
} from "lucide-react";

const PRINT_COLUMNS = [
  { header: "#", render: (_, i) => i + 1 },
  {
    header: "Date",
    render: (r) =>
      new Date(r.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
  { header: "Category", render: (r) => r.category },
  { header: "Description", render: (r) => r.description },
  {
    header: "Amount",
    render: (r) => `Rs ${parseFloat(r.amount || 0).toFixed(2)}`,
  },
  { header: "Payment Method", render: (r) => r.paymentMethod },
];

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
  const [selectedIds, setSelectedIds] = useState([]);

  // Ref for expense form section
  const expenseFormRef = useRef(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Utilities",
    description: "",
    amount: "",
    paymentMethod: "Cash",
  });

  const loadExpenses = useCallback(async () => {
    try {
      const allExpenses = await expensesService.getExpenses();
      dispatch(setExpenses(allExpenses));
      dispatch(calculateSummary());
    } catch (error) {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to load expenses",
        }),
      );
    }
  }, [dispatch]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      const result = await expensesService.updateExpense(
        editingExpense._id || editingExpense.id,
        formData,
      );
      if (result.success) {
        dispatch(updateExpenseAction(result.expense)); // Dispatch update action
        dispatch(calculateSummary());
        dispatch(
          showNotification({
            type: "success",
            message: "Expense updated successfully",
          }),
        );
        resetForm();
        loadExpenses(); // Refresh from server
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
      const result = await expensesService.addExpense(formData);
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
        loadExpenses(); // Refresh from server
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

    // Scroll to form after it's shown
    setTimeout(() => {
      if (expenseFormRef.current) {
        const element = expenseFormRef.current;
        const elementTop = element.offsetTop;
        const offset = 80; // Offset for better visibility (accounts for any fixed headers)

        window.scrollTo({
          top: elementTop - offset,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    const result = await expensesService.deleteExpense(
      expenseToDelete._id || expenseToDelete.id,
    );
    if (result.success) {
      dispatch(deleteExpenseAction(expenseToDelete._id || expenseToDelete.id));
      dispatch(calculateSummary());
      dispatch(
        showNotification({
          type: "success",
          message: "Expense deleted successfully",
        }),
      );
      loadExpenses(); // Refresh from server
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
      category: "Utilities",
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

  const buildSubtitle = () => {
    const parts = [];
    if (selectedCategory !== "All") parts.push(`Category: ${selectedCategory}`);
    if (selectedIds.length > 0)
      parts.push(`${selectedIds.length} rows selected`);
    return parts.length > 0 ? parts.join(" · ") : "All records";
  };

  const handlePrint = (mode = 'print') => {
    const rowsToPrint = getSelectionSummary(
      selectedIds,
      filteredExpenses,
      "_id",
    );
    printTable({
      title: "Expenses Report",
      subtitle: buildSubtitle(),
      columns: PRINT_COLUMNS,
      rows: rowsToPrint,
      mode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-sans font-bold text-primary mb-2">
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

              // Scroll to form after it's shown
              setTimeout(() => {
                if (expenseFormRef.current) {
                  const element = expenseFormRef.current;
                  const elementTop = element.offsetTop;
                  const offset = 80; // Offset for better visibility (accounts for any fixed headers)

                  window.scrollTo({
                    top: elementTop - offset,
                    behavior: "smooth",
                  });
                }
              }, 150);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary via-primary-light to-primary/80 rounded-xl flex items-center justify-center mb-3">
            <TrendingDown className="w-9 h-9 text-white" />
          </div>
          <p className="text-xs text-dark-gray font-semibold uppercase tracking-wide">
            Today
          </p>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(summary?.today || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary via-primary-light to-primary/80 rounded-xl flex items-center justify-center mb-3">
            <Calendar className="w-9 h-9 text-white" />
          </div>
          <p className="text-xs text-dark-gray font-semibold uppercase tracking-wide">
            This Week
          </p>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(summary?.thisWeek || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary via-primary-light to-primary/80 rounded-xl flex items-center justify-center mb-3">
            <CalendarDays className="w-9 h-9 text-white" />
          </div>
          <p className="text-xs text-dark-gray font-semibold uppercase tracking-wide">
            This Month
          </p>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(summary?.thisMonth || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary via-primary-light to-primary/80 rounded-xl flex items-center justify-center mb-3">
            <DollarSign className="w-9 h-9 text-white" />
          </div>
          <p className="text-xs text-dark-gray font-semibold uppercase tracking-wide">
            All Time
          </p>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(summary?.total || 0)}
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div
          ref={expenseFormRef}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </h2>
            <button
              onClick={resetForm}
              className="text-dark-gray hover:text-dark transition-colors"
            >
              <X className="w-5 h-5" />
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

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="text-sm font-semibold text-dark whitespace-nowrap">
              Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedIds([]);
              }}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-md min-w-[180px]"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <span className="text-sm text-primary font-semibold">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {summary.byCategory && Object.keys(summary.byCategory).length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-dark">
                Expense by Category
              </h2>
              <p className="text-sm text-dark-gray mt-0.5">
                All-time breakdown per category
              </p>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-xl">
              <span className="text-sm font-bold text-primary">
                {Object.keys(summary.byCategory).length} categories
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Object.entries(summary.byCategory).map(([category, amount]) => {
              const totalAll = Object.values(summary.byCategory).reduce(
                (s, v) => s + v,
                0,
              );
              const pct =
                totalAll > 0 ? Math.round((amount / totalAll) * 100) : 0;
              const count = expenses.filter(
                (e) => e.category === category,
              ).length;
              const categoryConfig = {
                Utilities: {
                  icon: Zap,
                  gradient: "from-yellow-400 to-orange-400",
                  bg: "bg-yellow-50",
                  text: "text-yellow-600",
                  bar: "bg-yellow-400",
                },
                Salaries: {
                  icon: Users,
                  gradient: "from-blue-400 to-indigo-500",
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                  bar: "bg-blue-400",
                },
                Rent: {
                  icon: Home,
                  gradient: "from-purple-400 to-pink-500",
                  bg: "bg-purple-50",
                  text: "text-purple-600",
                  bar: "bg-purple-400",
                },
                Marketing: {
                  icon: Megaphone,
                  gradient: "from-green-400 to-teal-500",
                  bg: "bg-green-50",
                  text: "text-green-600",
                  bar: "bg-green-400",
                },
                Supplies: {
                  icon: ShoppingCart,
                  gradient: "from-cyan-400 to-blue-400",
                  bg: "bg-cyan-50",
                  text: "text-cyan-600",
                  bar: "bg-cyan-400",
                },
                Maintenance: {
                  icon: Wrench,
                  gradient: "from-rose-400 to-red-500",
                  bg: "bg-rose-50",
                  text: "text-rose-600",
                  bar: "bg-rose-400",
                },
                Other: {
                  icon: MoreHorizontal,
                  gradient: "from-gray-400 to-slate-500",
                  bg: "bg-gray-50",
                  text: "text-gray-600",
                  bar: "bg-gray-400",
                },
              };
              const cfg = categoryConfig[category] || categoryConfig.Other;
              const Icon = cfg.icon;
              return (
                <div
                  key={category}
                  className="group relative bg-white border-2 border-gray-100 hover:border-primary/20 rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center mb-2">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Category name & count */}
                  <p className="text-sm text-center font-semibold text-dark-gray mb-0.5">
                    {category}
                  </p>
                  <p className="text-xs text-center text-gray-400 mb-1">
                    {count} expense{count !== 1 ? "s" : ""}
                  </p>

                  {/* Amount */}
                  <p className="text-lg text-center font-bold text-dark mb-1">
                    {formatCurrency(amount)}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div
                      className={`h-1.5 rounded-full ${cfg.bar} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p
                    className={`text-xs text-center font-semibold ${cfg.text}`}
                  >
                    {pct}% of total
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4 flex justify-center">
              <Tag className="w-16 h-16 text-gray-400" />
            </div>
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
          <>
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-sm text-dark-gray">
                <span className="font-semibold text-dark">
                  {filteredExpenses.length}
                </span>{" "}
                expense{filteredExpenses.length !== 1 ? "s" : ""}
                {selectedIds.length > 0 && (
                  <span className="ml-2 text-primary font-semibold">
                    · {selectedIds.length} selected
                  </span>
                )}
              </p>
              <PrintButton
                selectedCount={selectedIds.length}
                totalCount={filteredExpenses.length}
                onPrint={handlePrint}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-center w-10">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                        checked={
                          filteredExpenses.length > 0 &&
                          filteredExpenses.every((r) =>
                            selectedIds.includes(r._id || r.id),
                          )
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(
                              filteredExpenses.map((r) => r._id || r.id),
                            );
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        title="Select/deselect all"
                      />
                    </th>
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
                      key={expense._id || expense.id}
                      className="hover:bg-cream-light transition-colors"
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-primary cursor-pointer"
                          checked={selectedIds.includes(
                            expense._id || expense.id,
                          )}
                          onChange={(e) => {
                            const id = expense._id || expense.id;
                            setSelectedIds((prev) =>
                              e.target.checked
                                ? [...prev, id]
                                : prev.filter((x) => x !== id),
                            );
                          }}
                        />
                      </td>
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
                            className="text-white bg-primary px-7 py-1 rounded-xl hover:bg-primary/80 text-sm font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(expense)}
                            className="text-white bg-red-600 px-7 py-1 rounded-xl hover:bg-red-800 text-sm font-semibold transition-colors"
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
                      colSpan="4"
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
          </>
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
