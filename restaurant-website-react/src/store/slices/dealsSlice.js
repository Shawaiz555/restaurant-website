import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  deals: [],
  loading: false,
  error: null,
  filters: {
    status: 'All',
    search: '',
  },
};

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setDeals: (state, action) => {
      state.deals = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    addDeal: (state, action) => {
      state.deals.unshift(action.payload);
    },
    updateDeal: (state, action) => {
      const updated = action.payload;
      const index = state.deals.findIndex((d) => d._id === updated._id);
      if (index !== -1) {
        state.deals[index] = updated;
      }
    },
    deleteDeal: (state, action) => {
      state.deals = state.deals.filter((d) => d._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
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
  setDeals,
  addDeal,
  updateDeal,
  deleteDeal,
  setLoading,
  setError,
  setFilters,
  resetFilters,
} = dealsSlice.actions;

export const selectAllDeals = (state) => state.deals.deals;
export const selectDealsLoading = (state) => state.deals.loading;
export const selectDealsFilters = (state) => state.deals.filters;

export const selectFilteredDeals = (state) => {
  const deals = Array.isArray(state.deals.deals) ? state.deals.deals : [];
  const { status, search } = state.deals.filters;

  let filtered = [...deals];

  if (status === 'Active') {
    filtered = filtered.filter((d) => d.isActive);
  } else if (status === 'Inactive') {
    filtered = filtered.filter((d) => !d.isActive);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.items?.some((item) => item.name?.toLowerCase().includes(q))
    );
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const selectDealStats = (state) => {
  const deals = Array.isArray(state.deals.deals) ? state.deals.deals : [];
  return {
    total: deals.length,
    active: deals.filter((d) => d.isActive).length,
    inactive: deals.filter((d) => !d.isActive).length,
  };
};

export default dealsSlice.reducer;
