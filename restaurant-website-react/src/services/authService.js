import apiClient from './apiClient';

class AuthService {
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password) {
    return password.length >= 6;
  }

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async login(email, password) {
    try {
      if (!email || !this.validateEmail(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      if (!password || !this.validatePassword(password)) {
        return { success: false, message: 'Password must be at least 6 characters long' };
      }

      const response = await apiClient.post('/auth/login', { email, password });

      if (response.success) {
        // Store token
        apiClient.setToken(response.accessToken);

        // Store user in localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(response.user));

        return {
          success: true,
          message: response.message,
          user: response.user
        };
      }

      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout');

      // Clear local data
      apiClient.setToken(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('guestCart'); // Clear guest cart on logout

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Clear local data even if request fails
      apiClient.setToken(null);
      localStorage.removeItem('currentUser');
      return { success: false, message: error.message };
    }
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }
}

const authService = new AuthService();
export default authService;
