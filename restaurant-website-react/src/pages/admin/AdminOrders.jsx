import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import StatusBadge from "../../components/admin/common/StatusBadge";
import SearchBar from "../../components/admin/common/SearchBar";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
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
  MapPin,
  CreditCard,
  Utensils,
  Coffee,
  Cake,
  Plus,
  Star,
  FileText,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  X,
} from "lucide-react";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFilteredOrders);
  const stats = useSelector(selectOrderStats);
  const filters = useSelector((state) => state.orders.filters);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ref for order details section
  const orderDetailsRef = useRef(null);

  const loadOrders = React.useCallback(() => {
    const allOrders = ordersService.getOrders();
    dispatch(setOrders(allOrders));
  }, [dispatch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = (orderId, newStatus) => {
    const result = ordersService.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
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

  const handleDeleteConfirm = () => {
    const result = ordersService.deleteOrder(orderToDelete.orderId);
    if (result.success) {
      dispatch(deleteOrder(orderToDelete.orderId));
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.status, filters.userType]);

  const formatCurrency = (amount) => {
    return `Rs ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h1 className="text-2xl lg:text-4xl font-display text-primary mb-2">
          Orders Management
        </h1>
        <p className="text-dark-gray">View and manage all customer orders</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xs sm:text-sm text-dark-gray mb-2 font-semibold uppercase tracking-wide">
            Total Orders
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.total}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-5 shadow-lg border-2 border-yellow-200 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-white/60 rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <Clock className="w-6 h-6 text-yellow-700" />
          </div>
          <p className="text-xs sm:text-sm text-yellow-900 mb-2 font-semibold uppercase tracking-wide">
            Pending
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-800">
            {stats.pending}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 shadow-lg border-2 border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-white/60 rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <RefreshCw className="w-6 h-6 text-blue-700" />
          </div>
          <p className="text-xs sm:text-sm text-blue-900 mb-2 font-semibold uppercase tracking-wide">
            Processing
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-800">
            {stats.processing}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 shadow-lg border-2 border-green-200 hover:shadow-xl hover:border-green-300 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-white/60 rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
          <p className="text-xs sm:text-sm text-green-900 mb-2 font-semibold uppercase tracking-wide">
            Completed
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-green-800">
            {stats.completed}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 shadow-lg border-2 border-red-200 hover:shadow-xl hover:border-red-300 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-white/60 rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <XCircle className="w-6 h-6 text-red-700" />
          </div>
          <p className="text-xs sm:text-sm text-red-900 mb-2 font-semibold uppercase tracking-wide">
            Cancelled
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-red-800">
            {stats.cancelled}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <SearchBar
            placeholder="Search by Order ID, Name, or Email..."
            onSearch={handleSearch}
          />

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-base"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* User Type Filter */}
          <select
            value={filters.userType}
            onChange={(e) => handleFilterChange("userType", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-base"
          >
            <option value="All">All Customers</option>
            <option value="Guest">Guest Orders</option>
            <option value="Registered">Registered Users</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Pagination Controls - Top */}
        {orders.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-cream-light/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-md lg:text-xl font-bold text-dark">
                    Orders List
                  </p>
                  <p className="text-xs text-dark-gray">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, orders.length)} of {orders.length}{" "}
                    orders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
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
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Hash className="w-4 h-4 text-primary" />
                        <span>Order ID</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>Customer</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>Phone</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span>Total</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 text-primary" />
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-dark whitespace-nowrap">
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
                      key={order.orderId}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-cream-light/60 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-primary group`}
                      onClick={() => {
                        const newSelectedOrder =
                          selectedOrder?.orderId === order.orderId
                            ? null
                            : order;
                        setSelectedOrder(newSelectedOrder);

                        // Scroll to order details if order is selected
                        if (newSelectedOrder) {
                          setTimeout(() => {
                            if (orderDetailsRef.current) {
                              const element = orderDetailsRef.current;
                              const elementTop = element.offsetTop;
                              const offset = 80; // Offset for better visibility (accounts for any fixed headers)

                              window.scrollTo({
                                top: elementTop - offset,
                                behavior: "smooth"
                              });
                            }
                          }, 150);
                        }
                      }}
                    >
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-mono font-semibold text-dark group-hover:text-primary transition-colors">
                            {order.orderId?.substring(0, 12)}...
                          </span>
                          {order.isGuestOrder && (
                            <span className="inline-flex items-center text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold gap-1">
                              <User className="w-3 h-3" />
                              Guest
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-medium text-dark">
                            {order.customerInfo?.name ||
                              order.customerInfo?.fullName ||
                              "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <span className="text-sm text-dark-gray">
                          {order.customerInfo?.email || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                        <span className="text-sm text-dark-gray font-medium">
                          {order.customerInfo?.phone || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20">
                          <span className="text-sm font-bold text-primary">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(order.orderId, e.target.value);
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
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
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
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(order);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
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

      {/* Order Details Panel */}
      {selectedOrder && (
        <div
          ref={orderDetailsRef}
          className="bg-gradient-to-br from-white via-cream-light/30 to-white rounded-2xl p-6 lg:p-8 shadow-2xl border-2 border-primary/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  Order Details
                </h2>
                <p className="text-xs text-dark-gray">
                  Complete order information
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-10 h-10 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all flex items-center justify-center font-bold shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-gradient-to-br from-primary/5 to-primary-light/10 rounded-xl p-5 border-2 border-primary/20 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-dark text-base">
                  Customer Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  <User className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">Name</p>
                    <p className="text-sm font-bold text-dark">
                      {selectedOrder.customerInfo?.name ||
                        selectedOrder.customerInfo?.fullName ||
                        "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  <Mail className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">
                      Email
                    </p>
                    <p className="text-sm font-medium text-dark break-all">
                      {selectedOrder.customerInfo?.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  <Phone className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-dark">
                      {selectedOrder.customerInfo?.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  <MapPin className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">
                      Address
                    </p>
                    <p className="text-sm font-medium text-dark">
                      {selectedOrder.customerInfo?.address || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  {selectedOrder.isGuestOrder ? (
                    <User className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  ) : (
                    <Star className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">
                      Customer Type
                    </p>
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-1 ${
                        selectedOrder.isGuestOrder
                          ? "bg-gray-200 text-gray-700"
                          : "bg-primary/20 text-primary"
                      }`}
                    >
                      {selectedOrder.isGuestOrder
                        ? "Guest Order"
                        : "Registered User"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gradient-to-br from-primary/5 to-primary-light/10 rounded-xl p-5 border-2 border-primary/20 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-dark text-base">
                  Order Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  <Hash className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">
                      Order ID
                    </p>
                    <p className="text-[10px] font-mono font-bold text-dark break-all">
                      {selectedOrder.orderId}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  <RefreshCw className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">
                      Status
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  <CreditCard className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">
                      Payment Method
                    </p>
                    <p className="text-sm font-bold text-dark">
                      {selectedOrder.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5 border border-gray-100">
                  <Calendar className="w-4 h-4 text-dark-gray flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-dark-gray font-semibold">
                      Order Date
                    </p>
                    <p className="text-sm font-medium text-dark">
                      {formatDate(selectedOrder.orderDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-dark text-base">Order Items</h3>
            </div>
            <div className="space-y-3">
              {selectedOrder.items?.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-cream-light to-cream rounded-xl p-4 border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <p className="font-bold text-dark text-sm">
                          {item.name}
                        </p>
                      </div>
                      <div className="space-y-1 ml-8">
                        <p className="text-xs text-dark-gray">
                          <span className="font-semibold">Size:</span>{" "}
                          {item.size}
                        </p>
                        {item.spiceLevel && (
                          <p className="text-xs text-dark-gray">
                            <span className="font-semibold">Spice Level:</span>{" "}
                            {item.spiceLevel.name}
                          </p>
                        )}
                        {item.addOns && (
                          <div className="text-xs text-dark-gray space-y-0.5 mt-2">
                            {item.addOns.drinks?.length > 0 && (
                              <p className="flex items-start gap-1">
                                <Coffee className="w-3.5 h-3.5 text-dark-gray flex-shrink-0 mt-0.5" />
                                <span className="font-semibold">Drinks:</span>
                                <span>
                                  {item.addOns.drinks
                                    .map((d) => `${d.name} (×${d.quantity})`)
                                    .join(", ")}
                                </span>
                              </p>
                            )}
                            {item.addOns.desserts?.length > 0 && (
                              <p className="flex items-start gap-1">
                                <Cake className="w-3.5 h-3.5 text-dark-gray flex-shrink-0 mt-0.5" />
                                <span className="font-semibold">Desserts:</span>
                                <span>
                                  {item.addOns.desserts
                                    .map((d) => `${d.name} (×${d.quantity})`)
                                    .join(", ")}
                                </span>
                              </p>
                            )}
                            {item.addOns.extras?.length > 0 && (
                              <p className="flex items-start gap-1">
                                <Plus className="w-3.5 h-3.5 text-dark-gray flex-shrink-0 mt-0.5" />
                                <span className="font-semibold">Extras:</span>
                                <span>
                                  {item.addOns.extras
                                    .map((e) => `${e.name} (×${e.quantity})`)
                                    .join(", ")}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-base">
                        {formatCurrency(item.price)}
                      </p>
                      <p className="text-xs text-dark-gray bg-white px-2 py-1 rounded-full mt-1 inline-block">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 bg-gradient-to-br from-primary/5 to-primary-light/10 rounded-xl p-5 border-2 border-primary/20 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-dark text-base">Order Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white/80 rounded-lg p-2.5 border border-gray-100">
                <span className="text-sm text-dark-gray font-semibold">
                  Subtotal:
                </span>
                <span className="text-sm font-bold text-dark">
                  {formatCurrency(selectedOrder.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/80 rounded-lg p-2.5 border border-gray-100">
                <span className="text-sm text-dark-gray font-semibold">
                  Delivery Fee:
                </span>
                <span className="text-sm font-bold text-dark">
                  {formatCurrency(selectedOrder.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-lg p-3 border-2 border-primary/30 mt-2">
                <span className="text-base font-bold text-dark">
                  Total Amount:
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
