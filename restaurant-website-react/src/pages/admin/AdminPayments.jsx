import React, { useEffect, useState, useCallback } from "react";
import paymentService from "../../services/paymentService";
import ordersService from "../../services/ordersService";
import { useAuth } from "../../hooks/useAuth";
import useSettings from "../../hooks/useSettings";
import StatsCard from "../../components/admin/common/StatsCard";
import StatusBadge from "../../components/admin/common/StatusBadge";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import PrintButton from "../../components/admin/common/PrintButton";
import { printTable, getSelectionSummary } from "../../utils/printUtils";
import {
  CreditCard,
  Plus,
  Search,
  Trash2,
  ChevronDown,
  CheckCircle,
  Clock,
  X,
  DollarSign,
  Receipt,
  FileText,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const METHOD_OPTIONS = ["Cash", "Card", "Online", "Bank Transfer"];
const STATUS_OPTIONS = ["Pending", "Paid", "Refunded", "Failed"];

const STATUS_COLORS = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Refunded: "bg-blue-100 text-blue-700",
  Failed: "bg-red-100 text-red-700",
};

const getPrintColumns = (currencySymbol) => [
  { header: "#", render: (_, i) => i + 1 },
  { header: "Order ID", render: (p) => p.orderId || "—" },
  { header: "Method", render: (p) => p.method || "—" },
  { header: "Amount", render: (p) => `${currencySymbol} ${parseFloat(p.amount || 0).toFixed(2)}` },
  { header: "Status", render: (p) => p.status || "—" },
  { header: "Transaction Ref", render: (p) => p.transactionRef || "—" },
  { header: "Processed By", render: (p) => p.processedBy?.name || "—" },
  { header: "Role", render: (p) => p.processedBy?.role?.replace("_", " ") || "—" },
  {
    header: "Date",
    render: (p) =>
      p.paidAt
        ? new Date(p.paidAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
  },
  { header: "Notes", render: (p) => p.notes || "—" },
];

// ─── Create Payment Modal ────────────────────────────────────────────────────
const CreatePaymentModal = ({ onClose, onCreated }) => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const { formatPrice: formatCurrency } = useSettings();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [method, setMethod] = useState("Cash");
  const [transRef, setTransRef] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ordersService
      .getOrders()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.orders || [];
        setOrders(list.filter((o) => o.status !== "Cancelled"));
      })
      .catch(() => {});
  }, []);

  const filtered = orders.filter(
    (o) =>
      !search ||
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleOrder = (o) => {
    setSelectedOrders((prev) =>
      prev.some((s) => s.orderId === o.orderId)
        ? prev.filter((s) => s.orderId !== o.orderId)
        : [...prev, o],
    );
  };

  const toggleAll = () => {
    const visibleIds = filtered.slice(0, 20).map((o) => o.orderId);
    const allSelected = visibleIds.every((id) =>
      selectedOrders.some((s) => s.orderId === id),
    );
    if (allSelected) {
      setSelectedOrders((prev) =>
        prev.filter((s) => !visibleIds.includes(s.orderId)),
      );
    } else {
      const toAdd = filtered
        .slice(0, 20)
        .filter((o) => !selectedOrders.some((s) => s.orderId === o.orderId));
      setSelectedOrders((prev) => [...prev, ...toAdd]);
    }
  };

  const totalAmount = selectedOrders.reduce(
    (sum, o) => sum + parseFloat(o.total || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedOrders.length === 0) {
      setError("Please select at least one order.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await Promise.all(
        selectedOrders.map((o) =>
          paymentService.createPayment({
            orderId: o.orderId,
            amount: o.total,
            method,
            transactionRef: transRef || undefined,
            notes,
          }),
        ),
      );
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const visibleOrders = filtered.slice(0, 20);
  const allVisibleSelected =
    visibleOrders.length > 0 &&
    visibleOrders.every((o) =>
      selectedOrders.some((s) => s.orderId === o.orderId),
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-dark font-sans">
            Record Payment
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-dark-gray" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto flex-1"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Order search */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-dark">
                Select Orders *
              </label>
              {selectedOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedOrders([])}
                  className="text-xs text-dark-gray hover:text-red-500"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray" />
              <input
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Search by Order ID or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Select-all header */}
              {visibleOrders.length > 1 && (
                <div
                  className="flex items-center gap-3 px-3 py-2 bg-cream-light border-b border-gray-100 cursor-pointer hover:bg-cream-light/80"
                  onClick={toggleAll}
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={allVisibleSelected}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-dark-gray">
                    Select all visible ({visibleOrders.length})
                  </span>
                </div>
              )}

              <div className="max-h-44 overflow-y-auto divide-y divide-gray-50">
                {visibleOrders.map((o) => {
                  const isSelected = selectedOrders.some(
                    (s) => s.orderId === o.orderId,
                  );
                  return (
                    <div
                      key={o.orderId}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-cream-light"
                      }`}
                      onClick={() => toggleOrder(o)}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={isSelected}
                        className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark">{o.orderId}</p>
                        <p className="text-xs text-dark-gray truncate">
                          {o.customerInfo?.name || "Guest"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary">
                          {formatCurrency(o.total)}
                        </p>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="text-center py-4 text-sm text-dark-gray">
                    No orders found
                  </p>
                )}
              </div>
            </div>

            {/* Selected summary */}
            {selectedOrders.length > 0 && (
              <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-green-700 font-medium">
                    {selectedOrders.length}{" "}
                    {selectedOrders.length === 1 ? "order" : "orders"} selected
                  </span>
                </div>
                <span className="font-bold text-green-700">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1">
              Payment Method *
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white pr-8"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {METHOD_OPTIONS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray pointer-events-none" />
            </div>
          </div>

          {/* Transaction ref (for non-cash) */}
          {method !== "Cash" && (
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">
                Transaction Reference
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={transRef}
                onChange={(e) => setTransRef(e.target.value)}
                placeholder="Card/bank reference number"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-dark hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || selectedOrders.length === 0}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              {saving
                ? "Recording…"
                : selectedOrders.length > 1
                  ? `Record ${selectedOrders.length} Payments`
                  : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const AdminPayments = () => {
  const { userRole } = useAuth();
  const { currencySymbol, formatPrice: formatCurrency } = useSettings();
  const canDelete = userRole === "super_admin";
  const canUpdate = userRole === "super_admin" || userRole === "manager";

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMethod, setFilterMethod] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, summaryRes] = await Promise.allSettled([
        paymentService.getPayments({
          status: filterStatus,
          method: filterMethod,
        }),
        canUpdate ? paymentService.getSummary() : Promise.resolve(null),
      ]);

      const paymentsData =
        paymentsRes.value?.payments || paymentsRes.value || [];
      const summaryData = summaryRes.value?.summary || {};

      setPayments(paymentsData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Payments load error:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterMethod, canUpdate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await paymentService.deletePayment(deleteTarget._id);
    setDeleteTarget(null);
    await load();
  };

  const filtered = payments.filter(
    (p) =>
      !search ||
      p.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      p.processedBy?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Reset page + selection when filters/search change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, filterStatus, filterMethod]);

  const buildSubtitle = () => {
    const parts = [];
    if (filterStatus !== "All") parts.push(`Status: ${filterStatus}`);
    if (filterMethod !== "All") parts.push(`Method: ${filterMethod}`);
    if (selectedIds.length > 0) parts.push(`${selectedIds.length} rows selected`);
    return parts.length > 0 ? parts.join(" · ") : "All records";
  };

  const handlePrint = (mode = "print") => {
    const rowsToPrint = getSelectionSummary(selectedIds, filtered, "_id");
    printTable({
      title: "Payments Report",
      subtitle: buildSubtitle(),
      columns: getPrintColumns(currencySymbol),
      rows: rowsToPrint,
      mode,
    });
  };

  const toggleId = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 animate-pulse h-28"
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-sm">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-sans text-primary mb-0.5">
                Payments
              </h1>
              <p className="text-dark-gray text-sm">Record and track order payments</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats — visible to super_admin + manager */}
      {canUpdate && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(summary.total)}
          />
          <StatsCard
            icon={Receipt}
            label="Today's Payments"
            value={formatCurrency(summary.today)}
          />
          <StatsCard
            icon={CheckCircle}
            label="This Month"
            value={formatCurrency(summary.thisMonth)}
          />
          <StatsCard
            icon={Clock}
            label="Pending"
            value={summary.pendingCount || 0}
            change={summary.pendingCount > 0 ? "Awaiting payment" : null}
            trend={summary.pendingCount > 0 ? "up" : "neutral"}
          />
        </div>
      )}

      {/* Method breakdown */}
      {canUpdate && summary.byMethod?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-base font-bold text-dark mb-4 font-sans">
            Payment Methods
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summary.byMethod.map((m) => (
              <div
                key={m._id}
                className="bg-cream-light rounded-xl p-4 text-center"
              >
                <p className="text-sm font-semibold text-dark">{m._id}</p>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatCurrency(m.total)}
                </p>
                <p className="text-xs text-dark-gray">{m.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray" />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search by order ID or staff…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="All">All Methods</option>
              {METHOD_OPTIONS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-dark-gray">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No payments found</p>
            <p className="text-sm mt-1">Record a payment to get started</p>
          </div>
        ) : (
          <>
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-cream-light/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-dark">
                  Payments List
                </p>
                <p className="text-xs text-dark-gray">
                  Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filtered.length)} of{" "}
                  {filtered.length} payments
                  {selectedIds.length > 0 && (
                    <span className="ml-2 text-primary font-semibold">
                      · {selectedIds.length} selected
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <label className="text-sm text-dark-gray font-semibold whitespace-nowrap">
                  Per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-2 py-1 rounded-lg border border-gray-200 focus:border-primary focus:outline-none text-sm font-semibold bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <PrintButton
                  selectedCount={selectedIds.length}
                  totalCount={filtered.length}
                  onPrint={handlePrint}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-light border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                      checked={
                        paginatedPayments.length > 0 &&
                        paginatedPayments.every((p) => selectedIds.includes(p._id))
                      }
                      onChange={() => {
                        const pageIds = paginatedPayments.map((p) => p._id);
                        const allSelected = pageIds.every((id) => selectedIds.includes(id));
                        setSelectedIds((prev) =>
                          allSelected
                            ? prev.filter((id) => !pageIds.includes(id))
                            : [...new Set([...prev, ...pageIds])],
                        );
                      }}
                    />
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray">
                    Order
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray">
                    Method
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray hidden md:table-cell">
                    Processed By
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray hidden lg:table-cell">
                    Date
                  </th>
                  {canDelete && (
                    <th className="text-right px-5 py-3 font-semibold text-dark-gray">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedPayments.map((p) => (
                  <tr
                    key={p._id}
                    className={`hover:bg-cream-light/50 transition-colors ${selectedIds.includes(p._id) ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                        checked={selectedIds.includes(p._id)}
                        onChange={() => toggleId(p._id)}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-dark">{p.orderId}</p>
                      {p.transactionRef && (
                        <p className="text-xs text-dark-gray">
                          {p.transactionRef}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-primary">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="text-dark font-medium">
                        {p.processedBy?.name || "—"}
                      </p>
                      <p className="text-xs text-dark-gray capitalize">
                        {p.processedBy?.role?.replace("_", " ")}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-dark-gray text-xs hidden lg:table-cell">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    {canDelete && (
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-dark-gray hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-cream-light/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">
                      Page {currentPage} of {totalPages}
                    </p>
                    <p className="text-xs text-dark-gray">Navigate through pages</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50" : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"}`}
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50" : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"}`}
                  >
                    ← Previous
                  </button>

                  <div className="hidden sm:flex items-center gap-1.5">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[36px] px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${currentPage === page ? "bg-gradient-to-r from-primary to-primary-dark text-white scale-110 shadow-xl" : "bg-white text-primary border-2 border-gray-300 hover:border-primary hover:bg-primary/10 hover:scale-105 active:scale-95"}`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-1 text-dark-gray font-bold">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50" : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"}`}
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50" : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"}`}
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreatePaymentModal
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Payment"
          message={`Delete payment for order ${deleteTarget.orderId}? This cannot be undone.`}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminPayments;
