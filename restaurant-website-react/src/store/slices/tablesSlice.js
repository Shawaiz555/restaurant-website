import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tables: [],
  loading: false,
  error: null,
  filters: {
    location: 'All',
    status: 'All',
    search: '',
  },
};

const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setTables: (state, action) => {
      state.tables = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    addTable: (state, action) => {
      state.tables.push(action.payload);
    },
    updateTable: (state, action) => {
      const updated = action.payload;
      const index = state.tables.findIndex(
        (t) => t._id === updated._id || t.id === updated._id
      );
      if (index !== -1) {
        state.tables[index] = updated;
      }
    },
    deleteTable: (state, action) => {
      const id = action.payload;
      state.tables = state.tables.filter((t) => t._id !== id && t.id !== id);
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
  setTables,
  addTable,
  updateTable,
  deleteTable,
  setLoading,
  setError,
  setFilters,
  resetFilters,
} = tablesSlice.actions;

// Selectors
export const selectAllTables = (state) => state.tables.tables;
export const selectTablesLoading = (state) => state.tables.loading;
export const selectTablesFilters = (state) => state.tables.filters;

export const selectFilteredTables = (state) => {
  const tables = Array.isArray(state.tables.tables) ? state.tables.tables : [];
  const { location, status, search } = state.tables.filters;

  let filtered = [...tables];

  if (location && location !== 'All') {
    filtered = filtered.filter((t) => t.location === location);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.tableNumber?.toString().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }

  return filtered.sort((a, b) => a.tableNumber - b.tableNumber);
};

export const selectTableStats = (state) => {
  const tables = Array.isArray(state.tables.tables) ? state.tables.tables : [];
  return {
    total: tables.length,
    available: tables.filter((t) => t.status === 'Available' && t.isActive).length,
    reserved: tables.filter((t) => t.status === 'Reserved').length,
    maintenance: tables.filter((t) => t.status === 'Maintenance').length,
    totalCapacity: tables.reduce((sum, t) => sum + (t.capacity || 0), 0),
  };
};

export default tablesSlice.reducer;
