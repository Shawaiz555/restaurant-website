import { createSlice } from '@reduxjs/toolkit';

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState: {
    purchases: [],
    stats: { totalPurchases: 0, thisMonthTotal: 0, thisMonthCount: 0, allTimeTotal: 0 },
    loading: false,
    error: null
  },
  reducers: {
    setPurchases(state, action) {
      state.purchases = action.payload.map((p) => ({ ...p, id: p._id || p.id }));
    },
    addPurchase(state, action) {
      state.purchases.unshift({ ...action.payload, id: action.payload._id || action.payload.id });
    },
    deletePurchase(state, action) {
      state.purchases = state.purchases.filter((p) => p.id !== action.payload);
    },
    setPurchaseStats(state, action) {
      state.stats = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    }
  }
});

export const {
  setPurchases, addPurchase, deletePurchase, setPurchaseStats, setLoading, setError
} = purchasesSlice.actions;

export const selectAllPurchases = (state) => state.purchases.purchases;
export const selectPurchaseStats = (state) => state.purchases.stats;
export const selectPurchasesLoading = (state) => state.purchases.loading;

export default purchasesSlice.reducer;
