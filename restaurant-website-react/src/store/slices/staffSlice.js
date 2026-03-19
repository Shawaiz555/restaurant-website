import { createSlice } from '@reduxjs/toolkit';

const staffSlice = createSlice({
  name: 'staff',
  initialState: {
    staff: [],
    liveSessions: [],
    loading: false,
    error: null,
  },
  reducers: {
    setStaff(state, action) {
      state.staff = action.payload.map((m) => ({ ...m, id: m._id || m.id }));
    },
    addStaffMember(state, action) {
      state.staff.unshift({ ...action.payload, id: action.payload._id || action.payload.id });
    },
    updateStaffMember(state, action) {
      const updated = { ...action.payload, id: action.payload._id || action.payload.id };
      const idx = state.staff.findIndex((m) => m.id === updated.id);
      if (idx !== -1) state.staff[idx] = { ...state.staff[idx], ...updated };
    },
    setLiveSessions(state, action) {
      state.liveSessions = action.payload;
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
  setStaff,
  addStaffMember,
  updateStaffMember,
  setLiveSessions,
  setLoading,
  setError,
} = staffSlice.actions;

export const selectAllStaff = (state) => state.staff.staff;
export const selectLiveSessions = (state) => state.staff.liveSessions;
export const selectStaffLoading = (state) => state.staff.loading;

export default staffSlice.reducer;
