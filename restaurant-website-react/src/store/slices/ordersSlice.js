import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  filters: {
    status: 'All',
    search: '',
    dateRange: null,
    userType: 'All', // All, Guest, Registered
  },
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => o.orderId === orderId);
      if (order) {
        order.status = status;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
          status,
          timestamp: new Date().toISOString(),
        });
      }
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter((o) => o.orderId !== action.payload);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setOrders,
  setLoading,
  setError,
  updateOrderStatus,
  deleteOrder,
  setFilters,
  resetFilters,
} = ordersSlice.actions;

// Selectors
export const selectAllOrders = (state) => state.orders.orders;
export const selectFilters = (state) => state.orders.filters;
export const selectLoading = (state) => state.orders.loading;

export const selectFilteredOrders = (state) => {
  const { orders, filters } = state.orders;
  let filtered = [...orders];

  // Filter by status
  if (filters.status && filters.status !== 'All') {
    filtered = filtered.filter((order) => order.status === filters.status);
  }

  // Filter by user type
  if (filters.userType && filters.userType !== 'All') {
    if (filters.userType === 'Guest') {
      filtered = filtered.filter((order) => order.isGuestOrder === true);
    } else if (filters.userType === 'Registered') {
      filtered = filtered.filter((order) => !order.isGuestOrder);
    }
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.orderId?.toLowerCase().includes(searchLower) ||
        order.customerInfo?.name?.toLowerCase().includes(searchLower) ||
        order.customerInfo?.email?.toLowerCase().includes(searchLower)
    );
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  return filtered;
};

export const selectOrderStats = (state) => {
  const orders = state.orders.orders;
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    completed: orders.filter((o) => o.status === 'Completed').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };
};

export default ordersSlice.reducer;
