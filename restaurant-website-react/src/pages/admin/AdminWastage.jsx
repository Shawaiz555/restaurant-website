import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trash2,
  Plus,
  RefreshCw,
  X,
  Save,
  AlertTriangle,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  setWastage,
  addWastage,
  deleteWastage,
  setWastageStats,
  setLoading,
} from "../../store/slices/wastageSlice";
import {
  selectAllWastage,
  selectWastageStats,
  selectWastageLoading,
} from "../../store/slices/wastageSlice";
import wastageService from "../../services/wastageService";
import ingredientsService from "../../services/ingredientsService";
import { showNotification } from "../../store/slices/notificationSlice";
import StatsCard from "../../components/admin/common/StatsCard";
import ConfirmModal from "../../components/admin/common/ConfirmModal";

const EMPTY_FORM = {
  ingredientId: "",
  ingredientName: "",
  quantity: 1,
  reason: "Spoilage",
  notes: "",
  date: new Date().toISOString().split("T")[0],
};

const AdminWastage = () => {
  const dispatch = useDispatch();
  const records = useSelector(selectAllWastage);
  const stats = useSelector(selectWastageStats);
  const loading = useSelector(selectWastageLoading);

  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reasonFilter, setReasonFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const formRef = useRef(null);
  const reasons = wastageService.getReasons();

  const loadData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const [wasteRes, statsRes, ingRes] = await Promise.all([
        wastageService.getWastage(),
        wastageService.getWastageStats(),
        ingredientsService.getIngredients(),
      ]);
      dispatch(setWastage(wasteRes.wastage || []));
      dispatch(setWastageStats(statsRes.stats || {}));
      setIngredients(ingRes.ingredients || []);
    } catch {
      dispatch(
        showNotification({
          message: "Failed to load wastage data",
          type: "error",
        }),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = records.filter(
    (r) => reasonFilter === "All" || r.reason === reasonFilter,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [reasonFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  const handleIngredientChange = (ingredientId) => {
    const ing = ingredients.find((i) => (i._id || i.id) === ingredientId);
    setForm({ ...form, ingredientId, ingredientName: ing?.name || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ingredientId) {
      dispatch(
        showNotification({
          message: "Please select an ingredient",
          type: "error",
        }),
      );
      return;
    }
    if (form.quantity <= 0) {
      dispatch(
        showNotification({
          message: "Quantity must be positive",
          type: "error",
        }),
      );
      return;
    }
    setSaving(true);
    try {
      const res = await wastageService.createWastage(form);
      dispatch(addWastage(res.wastage));
      dispatch(
        showNotification({
          message: "Wastage recorded and stock updated",
          type: "success",
        }),
      );
      setShowForm(false);
      setForm(EMPTY_FORM);
      loadData();
    } catch (err) {
      dispatch(
        showNotification({
          message: err.message || "Failed to record wastage",
          type: "error",
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await wastageService.deleteWastage(deleteTarget.id || deleteTarget._id);
      dispatch(deleteWastage(deleteTarget.id || deleteTarget._id));
      dispatch(
        showNotification({
          message: "Wastage record deleted and stock restored",
          type: "success",
        }),
      );
      loadData();
    } catch {
      dispatch(
        showNotification({ message: "Failed to delete record", type: "error" }),
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const formatCurrency = (n) => `Rs. ${(n || 0).toFixed(0)}`;

  const reasonColor = {
    Spoilage: "bg-red-100 text-red-700",
    Spillage: "bg-orange-100 text-orange-700",
    Expired: "bg-yellow-100 text-yellow-700",
    Overcooked: "bg-purple-100 text-purple-700",
    Other: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-primary">
              Wastage
            </h1>
            <p className="text-sm text-dark-gray">
              Record ingredient wastage — stock deducted automatically
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-dark-gray hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                if (formRef.current) {
                  window.scrollTo({ top: formRef.current.offsetTop - 80, behavior: "smooth" });
                }
              }, 100);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Record Wastage
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="Today"
          value={`${stats.today?.count || 0} entries · ${formatCurrency(stats.today?.estimatedCost)}`}
          icon={AlertTriangle}
        />
        <StatsCard
          label="This Week"
          value={`${stats.thisWeek?.count || 0} entries · ${formatCurrency(stats.thisWeek?.estimatedCost)}`}
          icon={AlertTriangle}
        />
        <StatsCard
          label="This Month"
          value={`${stats.thisMonth?.count || 0} entries · ${formatCurrency(stats.thisMonth?.estimatedCost)}`}
          icon={AlertTriangle}
        />
      </div>

      {/* Add Form */}
      {showForm && (
        <div
          ref={formRef}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark">Record Wastage</h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Ingredient *
              </label>
              <select
                value={form.ingredientId}
                onChange={(e) => handleIngredientChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                required
              >
                <option value="">Select ingredient</option>
                {ingredients.map((ing) => (
                  <option key={ing._id || ing.id} value={ing._id || ing.id}>
                    {ing.name} ({ing.unit}) — Stock: {ing.currentStock}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Reason *
              </label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Notes
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes about this wastage"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Record Wastage"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-dark-gray hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...reasons].map((r) => (
          <button
            key={r}
            onClick={() => setReasonFilter(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${reasonFilter === r ? "bg-primary text-white" : "bg-white border border-gray-200 text-dark-gray hover:bg-gray-50"}`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-dark-gray">
            Loading records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-dark-gray">No wastage records found</p>
          </div>
        ) : (
          <>
            {/* Top info bar */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-dark-gray">
                Showing{" "}
                <span className="font-semibold text-dark">
                  {startIndex + 1}–{Math.min(endIndex, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-dark">
                  {filtered.length}
                </span>{" "}
                records
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
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Ingredient
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Quantity
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Reason
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Notes
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Recorded By
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-dark">
                        {formatDate(rec.date)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-dark">
                        {rec.ingredientName}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-dark">
                        {rec.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${reasonColor[rec.reason] || "bg-gray-100 text-gray-600"}`}
                        >
                          {rec.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-gray max-w-[200px] truncate">
                        {rec.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-gray">
                        {rec.createdBy?.name || "Admin"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDeleteTarget(rec)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Wastage Record"
        message="Deleting this record will restore the deducted stock. Are you sure?"
        confirmText="Delete & Restore Stock"
        variant="danger"
      />
    </div>
  );
};

export default AdminWastage;
