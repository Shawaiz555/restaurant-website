import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingCart,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  PackagePlus,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  setPurchases,
  addPurchase,
  deletePurchase,
  setPurchaseStats,
  setLoading,
} from "../../store/slices/purchasesSlice";
import {
  selectAllPurchases,
  selectPurchaseStats,
  selectPurchasesLoading,
} from "../../store/slices/purchasesSlice";
import purchasesService from "../../services/purchasesService";
import suppliersService from "../../services/suppliersService";
import ingredientsService from "../../services/ingredientsService";
import { showNotification } from "../../store/slices/notificationSlice";
import StatsCard from "../../components/admin/common/StatsCard";
import ConfirmModal from "../../components/admin/common/ConfirmModal";

const EMPTY_ITEM = {
  ingredientId: "",
  ingredientName: "",
  unit: "",
  quantity: 1,
  pricePerUnit: 0,
};

const AdminPurchases = () => {
  const dispatch = useDispatch();
  const purchases = useSelector(selectAllPurchases);
  const stats = useSelector(selectPurchaseStats);
  const loading = useSelector(selectPurchasesLoading);

  const [suppliers, setSuppliers] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    supplierId: "",
    supplierName: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
    items: [{ ...EMPTY_ITEM }],
  });

  const loadData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const [purchRes, statsRes, supRes, ingRes] = await Promise.all([
        purchasesService.getPurchases(),
        purchasesService.getPurchaseStats(),
        suppliersService.getSuppliers({ active: true }),
        ingredientsService.getIngredients(),
      ]);
      dispatch(setPurchases(purchRes.purchases || []));
      dispatch(setPurchaseStats(statsRes.stats || {}));
      setSuppliers(supRes.suppliers || []);
      setIngredients(ingRes.ingredients || []);
    } catch {
      dispatch(
        showNotification({ message: "Failed to load data", type: "error" }),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSupplierChange = (supplierId) => {
    const sup = suppliers.find((s) => (s._id || s.id) === supplierId);
    setForm({ ...form, supplierId, supplierName: sup?.name || "" });
  };

  const handleItemChange = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    if (field === "ingredientId") {
      const ing = ingredients.find((i) => (i._id || i.id) === value);
      if (ing) {
        items[idx].ingredientName = ing.name;
        items[idx].unit = ing.unit;
      }
    }
    setForm({ ...form, items });
  };

  const addItem = () =>
    setForm({ ...form, items: [...form.items, { ...EMPTY_ITEM }] });
  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const totalCost = form.items.reduce(
    (sum, item) => sum + (item.quantity * item.pricePerUnit || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId) {
      dispatch(
        showNotification({
          message: "Please select a supplier",
          type: "error",
        }),
      );
      return;
    }
    const validItems = form.items.filter(
      (i) => i.ingredientId && i.quantity > 0,
    );
    if (validItems.length === 0) {
      dispatch(
        showNotification({
          message: "Add at least one ingredient item",
          type: "error",
        }),
      );
      return;
    }
    setSaving(true);
    try {
      const res = await purchasesService.createPurchase({
        ...form,
        items: validItems,
      });
      dispatch(addPurchase(res.purchase));
      dispatch(
        showNotification({
          message: "Purchase recorded and stock updated!",
          type: "success",
        }),
      );
      setShowForm(false);
      setForm({
        supplierId: "",
        supplierName: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        notes: "",
        items: [{ ...EMPTY_ITEM }],
      });
      loadData();
    } catch (err) {
      dispatch(
        showNotification({
          message: err.message || "Failed to record purchase",
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
      await purchasesService.deletePurchase(
        deleteTarget.id || deleteTarget._id,
      );
      dispatch(deletePurchase(deleteTarget.id || deleteTarget._id));
      dispatch(
        showNotification({
          message: "Purchase deleted and stock reversed",
          type: "success",
        }),
      );
      loadData();
    } catch {
      dispatch(
        showNotification({
          message: "Failed to delete purchase",
          type: "error",
        }),
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = purchases.slice(startIndex, endIndex);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const formatCurrency = (n) => `Rs. ${(n || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-primary">
              Purchases
            </h1>
            <p className="text-sm text-dark-gray">
              Record ingredient purchases — stock updates automatically
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
            Record Purchase
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Purchases"
          value={stats.totalPurchases || 0}
          icon={ShoppingCart}
        />
        <StatsCard
          label="This Month"
          value={stats.thisMonthCount || 0}
          icon={PackagePlus}
        />
        <StatsCard
          label="Month Spend"
          value={formatCurrency(stats.thisMonthTotal)}
          icon={ShoppingCart}
        />
        <StatsCard
          label="All Time Spend"
          value={formatCurrency(stats.allTimeTotal)}
          icon={ShoppingCart}
        />
      </div>

      {/* Purchase Form */}
      {showForm && (
        <div ref={formRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark">
              Record New Purchase
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-1">
                  Supplier *
                </label>
                <select
                  value={form.supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) =>
                    setForm({ ...form, purchaseDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-dark">
                  Ingredients *
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Row
                </button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      {idx === 0 && (
                        <label className="block text-xs text-dark-gray mb-1">
                          Ingredient
                        </label>
                      )}
                      <select
                        value={item.ingredientId}
                        onChange={(e) =>
                          handleItemChange(idx, "ingredientId", e.target.value)
                        }
                        className="w-full px-2 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                      >
                        <option value="">Select...</option>
                        {ingredients.map((ing) => (
                          <option
                            key={ing._id || ing.id}
                            value={ing._id || ing.id}
                          >
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && (
                        <label className="block text-xs text-dark-gray mb-1">
                          Unit
                        </label>
                      )}
                      <input
                        type="text"
                        value={item.unit}
                        readOnly
                        placeholder="auto"
                        className="w-full px-2 py-2 rounded-xl border border-gray-100 bg-gray-50 text-sm text-dark-gray"
                      />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && (
                        <label className="block text-xs text-dark-gray mb-1">
                          Qty
                        </label>
                      )}
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "quantity",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-2 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      {idx === 0 && (
                        <label className="block text-xs text-dark-gray mb-1">
                          Price/Unit (Rs.)
                        </label>
                      )}
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.pricePerUnit}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "pricePerUnit",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-2 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={form.items.length === 1}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="text-sm font-semibold text-dark">
                Total:{" "}
                <span className="text-primary text-base">
                  {formatCurrency(totalCost)}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Record Purchase"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-dark-gray hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-dark-gray">
            Loading purchases...
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-dark-gray">No purchases recorded yet</p>
          </div>
        ) : (
          <>
            {/* Top info bar */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-dark-gray">
                Showing{" "}
                <span className="font-semibold text-dark">
                  {startIndex + 1}–{Math.min(endIndex, purchases.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-dark">
                  {purchases.length}
                </span>{" "}
                purchases
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
                      Supplier
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Items
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Total Cost
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-dark-gray uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-dark">
                          {formatDate(p.purchaseDate)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-dark">
                          {p.supplierName}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-dark-gray">
                          {p.items?.length || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                          {formatCurrency(p.totalCost)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setExpandedId(expandedId === p.id ? null : p.id)
                              }
                              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              {expandedId === p.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === p.id && (
                        <tr>
                          <td colSpan={5} className="px-4 pb-4">
                            <div className="bg-gray-50 rounded-xl p-4 mt-1">
                              {p.notes && (
                                <p className="text-xs text-dark-gray mb-3 italic">
                                  Note: {p.notes}
                                </p>
                              )}
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-dark-gray uppercase">
                                    <th className="text-left pb-2">
                                      Ingredient
                                    </th>
                                    <th className="text-right pb-2">Qty</th>
                                    <th className="text-right pb-2">Unit</th>
                                    <th className="text-right pb-2">
                                      Price/Unit
                                    </th>
                                    <th className="text-right pb-2">
                                      Subtotal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {p.items?.map((item, i) => (
                                    <tr key={i}>
                                      <td className="py-1.5 font-medium">
                                        {item.ingredientName}
                                      </td>
                                      <td className="py-1.5 text-right">
                                        {item.quantity}
                                      </td>
                                      <td className="py-1.5 text-right text-dark-gray">
                                        {item.unit}
                                      </td>
                                      <td className="py-1.5 text-right">
                                        {formatCurrency(item.pricePerUnit)}
                                      </td>
                                      <td className="py-1.5 text-right font-semibold">
                                        {formatCurrency(item.subtotal)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
        title="Delete Purchase"
        message="Deleting this purchase will reverse the stock that was added. Are you sure?"
        confirmText="Delete & Reverse Stock"
        variant="danger"
      />
    </div>
  );
};

export default AdminPurchases;
