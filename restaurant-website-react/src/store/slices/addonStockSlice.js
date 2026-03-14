import { createSlice } from '@reduxjs/toolkit';

const addonStockSlice = createSlice({
  name: 'addonStock',
  initialState: {
    addonStocks: [],
    stats: { total: 0, lowStock: 0, outOfStock: 0, typeBreakdown: [] },
    loading: false,
    error: null,
  },
  reducers: {
    setAddonStocks(state, action) {
      state.addonStocks = action.payload.map((a) => ({ ...a, id: a._id || a.id }));
    },
    addAddonStock(state, action) {
      state.addonStocks.unshift({ ...action.payload, id: action.payload._id || action.payload.id });
    },
    updateAddonStock(state, action) {
      const updated = { ...action.payload, id: action.payload._id || action.payload.id };
      const idx = state.addonStocks.findIndex((a) => a.id === updated.id);
      if (idx !== -1) state.addonStocks[idx] = updated;
    },
    deleteAddonStock(state, action) {
      state.addonStocks = state.addonStocks.filter((a) => a.id !== action.payload);
    },
    setAddonStockStats(state, action) {
      state.stats = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setAddonStocks, addAddonStock, updateAddonStock, deleteAddonStock,
  setAddonStockStats, setLoading, setError,
} = addonStockSlice.actions;

export const selectAllAddonStocks = (state) => state.addonStock.addonStocks;
export const selectAddonStockStats = (state) => state.addonStock.stats;
export const selectAddonStockLoading = (state) => state.addonStock.loading;

export default addonStockSlice.reducer;
