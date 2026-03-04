import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';

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
      // For logged-in users, cart is managed on server now
      // This is just a local fallback
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

// Async thunks for server-side cart management
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      return await cartService.getCart();
    } else {
      return cartService.getGuestCart();
    }
  }
);

export const syncCartToServer = createAsyncThunk(
  'cart/syncCartToServer',
  async (cart, { getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      const result = await cartService.updateCart(cart);
      if (result.success) {
        return result.cart;
      }
      throw new Error(result.message);
    }
    // For guests, just save locally
    cartService.saveGuestCart(cart);
    return cart;
  }
);

export const clearServerCart = createAsyncThunk(
  'cart/clearServerCart',
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      const result = await cartService.clearCart();
      if (result.success) {
        return result.cart;
      }
      throw new Error(result.message);
    }
    // For guests, just clear locally
    cartService.clearGuestCart();
    return [];
  }
);

const initialState = {
  items: [],
  isOpen: false,
  loading: false,
  error: null,
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
    addDealToCart: (state, action) => {
      const { deal, userId } = action.payload;
      // Each deal gets its own cart entry keyed by dealId; adding again increments qty
      const cartItemId = `deal__${deal._id}`;
      const existingItem = state.items.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id: deal._id,
          cartItemId,
          name: deal.title,
          price: deal.price,
          quantity: 1,
          image: null, // deals use a gift-box placeholder; GridFS images can't be embedded
          isDeal: true,
          dealId: deal._id,
          dealTitle: deal.title,
          dealItems: deal.items || [],
        });
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
    setCartItems: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Sync cart to server
      .addCase(syncCartToServer.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(syncCartToServer.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Clear cart
      .addCase(clearServerCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clearServerCart.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { loadCart, addToCart, addDealToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
