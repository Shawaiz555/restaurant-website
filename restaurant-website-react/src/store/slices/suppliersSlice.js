import { createSlice } from '@reduxjs/toolkit';

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState: {
    suppliers: [],
    loading: false,
    error: null
  },
  reducers: {
    setSuppliers(state, action) {
      state.suppliers = action.payload.map((s) => ({ ...s, id: s._id || s.id }));
    },
    addSupplier(state, action) {
      state.suppliers.unshift({ ...action.payload, id: action.payload._id || action.payload.id });
    },
    updateSupplier(state, action) {
      const updated = { ...action.payload, id: action.payload._id || action.payload.id };
      const idx = state.suppliers.findIndex((s) => s.id === updated.id);
      if (idx !== -1) state.suppliers[idx] = updated;
    },
    deleteSupplier(state, action) {
      state.suppliers = state.suppliers.filter((s) => s.id !== action.payload);
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
  setSuppliers, addSupplier, updateSupplier, deleteSupplier, setLoading, setError
} = suppliersSlice.actions;

export const selectAllSuppliers = (state) => state.suppliers.suppliers;
export const selectSuppliersLoading = (state) => state.suppliers.loading;

export default suppliersSlice.reducer;
