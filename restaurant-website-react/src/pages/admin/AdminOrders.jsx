import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatusBadge from '../../components/admin/common/StatusBadge';
import SearchBar from '../../components/admin/common/SearchBar';
import ConfirmModal from '../../components/admin/common/ConfirmModal';
import { setOrders, updateOrderStatus, deleteOrder, setFilters } from '../../store/slices/ordersSlice';
import { selectFilteredOrders, selectOrderStats } from '../../store/slices/ordersSlice';
import ordersService from '../../services/ordersService';
import { showNotification } from '../../store/slices/notificationSlice';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFilteredOrders);
  const stats = useSelector(selectOrderStats);
  const filters = useSelector((state) => state.orders.filters);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = ordersService.getOrders();
    dispatch(setOrders(allOrders));
  };

  const handleStatusChange = (orderId, newStatus) => {
    const result = ordersService.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
      dispatch(showNotification({
        type: 'success',
        message: `Order status updated to ${newStatus}`,
      }));
    } else {
      dispatch(showNotification({
        type: 'error',
        message: result.message,
      }));
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
      dispatch(showNotification({
        type: 'success',
        message: 'Order deleted successfully',
      }));
    } else {
      dispatch(showNotification({
        type: 'error',
        message: result.message,
      }));
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

  const formatCurrency = (amount) => {
    return `Rs ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h1 className="text-3xl font-display text-primary mb-2">Orders Management</h1>
        <p className="text-dark-gray">View and manage all customer orders</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-dark-gray mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-dark">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow-md border border-yellow-200">
          <p className="text-xs text-yellow-800 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-md border border-blue-200">
          <p className="text-xs text-blue-800 mb-1">Processing</p>
          <p className="text-2xl font-bold text-blue-800">{stats.processing}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-md border border-green-200">
          <p className="text-xs text-green-800 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow-md border border-red-200">
          <p className="text-xs text-red-800 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
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
            onChange={(e) => handleFilterChange('status', e.target.value)}
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
            onChange={(e) => handleFilterChange('userType', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-base"
          >
            <option value="All">All Customers</option>
            <option value="Guest">Guest Orders</option>
            <option value="Registered">Registered Users</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-dark mb-2">No Orders Found</h3>
            <p className="text-dark-gray">
              {filters.search || filters.status !== 'All' || filters.userType !== 'All'
                ? 'Try adjusting your filters'
                : 'Orders will appear here once customers place them'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-cream-light transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(selectedOrder?.orderId === order.orderId ? null : order)}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-dark">
                      {order.orderId?.substring(0, 12)}...
                      {order.isGuestOrder && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Guest</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark font-medium">
                      {order.customerInfo?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-gray">
                      {order.customerInfo?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-gray">
                      {order.customerInfo?.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.orderId, e.target.value);
                        }}
                        className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none bg-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-gray whitespace-nowrap">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(order);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Panel */}
      {selectedOrder && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display text-primary">Order Details</h2>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-dark-gray hover:text-dark transition-colors"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-cream-light rounded-xl p-4">
              <h3 className="font-semibold text-dark mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-dark-gray">Name:</span> <span className="font-medium text-dark">{selectedOrder.customerInfo?.name}</span></p>
                <p><span className="text-dark-gray">Email:</span> <span className="font-medium text-dark">{selectedOrder.customerInfo?.email}</span></p>
                <p><span className="text-dark-gray">Phone:</span> <span className="font-medium text-dark">{selectedOrder.customerInfo?.phone}</span></p>
                <p><span className="text-dark-gray">Address:</span> <span className="font-medium text-dark">{selectedOrder.customerInfo?.address}</span></p>
                <p><span className="text-dark-gray">Type:</span> <span className="font-medium text-dark">{selectedOrder.isGuestOrder ? 'Guest' : 'Registered User'}</span></p>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-cream-light rounded-xl p-4">
              <h3 className="font-semibold text-dark mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-dark-gray">Order ID:</span> <span className="font-mono text-dark text-xs">{selectedOrder.orderId}</span></p>
                <p><span className="text-dark-gray">Status:</span> <StatusBadge status={selectedOrder.status} /></p>
                <p><span className="text-dark-gray">Payment Method:</span> <span className="font-medium text-dark">{selectedOrder.paymentMethod}</span></p>
                <p><span className="text-dark-gray">Ordered:</span> <span className="font-medium text-dark">{formatDate(selectedOrder.orderDate)}</span></p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="font-semibold text-dark mb-3">Order Items</h3>
            <div className="space-y-3">
              {selectedOrder.items?.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-cream-light rounded-xl">
                  <div className="flex-1">
                    <p className="font-semibold text-dark">{item.name}</p>
                    <p className="text-sm text-dark-gray">Size: {item.size}</p>
                    {item.spiceLevel && (
                      <p className="text-sm text-dark-gray">Spice: {item.spiceLevel.name}</p>
                    )}
                    {item.addOns && (
                      <div className="text-sm text-dark-gray mt-1">
                        {item.addOns.drinks?.length > 0 && (
                          <p>Drinks: {item.addOns.drinks.map(d => `${d.name} (${d.quantity})`).join(', ')}</p>
                        )}
                        {item.addOns.desserts?.length > 0 && (
                          <p>Desserts: {item.addOns.desserts.map(d => `${d.name} (${d.quantity})`).join(', ')}</p>
                        )}
                        {item.addOns.extras?.length > 0 && (
                          <p>Extras: {item.addOns.extras.map(e => `${e.name} (${e.quantity})`).join(', ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-primary">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-dark-gray">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 bg-cream-light rounded-xl p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-gray">Subtotal:</span>
                <span className="font-medium text-dark">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-gray">Delivery Fee:</span>
                <span className="font-medium text-dark">{formatCurrency(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-lg border-t-2 border-gray-200 pt-2">
                <span className="font-bold text-dark">Total:</span>
                <span className="font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
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
