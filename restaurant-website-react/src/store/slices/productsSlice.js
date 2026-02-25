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
      const products = (Array.isArray(action.payload) ? action.payload : []).map(p => ({
        ...p,
        id: p.id || p._id // Ensure every product has an id property
      }));
      state.products = products;
      state.categories = [...new Set(products.map((p) => p.category))];
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
      const product = { ...action.payload, id: action.payload.id || action.payload._id };
      state.products.push(product);
      if (!state.categories.includes(product.category)) {
        state.categories.push(product.category);
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
