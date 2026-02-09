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
      const existingItem = state.items.find(item => item.id === product.id && item.size === product.size);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
      saveCart(state.items, userId);
    },
    removeFromCart: (state, action) => {
      const { productId, userId } = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      saveCart(state.items, userId);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity, userId } = action.payload;
      const item = state.items.find(item => item.id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== productId);
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
