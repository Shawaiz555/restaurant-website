import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CupSoda,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  RefreshCw,
  X,
  Save,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  setAddonStocks,
  addAddonStock,
  updateAddonStock,
  deleteAddonStock,
  setAddonStockStats,
  setLoading,
} from "../../store/slices/addonStockSlice";
import {
  selectAllAddonStocks,
  selectAddonStockStats,
  selectAddonStockLoading,
} from "../../store/slices/addonStockSlice";
import addonStockService from "../../services/addonStockService";
import { showNotification } from "../../store/slices/notificationSlice";
import StatsCard from "../../components/admin/common/StatsCard";
import ConfirmModal from "../../components/admin/common/ConfirmModal";

const EMPTY_FORM = {
  name: "",
  addonType: "Drink",
  unit: "pcs",
  currentStock: 0,
  minimumStock: 0,
  costPerUnit: 0,
};

const AdminAddonStock = () => {
  const dispatch = useDispatch();
  const addonStocks = useSelector(selectAllAddonStocks);
  const stats = useSelector(selectAddonStockStats);
  const loading = useSelector(selectAddonStockLoading);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const addonTypes = addonStockService.getAddonTypes();
  const units = addonStockService.getUnits();

  const loadData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const [res, statsRes] = await Promise.all([
        addonStockService.getAddonStocks(),
        addonStockService.getAddonStockStats(),
      ]);
      dispatch(setAddonStocks(res.addonStocks || []));
      dispatch(setAddonStockStats(statsRes.stats || {}));
    } catch {
      dispatch(
        showNotification({ message: "Failed to load addon stocks", type: "error" })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = addonStocks.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || a.addonType === typeFilter;
    return matchSearch && matchType;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  const lowStockItems = addonStocks.filter(
    (a) => a.currentStock <= a.minimumStock && a.minimumStock > 0
  );

  const getStockLabel = (a) => {
    if (a.currentStock === 0) return "Out of Stock";
    if (a.currentStock <= a.minimumStock) return "Low Stock";
    return "In Stock";
  };

  const scrollToForm = () => {
    setTimeout(() => {
      if (formRef.current) {
        window.scrollTo({ top: formRef.current.offsetTop - 80, behavior: "smooth" });
      }
    }, 100);
  };

  const handleOpenAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    scrollToForm();
  };

  const handleOpenEdit = (a) => {
    setForm({
      name: a.name,
      addonType: a.addonType,
      unit: a.unit,
      currentStock: a.currentStock,
      minimumStock: a.minimumStock,
      costPerUnit: a.costPerUnit,
    });
    setEditingId(a.id || a._id);
    setShowForm(true);
    scrollToForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      dispatch(showNotification({ message: "Addon name is required", type: "error" }));
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await addonStockService.updateAddonStock(editingId, form);
        dispatch(updateAddonStock(res.addonStock));
        dispatch(showNotification({ message: "Addon stock updated", type: "success" }));
      } else {
        const res = await addonStockService.createAddonStock(form);
        dispatch(addAddonStock(res.addonStock));
        dispatch(showNotification({ message: "Addon stock added", type: "success" }));
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadData();
    } catch (err) {
      dispatch(showNotification({ message: err.message || "Save failed", type: "error" }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await addonStockService.deleteAddonStock(deleteTarget.id || deleteTarget._id);
      dispatch(deleteAddonStock(deleteTarget.id || deleteTarget._id));
      dispatch(showNotification({ message: "Addon stock deleted", type: "success" }));
      loadData();
    } catch {
      dispatch(showNotification({ message: "Failed to delete addon stock", type: "error" }));
    } finally {
      setDeleteTarget(null);
    }
  };

  const typeColor = {
    Drink: "bg-blue-100 text-blue-800 border-blue-200",
    Dessert: "bg-pink-100 text-pink-800 border-pink-200",
    Extra: "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
            <CupSoda className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-primary">
              Addon Stock
            </h1>
            <p className="text-sm text-dark-gray">
              Track stock levels for drinks, desserts and extras
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
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Addon
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Addons" value={stats.total || 0} icon={CupSoda} />
        <StatsCard label="Low Stock" value={stats.lowStock || 0} icon={AlertTriangle} />
        <StatsCard label="Out of Stock" value={stats.outOfStock || 0} icon={AlertTriangle} />
        <StatsCard label="Types" value={addonTypes.length} icon={CupSoda} />
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Low Stock Alert</p>
            <p className="text-sm text-amber-700">
              {lowStockItems.map((a) => a.name).join(", ")}{" "}
              {lowStockItems.length === 1 ? "is" : "are"} running low. Consider
              restocking.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search addons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
        >
          <option value="All">All Types</option>
          {addonTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div
          ref={formRef}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark">
              {editingId ? "Edit Addon Stock" : "Add Addon Stock"}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
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
                Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mango Lassi"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Type *
              </label>
              <select
                value={form.addonType}
                onChange={(e) => setForm({ ...form, addonType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
              >
                {addonTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Unit *
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Current Stock
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.currentStock}
                onChange={(e) =>
                  setForm({ ...form, currentStock: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Minimum Stock (Alert Level)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.minimumStock}
                onChange={(e) =>
                  setForm({ ...form, minimumStock: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">
                Cost per Unit (Rs.)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.costPerUnit}
                onChange={(e) =>
                  setForm({ ...form, costPerUnit: parseFloat(e.target.value) || 0 })
                }
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
                {saving ? "Saving..." : editingId ? "Update Addon" : "Add Addon"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-dark-gray hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-dark-gray">Loading addon stocks...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CupSoda className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-dark-gray">No addon stocks found</p>
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
                <span className="font-semibold text-dark">{filtered.length}</span>{" "}
                addons
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-dark-gray font-medium whitespace-nowrap">
                  Items per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">Unit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">Current Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">Min Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">Cost/Unit</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-dark text-sm">{a.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${typeColor[a.addonType] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                          {a.addonType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-gray">{a.unit}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-dark">{a.currentStock}</td>
                      <td className="px-4 py-3 text-right text-sm text-dark-gray">{a.minimumStock}</td>
                      <td className="px-4 py-3 text-right text-sm text-dark-gray">Rs. {a.costPerUnit}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            a.currentStock === 0
                              ? "bg-red-100 text-red-800 border-red-200"
                              : a.currentStock <= a.minimumStock
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }`}
                        >
                          {getStockLabel(a)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(a)}
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
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-1 text-dark-gray font-bold">...</span>
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

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Addon Stock"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminAddonStock;
