import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';

// Sensible defaults mirror the backend Settings model defaults
const DEFAULT_SETTINGS = {
  restaurant: {
    name: 'Bites Restaurant',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    openingTime: '09:00',
    closingTime: '23:00',
  },
  currency: { code: 'PKR', symbol: 'Rs' },
  ordering: {
    deliveryFee: 50,
    minOrderAmount: 0,
    acceptingOrders: true,
    estimatedDelivery: '30-45 mins',
  },
  reservations: {
    acceptingReservations: true,
    maxPartySize: 10,
    advanceBookingDays: 30,
    slotDurationMins: 60,
  },
};

export const fetchPublicSettings = createAsyncThunk(
  'settings/fetchPublic',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/settings/public');
      return res.settings || res;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to load settings');
    }
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    ...DEFAULT_SETTINGS,
    loaded: false,
    error: null,
  },
  reducers: {
    // Allow the AdminSystemSettings page to push updates into Redux
    // after a successful save, so the whole app reflects changes immediately.
    applySettings(state, action) {
      const s = action.payload;
      if (s.restaurant)   Object.assign(state.restaurant,   s.restaurant);
      if (s.currency)     Object.assign(state.currency,     s.currency);
      if (s.ordering)     Object.assign(state.ordering,     s.ordering);
      if (s.reservations) Object.assign(state.reservations, s.reservations);
      state.loaded = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        const s = action.payload;
        if (s.restaurant)   Object.assign(state.restaurant,   s.restaurant);
        if (s.currency)     Object.assign(state.currency,     s.currency);
        if (s.ordering)     Object.assign(state.ordering,     s.ordering);
        if (s.reservations) Object.assign(state.reservations, s.reservations);
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => {
        // Keep defaults on failure — app still works
        state.loaded = true;
        state.error = action.payload;
      });
  },
});

export const { applySettings } = settingsSlice.actions;
export default settingsSlice.reducer;
