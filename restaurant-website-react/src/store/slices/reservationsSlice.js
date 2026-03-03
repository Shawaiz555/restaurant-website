import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reservations: [],
  loading: false,
  error: null,
  filters: {
    status: 'All',
    date: '',
    search: '',
  },
};

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    setReservations: (state, action) => {
      state.reservations = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    addReservation: (state, action) => {
      state.reservations.unshift(action.payload);
    },
    updateReservationStatus: (state, action) => {
      const { reservationId, status } = action.payload;
      const res = state.reservations.find(
        (r) => r._id === reservationId || r.id === reservationId
      );
      if (res) {
        res.status = status;
        res.statusHistory = res.statusHistory || [];
        res.statusHistory.push({ status, timestamp: new Date().toISOString() });
      }
    },
    deleteReservation: (state, action) => {
      const id = action.payload;
      state.reservations = state.reservations.filter(
        (r) => r._id !== id && r.id !== id
      );
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
  setReservations,
  addReservation,
  updateReservationStatus,
  deleteReservation,
  setLoading,
  setError,
  setFilters,
  resetFilters,
} = reservationsSlice.actions;

// Selectors
export const selectAllReservations = (state) => state.reservations.reservations;
export const selectReservationsLoading = (state) => state.reservations.loading;
export const selectReservationsFilters = (state) => state.reservations.filters;

export const selectFilteredReservations = (state) => {
  const reservations = Array.isArray(state.reservations.reservations)
    ? state.reservations.reservations
    : [];
  const { status, date, search } = state.reservations.filters;

  let filtered = [...reservations];

  if (status && status !== 'All') {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (date) {
    filtered = filtered.filter((r) => r.reservationDate === date);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.fullName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.reservationId?.toLowerCase().includes(q) ||
        r.phone?.includes(q)
    );
  }

  return filtered.sort((a, b) => {
    const dateCompare = b.reservationDate?.localeCompare(a.reservationDate) || 0;
    if (dateCompare !== 0) return dateCompare;
    return b.reservationTime?.localeCompare(a.reservationTime) || 0;
  });
};

export const selectReservationStats = (state) => {
  const reservations = Array.isArray(state.reservations.reservations)
    ? state.reservations.reservations
    : [];
  const today = new Date().toISOString().split('T')[0];
  return {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'Pending').length,
    confirmed: reservations.filter((r) => r.status === 'Confirmed').length,
    cancelled: reservations.filter((r) => r.status === 'Cancelled').length,
    completed: reservations.filter((r) => r.status === 'Completed').length,
    today: reservations.filter((r) => r.reservationDate === today).length,
  };
};

export default reservationsSlice.reducer;
