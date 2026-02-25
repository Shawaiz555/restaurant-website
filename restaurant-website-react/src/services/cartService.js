import apiClient from './apiClient';

class CartService {
  // For logged-in users, cart is managed on the server
  async getCart() {
    try {
      const response = await apiClient.get('/users/cart');
      return response.cart || [];
    } catch (error) {
      console.error('Get cart error:', error);
      return [];
    }
  }

  async updateCart(cart) {
    try {
      const response = await apiClient.put('/users/cart', { cart });
      return {
        success: true,
        cart: response.cart
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async clearCart() {
    try {
      const response = await apiClient.delete('/users/cart');
      return {
        success: true,
        cart: response.cart
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // For guest users, cart is still managed in localStorage
  getGuestCart() {
    try {
      const cart = localStorage.getItem('guestCart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      return [];
    }
  }

  saveGuestCart(cart) {
    try {
      localStorage.setItem('guestCart', JSON.stringify(cart));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  clearGuestCart() {
    localStorage.removeItem('guestCart');
  }
}

const cartService = new CartService();
export default cartService;
