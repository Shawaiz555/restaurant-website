import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  TrendingDown,
  Package,
  ShoppingCart,
  ChevronsLeft,
  ChevronsRight,
  CupSoda,
} from "lucide-react";
import ingredientsService from "../../services/ingredientsService";
import purchasesService from "../../services/purchasesService";
import wastageService from "../../services/wastageService";
import addonStockService from "../../services/addonStockService";
import { useDispatch } from "react-redux";
import { showNotification } from "../../store/slices/notificationSlice";

const TYPE_COLORS = {
  Drink: "bg-blue-100 text-blue-700",
  Dessert: "bg-pink-100 text-pink-700",
  Extra: "bg-purple-100 text-purple-700",
};

const AdminStockReports = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [addonStocks, setAddonStocks] = useState([]);
  const [purchaseStats, setPurchaseStats] = useState({});
  const [wastageStats, setWastageStats] = useState({});

  // Unified table state
  const [activeTab, setActiveTab] = useState("all"); // "all" | "ingredients" | "addons"
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ingRes, purchRes, wasteRes, addonRes] = await Promise.all([
        ingredientsService.getIngredients(),
        purchasesService.getPurchaseStats(),
        wastageService.getWastageStats(),
        addonStockService.getAddonStocks(),
      ]);
      setIngredients(ingRes.ingredients || []);
      setPurchaseStats(purchRes.stats || {});
      setWastageStats(wasteRes.stats || {});
      setAddonStocks(addonRes.addonStocks || []);
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

  // Reset page when tab/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortBy]);

  // Ingredient stats
  const ingTotal = ingredients.length;
  const ingOut = ingredients.filter((i) => i.currentStock === 0).length;
  const ingLow = ingredients.filter(
    (i) => i.currentStock > 0 && i.currentStock <= i.minimumStock,
  ).length;
  const ingHealthy = ingTotal - ingOut - ingLow;

  // Addon stats
  const addTotal = addonStocks.length;
  const addOut = addonStocks.filter((a) => a.currentStock === 0).length;
  const addLow = addonStocks.filter(
    (a) => a.currentStock > 0 && a.currentStock <= a.minimumStock,
  ).length;
  const addHealthy = addTotal - addOut - addLow;

  // Normalise rows so both datasets have the same shape
  const ingRows = ingredients.map((i) => ({
    _id: i._id || i.id,
    name: i.name,
    kind: "Ingredient",
    kindColor: "bg-gray-100 text-gray-700",
    subLabel: i.category || "—",
    currentStock: i.currentStock,
    minimumStock: i.minimumStock,
    unit: i.unit,
    costPerUnit: i.costPerUnit || null,
  }));

  const addRows = addonStocks.map((a) => ({
    _id: a._id,
    name: a.name,
    kind: a.addonType,
    kindColor: TYPE_COLORS[a.addonType] || "bg-gray-100 text-gray-700",
    subLabel: a.addonType,
    currentStock: a.currentStock,
    minimumStock: a.minimumStock,
    unit: a.unit,
    costPerUnit: a.costPerUnit || null,
  }));

  const allRows =
    activeTab === "ingredients"
      ? ingRows
      : activeTab === "addons"
        ? addRows
        : [...ingRows, ...addRows];

  const sorted = [...allRows].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "stock") return a.currentStock - b.currentStock;
    if (sortBy === "status") {
      const lv = (x) =>
        x.currentStock === 0 ? 0 : x.currentStock <= x.minimumStock ? 1 : 2;
      return lv(a) - lv(b);
    }
    if (sortBy === "type") return a.kind.localeCompare(b.kind);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (n) => `Rs. ${(n || 0).toLocaleString()}`;

  const getStatusInfo = (row) => {
    if (row.currentStock === 0)
      return { label: "Out of Stock", classes: "bg-red-100 text-red-700" };
    if (row.currentStock <= row.minimumStock)
      return { label: "Low Stock", classes: "bg-amber-100 text-amber-700" };
    return { label: "In Stock", classes: "bg-green-100 text-green-700" };
  };

  const stockPercent = (row) => {
    if (row.minimumStock === 0) return 100;
    return Math.min(100, (row.currentStock / (row.minimumStock * 3)) * 100);
  };

  const TABS = [
    { key: "all", label: `All (${ingTotal + addTotal})` },
    { key: "ingredients", label: `Ingredients (${ingTotal})` },
    { key: "addons", label: `Addons (${addTotal})` },
  ];

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
              Overview of ingredients & addon stock health
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

      {/* Unified summary cards — 4 ingredient + 4 addon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Ingredient block */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-7 h-7 text-primary" />
            <span className="font-semibold text-lg lg:text-xl text-dark">
              Ingredients
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-dark">{ingTotal}</p>
              <p className="text-xs text-dark-gray mt-0.5">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{ingHealthy}</p>
              <p className="text-xs text-dark-gray mt-0.5">In Stock</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{ingLow}</p>
              <p className="text-xs text-dark-gray mt-0.5">Low Stock</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{ingOut}</p>
              <p className="text-xs text-dark-gray mt-0.5">Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Addon block */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <CupSoda className="w-7 h-7 text-primary" />
            <span className="font-semibold text-lg lg:text-xl text-dark">
              Addons
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-dark">{addTotal}</p>
              <p className="text-xs text-dark-gray mt-0.5">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{addHealthy}</p>
              <p className="text-xs text-dark-gray mt-0.5">In Stock</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{addLow}</p>
              <p className="text-xs text-dark-gray mt-0.5">Low Stock</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{addOut}</p>
              <p className="text-xs text-dark-gray mt-0.5">Out of Stock</p>
            </div>
          </div>
        </div>
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

      {/* Unified Stock Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header with tabs + sort */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-primary shadow-sm"
                    : "text-dark-gray hover:text-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
            <option value="stock">Sort by Stock (Low First)</option>
            <option value="status">Sort by Status (Critical First)</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-dark-gray">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center text-dark-gray">
            No stock records found.
          </div>
        ) : (
          <>
            {/* Info bar */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-dark-gray">
                Showing{" "}
                <span className="font-semibold text-dark">
                  {startIndex + 1}–
                  {Math.min(startIndex + itemsPerPage, sorted.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-dark">{sorted.length}</span>{" "}
                items
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
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Type
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
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Cost/Unit
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide w-36">
                      Level
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((row) => {
                    const status = getStatusInfo(row);
                    const pct = stockPercent(row);
                    const barColor =
                      row.currentStock === 0
                        ? "bg-red-400"
                        : row.currentStock <= row.minimumStock
                          ? "bg-amber-400"
                          : "bg-green-400";
                    return (
                      <tr
                        key={row._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-dark text-sm">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.kindColor}`}
                          >
                            {row.kind}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-dark">
                          {row.currentStock}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-dark-gray">
                          {row.minimumStock}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-dark-gray">
                          {row.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-dark-gray">
                          {row.costPerUnit != null
                            ? `Rs. ${row.costPerUnit}`
                            : "—"}
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

            {/* Pagination */}
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
