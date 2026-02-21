import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
  isInitialized: false,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.categories = [...new Set(action.payload.map((p) => p.category))];
      state.loading = false;
      state.isInitialized = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addProduct: (state, action) => {
      state.products.push(action.payload);
      if (!state.categories.includes(action.payload.category)) {
        state.categories.push(action.payload.category);
      }
    },
    updateProduct: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.products.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updates };
        // Update categories if changed
        state.categories = [...new Set(state.products.map((p) => p.category))];
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
      // Update categories
      state.categories = [...new Set(state.products.map((p) => p.category))];
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
});

export const {
  setProducts,
  setLoading,
  setError,
  addProduct,
  updateProduct,
  deleteProduct,
  setInitialized,
} = productsSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectCategories = (state) => state.products.categories;
export const selectLoading = (state) => state.products.loading;
export const selectIsInitialized = (state) => state.products.isInitialized;

export const selectProductsByCategory = (category) => (state) => {
  return state.products.products.filter((p) => p.category === category);
};

export const selectProductById = (id) => (state) => {
  return state.products.products.find((p) => p.id === id);
};

export default productsSlice.reducer;
