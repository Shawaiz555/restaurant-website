import { createSlice } from '@reduxjs/toolkit';

const wastageSlice = createSlice({
  name: 'wastage',
  initialState: {
    records: [],
    stats: {
      today: { count: 0, estimatedCost: 0 },
      thisWeek: { count: 0, estimatedCost: 0 },
      thisMonth: { count: 0, estimatedCost: 0 },
      byReason: []
    },
    loading: false,
    error: null
  },
  reducers: {
    setWastage(state, action) {
      state.records = action.payload.map((w) => ({ ...w, id: w._id || w.id }));
    },
    addWastage(state, action) {
      state.records.unshift({ ...action.payload, id: action.payload._id || action.payload.id });
    },
    deleteWastage(state, action) {
      state.records = state.records.filter((w) => w.id !== action.payload);
    },
    setWastageStats(state, action) {
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
  setWastage, addWastage, deleteWastage, setWastageStats, setLoading, setError
} = wastageSlice.actions;

export const selectAllWastage = (state) => state.wastage.records;
export const selectWastageStats = (state) => state.wastage.stats;
export const selectWastageLoading = (state) => state.wastage.loading;

export default wastageSlice.reducer;
