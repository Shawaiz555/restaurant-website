import { createSlice } from '@reduxjs/toolkit';

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState: {
    ingredients: [],
    stats: { total: 0, lowStock: 0, outOfStock: 0, categoryBreakdown: [] },
    loading: false,
    error: null
  },
  reducers: {
    setIngredients(state, action) {
      state.ingredients = action.payload.map((i) => ({ ...i, id: i._id || i.id }));
    },
    addIngredient(state, action) {
      state.ingredients.unshift({ ...action.payload, id: action.payload._id || action.payload.id });
    },
    updateIngredient(state, action) {
      const updated = { ...action.payload, id: action.payload._id || action.payload.id };
      const idx = state.ingredients.findIndex((i) => i.id === updated.id);
      if (idx !== -1) state.ingredients[idx] = updated;
    },
    deleteIngredient(state, action) {
      state.ingredients = state.ingredients.filter((i) => i.id !== action.payload);
    },
    setStats(state, action) {
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
  setIngredients, addIngredient, updateIngredient, deleteIngredient,
  setStats, setLoading, setError
} = ingredientsSlice.actions;

export const selectAllIngredients = (state) => state.ingredients.ingredients;
export const selectIngredientStats = (state) => state.ingredients.stats;
export const selectIngredientsLoading = (state) => state.ingredients.loading;

export default ingredientsSlice.reducer;
