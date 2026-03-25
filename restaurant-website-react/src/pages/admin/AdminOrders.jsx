import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useSettings from "../../hooks/useSettings";
import SearchBar from "../../components/admin/common/SearchBar";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import StatsCard from "../../components/admin/common/StatsCard";
import { TablePageSkeleton } from "../../components/admin/common/SkeletonLoader";
import PrintButton from "../../components/admin/common/PrintButton";
import { printTable, getSelectionSummary } from "../../utils/printUtils";
import {
  setOrders,
  updateOrderStatus,
  deleteOrder,
  setFilters,
} from "../../store/slices/ordersSlice";
import {
  selectFilteredOrders,
  selectOrderStats,
} from "../../store/slices/ordersSlice";
import ordersService from "../../services/ordersService";
import { showNotification } from "../../store/slices/notificationSlice";
import {
  Package,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Hash,
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Settings,
  ClipboardList,
  FileText,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  ShoppingBag,
  TableIcon,
  Wifi,
  Store,
} from "lucide-react";

const getPrintColumns = (currencySymbol) => [
  { header: "#", render: (_, i) => i + 1 },
  { header: "Order ID", render: (r) => r.orderId?.substring(0, 16) || "N/A" },
  {
    header: "Customer",
    render: (r) => r.customerInfo?.name || r.customerInfo?.fullName || "N/A",
  },
  { header: "Email", render: (r) => r.customerInfo?.email || "N/A" },
  { header: "Phone", render: (r) => r.customerInfo?.phone || "N/A" },
  {
    header: "Total",
    render: (r) => `${currencySymbol} ${parseFloat(r.total || 0).toFixed(2)}`,
  },
  { header: "Status", render: (r) => r.status },
  { header: "Type", render: (r) => (r.isGuestOrder ? "Guest" : "Registered") },
  {
    header: "Date",
    render: (r) =>
      new Date(r.orderDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
];

function escO(val) {
  if (val == null) return "—";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function orderDetailRenderer(order, currencySymbol = "") {
  const items = order.items || order.cartItems || [];
  if (!items.length) return null;

  const itemRows = items
    .map((item) => {
      // Addons: item.addOns.drinks / desserts / extras
      const addOnParts = [];
      const ao = item.addOns || {};
      (ao.drinks || []).forEach((d) =>
        addOnParts.push(
          escO(`${d.name}${d.quantity > 1 ? " \xd7" + d.quantity : ""}`),
        ),
      );
      (ao.desserts || []).forEach((d) =>
        addOnParts.push(
          escO(`${d.name}${d.quantity > 1 ? " \xd7" + d.quantity : ""}`),
        ),
      );
      (ao.extras || []).forEach((e) =>
        addOnParts.push(
          escO(`${e.name}${e.quantity > 1 ? " \xd7" + e.quantity : ""}`),
        ),
      );
      const addons = addOnParts.length ? addOnParts.join("<br/>") : "—";

      // Customizations: item.size + item.spiceLevel
      const custParts = [];
      if (item.size) custParts.push(escO(`Size: ${item.size}`));
      if (item.spiceLevel) {
        const spice =
          typeof item.spiceLevel === "object"
            ? item.spiceLevel.name
            : item.spiceLevel;
        if (spice) custParts.push(escO(`Spice Level: ${spice}`));
      }
      const customizations = custParts.length ? custParts.join("<br/>") : "—";

      // Deal items sub-list
      const dealItemsHtml =
        item.isDeal && (item.dealItems || []).length
          ? '<br/><em style="font-size:9px;color:#777;">Includes: ' +
            (item.dealItems || [])
              .map((di) =>
                escO(
                  `${di.name}${di.quantity > 1 ? " \xd7" + di.quantity : ""}`,
                ),
              )
              .join(", ") +
            "</em>"
          : "";

      return `<tr>
      <td>${escO(item.name)}${dealItemsHtml}</td>
      <td style="text-align:center">${item.quantity || 1}</td>
      <td style="text-align:right">${currencySymbol} ${parseFloat(item.price || 0).toFixed(2)}</td>
      <td>${addons}</td>
      <td>${customizations}</td>
    </tr>`;
    })
    .join("");

  const paymentMethod = escO(order.paymentMethod);
  const ci = order.customerInfo || {};
  const deliveryInfo = escO(ci.address || null);
  const additionalNotes = escO(ci.additionalNotes || null);

  return `<div class="detail-box">
    <div class="detail-title">Order Details</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px 20px;margin-bottom:8px;font-size:10px;">
      <span><strong>Payment Method:</strong> ${paymentMethod}</span>
      <span><strong>Delivery Address:</strong> ${deliveryInfo}</span>
      ${additionalNotes !== "—" ? `<span><strong>Delivery Notes:</strong> ${additionalNotes}</span>` : ""}
    </div>
    <div class="detail-title" style="margin-top:8px;">Items Ordered</div>
    <table>
      <thead>
        <tr>
          <th style="width:25%">Item</th>
          <th style="width:8%;text-align:center">Qty</th>
          <th style="width:12%;text-align:right">Price</th>
          <th style="width:27%">Addons</th>
          <th style="width:28%">Customizations</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>`;
}

const AdminOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orders = useSelector(selectFilteredOrders);
  const { currencySymbol, formatPrice: formatCurrency } = useSettings();
  const stats = useSelector(selectOrderStats);
  const filters = useSelector((state) => state.orders.filters);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const allOrders = await ordersService.getOrders();
      dispatch(setOrders(allOrders));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (id, newStatus) => {
    const result = await ordersService.updateOrderStatus(id, newStatus);
    if (result.success) {
      dispatch(updateOrderStatus({ orderId: id, status: newStatus }));
      dispatch(
        showNotification({
          type: "success",
          message: `Order status updated to ${newStatus}`,
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
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    const result = await ordersService.deleteOrder(orderToDelete._id);
    if (result.success) {
      dispatch(deleteOrder(orderToDelete._id));

      dispatch(
        showNotification({
          type: "success",
          message: "Order deleted successfully",
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
    setOrderToDelete(null);
  };

  const handleSearch = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleFilterChange = (filterName, value) => {
    dispatch(setFilters({ [filterName]: value }));
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  // Reset to page 1 and clear selection when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [filters.search, filters.status, filters.userType, filters.orderSource, filters.orderType]);

  const buildSubtitle = () => {
    const parts = [];
    if (filters.status !== "All") parts.push(`Status: ${filters.status}`);
    if (filters.userType !== "All") parts.push(`Type: ${filters.userType}`);
    if (filters.orderSource !== "All") parts.push(`Source: ${filters.orderSource}`);
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    if (selectedIds.length > 0)
      parts.push(`${selectedIds.length} rows selected`);
    return parts.length > 0 ? parts.join(" · ") : "All records";
  };

  const handlePrint = (mode = "print") => {
    const rowsToPrint = getSelectionSummary(selectedIds, orders);
    printTable({
      title: "Orders Report",
      subtitle: buildSubtitle(),
      columns: getPrintColumns(currencySymbol),
      rows: rowsToPrint,
      detailRenderer: (order) => orderDetailRenderer(order, currencySymbol),
      mode,
    });
  };

  if (loading) return <TablePageSkeleton stats={4} cols={7} rows={8} />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-sans font-bold text-primary mb-2">
          Orders Management
        </h1>
        <p className="text-dark-gray">View and manage all customer orders</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard icon={Package} label="Total Orders" value={stats.total} />
        <StatsCard icon={Clock} label="Pending" value={stats.pending} />
        <StatsCard
          icon={RefreshCw}
          label="Processing"
          value={stats.processing}
        />
        <StatsCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completed}
        />
        <StatsCard icon={XCircle} label="Cancelled" value={stats.cancelled} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <SearchBar
            placeholder="Search by Order Id, Name, or Email..."
            onSearch={handleSearch}
          />

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-md"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Order Source Filter */}
          <select
            value={filters.orderSource}
            onChange={(e) => handleFilterChange("orderSource", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-md"
          >
            <option value="All">All Sources</option>
            <option value="online">Online Orders</option>
            <option value="in-store">In-Store (POS)</option>
          </select>

          {/* User Type Filter */}
          <select
            value={filters.userType}
            onChange={(e) => handleFilterChange("userType", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-md"
          >
            <option value="All">All Customers</option>
            <option value="Guest">Guest Orders</option>
            <option value="Registered">Registered Users</option>
          </select>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-dark-gray">
            <span className="font-semibold text-dark">{orders.length}</span>{" "}
            order{orders.length !== 1 ? "s" : ""}
            {selectedIds.length > 0 && (
              <span className="ml-2 text-primary font-semibold">
                · {selectedIds.length} selected
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Pagination Controls - Top */}
        {orders.length > 0 && (
          <div className="px-3 lg:px-4 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-cream-light/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-md lg:text-xl font-bold text-dark">
                    Orders List
                  </p>
                  <p className="text-[10px] text-dark-gray">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, orders.length)} of {orders.length}{" "}
                    orders
                  </p>
                </div>
              </div>
              <div className="w-full flex flex-col sm:flex-row justify-end items-center gap-3 px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
                <label className="text-sm text-dark-gray font-semibold whitespace-nowrap">
                  Items per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <PrintButton
                  selectedCount={selectedIds.length}
                  totalCount={orders.length}
                  onPrint={handlePrint}
                />
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 mx-auto mb-6 text-primary animate-bounce" />
            <h3 className="text-2xl font-bold text-dark mb-3">
              No Orders Found
            </h3>
            <p className="text-dark-gray text-lg">
              {filters.search ||
              filters.status !== "All" ||
              filters.userType !== "All"
                ? "Try adjusting your filters"
                : "Orders will appear here once customers place them"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gradient-to-r from-primary/5 via-primary-light/5 to-primary/5 border-b-2 border-primary/20">
                  <tr>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center w-10">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                        checked={
                          paginatedOrders.length > 0 &&
                          paginatedOrders.every((r) =>
                            selectedIds.includes(r._id),
                          )
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const pageIds = paginatedOrders.map((r) => r._id);
                            setSelectedIds((prev) => [
                              ...new Set([...prev, ...pageIds]),
                            ]);
                          } else {
                            const pageIds = new Set(
                              paginatedOrders.map((r) => r._id),
                            );
                            setSelectedIds((prev) =>
                              prev.filter((id) => !pageIds.has(id)),
                            );
                          }
                        }}
                        title="Select/deselect all on this page"
                      />
                    </th>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Hash className="w-4 h-4 text-primary" />
                        <span>Order ID</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>Customer</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>Phone</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span>Total</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 text-primary" />
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedOrders.map((order, index) => (
                    <tr
                      key={order._id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-cream-light/60 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-primary group`}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      <td
                        className="px-3 lg:px-4 xl:px-6 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-primary cursor-pointer"
                          checked={selectedIds.includes(order._id)}
                          onChange={(e) =>
                            setSelectedIds((prev) =>
                              e.target.checked
                                ? [...prev, order._id]
                                : prev.filter((x) => x !== order._id),
                            )
                          }
                        />
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-mono font-semibold text-dark group-hover:text-primary transition-colors">
                            {order.orderId?.substring(0, 12)}...
                          </span>
                          {order.orderSource === "in-store" ? (
                            <span className="inline-flex items-center text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold gap-1">
                              <Store className="w-3 h-3" />
                              In-Store
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold gap-1">
                              <Wifi className="w-3 h-3" />
                              Online
                            </span>
                          )}
                          {order.orderSource === "in-store" && order.orderType === "dine-in" && (
                            <span className="inline-flex items-center text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold gap-1">
                              <TableIcon className="w-3 h-3" />
                              {order.tableNumber ? `T${order.tableNumber}` : "Dine-In"}
                            </span>
                          )}
                          {order.orderSource === "in-store" && order.orderType === "takeaway" && (
                            <span className="inline-flex items-center text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold gap-1">
                              <ShoppingBag className="w-3 h-3" />
                              Takeaway
                            </span>
                          )}
                          {order.isGuestOrder && (
                            <span className="inline-flex items-center text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold gap-1">
                              <User className="w-3 h-3" />
                              Guest
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-medium text-dark">
                            {order.customerInfo?.name ||
                              order.customerInfo?.fullName ||
                              "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-4 text-center">
                        <span className="text-sm text-dark-gray">
                          {order.customerInfo?.email || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-4 text-center whitespace-nowrap">
                        <span className="text-sm text-dark-gray font-medium">
                          {order.customerInfo?.phone || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20">
                          <span className="text-sm font-bold text-primary">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(order._id, e.target.value);
                            }}
                            className="w-auto min-w-[130px] text-xs px-2.5 py-1.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white font-semibold transition-all hover:border-primary/50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-semibold text-dark">
                            {new Date(order.orderDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="text-[11px] text-dark-gray">
                            {new Date(order.orderDate).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 xl:px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/orders/${order._id}`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all text-xs font-bold hover:shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5"
                            title="View Details"
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(order);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls - Bottom */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 lg:px-8 py-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-cream-light/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark">
                        Page {currentPage} of {totalPages}
                      </p>
                      <p className="text-xs text-dark-gray">
                        Navigate through pages
                      </p>
                    </div>
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                      }`}
                      title="First Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                      }`}
                    >
                      ← Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Show only 5 pages at a time
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[40px] px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-primary to-primary-dark text-white scale-110 shadow-xl"
                                  : "bg-white text-primary border-2 border-gray-300 hover:border-primary hover:bg-primary/10 hover:scale-105 active:scale-95"
                              }`}
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
                              className="px-2 text-dark-gray font-bold"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                      }`}
                    >
                      Next →
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                      }`}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete order ${orderToDelete?.orderId?.substring(0, 12)}...? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setOrderToDelete(null);
        }}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminOrders;
