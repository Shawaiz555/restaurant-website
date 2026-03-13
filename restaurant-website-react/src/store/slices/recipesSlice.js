import { createSlice } from '@reduxjs/toolkit';

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    loading: false,
    error: null
  },
  reducers: {
    setRecipes(state, action) {
      state.recipes = action.payload.map((r) => ({ ...r, id: r._id || r.id }));
    },
    upsertRecipe(state, action) {
      const updated = { ...action.payload, id: action.payload._id || action.payload.id };
      const idx = state.recipes.findIndex((r) => r.id === updated.id);
      if (idx !== -1) {
        state.recipes[idx] = updated;
      } else {
        state.recipes.push(updated);
      }
    },
    deleteRecipe(state, action) {
      state.recipes = state.recipes.filter((r) => r.id !== action.payload);
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    }
  }
});

export const { setRecipes, upsertRecipe, deleteRecipe, setLoading, setError } = recipesSlice.actions;

export const selectAllRecipes = (state) => state.recipes.recipes;
export const selectRecipesLoading = (state) => state.recipes.loading;

export default recipesSlice.reducer;
