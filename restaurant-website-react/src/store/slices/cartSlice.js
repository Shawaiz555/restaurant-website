import { createSlice } from '@reduxjs/toolkit';

const getStoredCart = (userId) => {
  try {
    if (userId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.id === userId);
      return user?.cart || [];
    } else {
      const guestCart = localStorage.getItem('guestCart');
      return guestCart ? JSON.parse(guestCart) : [];
    }
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

const saveCart = (cart, userId) => {
  try {
    if (userId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].cart = cart;
        localStorage.setItem('users', JSON.stringify(users));
      }
    } else {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const initialState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadCart: (state, action) => {
      state.items = getStoredCart(action.payload);
    },
    addToCart: (state, action) => {
      const { product, userId } = action.payload;
      // Build a unique key from id + size + addOns + spiceLevel so different
      // customizations are treated as separate cart entries.
      const customizationKey = JSON.stringify({
        size: product.size,
        spiceLevel: product.spiceLevel?.id || null,
        drinks: (product.addOns?.drinks || []).map(d => ({ id: d.id, qty: d.quantity })),
        desserts: (product.addOns?.desserts || []).map(d => ({ id: d.id, qty: d.quantity })),
        extras: (product.addOns?.extras || []).map(e => ({ id: e.id, qty: e.quantity })),
      });
      const cartItemId = `${product.id}__${customizationKey}`;
      const existingItem = state.items.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1, cartItemId });
      }
      saveCart(state.items, userId);
    },
    removeFromCart: (state, action) => {
      const { cartItemId, userId } = action.payload;
      state.items = state.items.filter(item => item.cartItemId !== cartItemId);
      saveCart(state.items, userId);
    },
    updateQuantity: (state, action) => {
      const { cartItemId, quantity, userId } = action.payload;
      const item = state.items.find(item => item.cartItemId === cartItemId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.cartItemId !== cartItemId);
        } else {
          item.quantity = quantity;
        }
        saveCart(state.items, userId);
      }
    },
    clearCart: (state, action) => {
      state.items = [];
      saveCart([], action.payload);
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

export const { loadCart, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
