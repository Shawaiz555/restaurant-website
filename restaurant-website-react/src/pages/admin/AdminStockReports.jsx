import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  Package,
  ShoppingCart,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import ingredientsService from "../../services/ingredientsService";
import purchasesService from "../../services/purchasesService";
import wastageService from "../../services/wastageService";
import { useDispatch } from "react-redux";
import { showNotification } from "../../store/slices/notificationSlice";
import StatsCard from "../../components/admin/common/StatsCard";

const AdminStockReports = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [purchaseStats, setPurchaseStats] = useState({});
  const [wastageStats, setWastageStats] = useState({});
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ingRes, purchRes, wasteRes] = await Promise.all([
        ingredientsService.getIngredients(),
        purchasesService.getPurchaseStats(),
        wastageService.getWastageStats(),
      ]);
      setIngredients(ingRes.ingredients || []);
      setPurchaseStats(purchRes.stats || {});
      setWastageStats(wasteRes.stats || {});
    } catch {
      dispatch(
        showNotification({
          message: "Failed to load report data",
          type: "error",
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sorted = [...ingredients].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "stock") return a.currentStock - b.currentStock;
    if (sortBy === "status") {
      const getLevel = (i) =>
        i.currentStock === 0 ? 0 : i.currentStock <= i.minimumStock ? 1 : 2;
      return getLevel(a) - getLevel(b);
    }
    return 0;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = sorted.slice(startIndex, endIndex);

  const total = ingredients.length;
  const outOfStock = ingredients.filter((i) => i.currentStock === 0).length;
  const lowStock = ingredients.filter(
    (i) => i.currentStock > 0 && i.currentStock <= i.minimumStock,
  ).length;
  const healthy = total - outOfStock - lowStock;

  const formatCurrency = (n) => `Rs. ${(n || 0).toLocaleString()}`;

  const getStatusInfo = (ing) => {
    if (ing.currentStock === 0)
      return { label: "Out of Stock", classes: "bg-red-100 text-red-700" };
    if (ing.currentStock <= ing.minimumStock)
      return { label: "Low Stock", classes: "bg-amber-100 text-amber-700" };
    return { label: "In Stock", classes: "bg-green-100 text-green-700" };
  };

  const stockPercent = (ing) => {
    if (ing.minimumStock === 0) return 100;
    return Math.min(100, (ing.currentStock / (ing.minimumStock * 3)) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-primary">
              Stock Reports
            </h1>
            <p className="text-sm text-dark-gray">
              Overview of current stock levels and inventory health
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-dark-gray hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Ingredients" value={total} icon={Package} />
        <StatsCard label="In Stock" value={healthy} icon={Package} />
        <StatsCard label="Low Stock" value={lowStock} icon={AlertTriangle} />
        <StatsCard
          label="Out of Stock"
          value={outOfStock}
          icon={AlertTriangle}
        />
      </div>

      {/* Purchase & Wastage Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-6 h-6 text-dark" />
            <h3 className="font-semibold text-lg lg:text-2xl text-dark">
              Purchase Summary
            </h3>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-dark-gray">Total Purchases</dt>
              <dd className="font-semibold text-dark">
                {purchaseStats.totalPurchases || 0}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-dark-gray">This Month (count)</dt>
              <dd className="font-semibold text-dark">
                {purchaseStats.thisMonthCount || 0}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-dark-gray">This Month (cost)</dt>
              <dd className="font-semibold text-primary">
                {formatCurrency(purchaseStats.thisMonthTotal)}
              </dd>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
              <dt className="text-dark-gray font-medium">All Time Spend</dt>
              <dd className="font-bold text-dark">
                {formatCurrency(purchaseStats.allTimeTotal)}
              </dd>
            </div>
          </dl>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-6 h-6 text-dark" />
            <h3 className="font-semibold text-lg lg:text-2xl text-dark">
              Wastage Summary
            </h3>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-dark-gray">Today</dt>
              <dd className="font-semibold text-dark">
                {wastageStats.today?.count || 0} entries ·{" "}
                {formatCurrency(wastageStats.today?.estimatedCost)}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-dark-gray">This Week</dt>
              <dd className="font-semibold text-dark">
                {wastageStats.thisWeek?.count || 0} entries ·{" "}
                {formatCurrency(wastageStats.thisWeek?.estimatedCost)}
              </dd>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
              <dt className="text-dark-gray font-medium">This Month</dt>
              <dd className="font-bold text-red-600">
                {wastageStats.thisMonth?.count || 0} entries ·{" "}
                {formatCurrency(wastageStats.thisMonth?.estimatedCost)}
              </dd>
            </div>
          </dl>
          {wastageStats.byReason && wastageStats.byReason.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-dark-gray uppercase tracking-wide mb-2">
                By Reason
              </p>
              <div className="flex flex-wrap gap-2">
                {wastageStats.byReason.map((r) => (
                  <span
                    key={r._id}
                    className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-dark-gray"
                  >
                    {r._id}: {r.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingredient Stock Levels */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg lg:text-2xl text-dark">
            Current Stock Levels
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock (Low First)</option>
            <option value="status">Sort by Status (Critical First)</option>
          </select>
        </div>
        {loading ? (
          <div className="p-12 text-center text-dark-gray">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center text-dark-gray">
            No ingredients found. Add ingredients first.
          </div>
        ) : (
          <>
            {/* Top info bar */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-dark-gray">
                Showing{" "}
                <span className="font-semibold text-dark">
                  {startIndex + 1}–{Math.min(endIndex, sorted.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-dark">{sorted.length}</span>{" "}
                ingredients
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-dark-gray font-medium whitespace-nowrap">
                  Items per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white font-medium"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Ingredient
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Category
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Current
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Minimum
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Unit
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide w-40">
                      Stock Level
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((ing) => {
                    const status = getStatusInfo(ing);
                    const pct = stockPercent(ing);
                    const barColor =
                      ing.currentStock === 0
                        ? "bg-red-400"
                        : ing.currentStock <= ing.minimumStock
                          ? "bg-amber-400"
                          : "bg-green-400";
                    return (
                      <tr
                        key={ing._id || ing.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-dark text-sm">
                          {ing.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark-gray">
                          {ing.category}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-dark">
                          {ing.currentStock}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-dark-gray">
                          {ing.minimumStock}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-dark-gray">
                          {ing.unit}
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${barColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.classes}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm font-medium text-dark">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`px-2.5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-primary border border-primary hover:bg-primary hover:text-white"}`}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-primary border border-primary hover:bg-primary hover:text-white"}`}
                  >
                    ← Prev
                  </button>
                  <div className="hidden sm:flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${currentPage === page ? "bg-gradient-to-r from-primary to-primary-dark text-white" : "bg-white text-primary border border-gray-200 hover:border-primary hover:bg-primary/10"}`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-1 text-dark-gray font-bold"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-primary border border-primary hover:bg-primary hover:text-white"}`}
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-2.5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-primary border border-primary hover:bg-primary hover:text-white"}`}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminStockReports;
