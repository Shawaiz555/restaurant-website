// ===== Authentication Service =====
// Handles user registration, login, logout, and session management

class AuthService {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  // Initialize the auth service
  init() {
    const sessionUser = this.getSessionUser();
    if (sessionUser) {
      this.currentUser = sessionUser;
    }
  }

  // Get all users from localStorage
  getAllUsers() {
    try {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } catch (e) {
      console.error('Error reading users from localStorage', e);
      return [];
    }
  }

  // Save users to localStorage
  saveUsers(users) {
    try {
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Error saving users to localStorage', e);
      return false;
    }
  }

  // Get current session user
  getSessionUser() {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Error reading current user from localStorage', e);
      return null;
    }
  }

  // Save current session user
  saveSessionUser(user) {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser = user;
      return true;
    } catch (e) {
      console.error('Error saving current user to localStorage', e);
      return false;
    }
  }

  // Clear session
  clearSession() {
    try {
      localStorage.removeItem('currentUser');
      this.currentUser = null;
      return true;
    } catch (e) {
      console.error('Error clearing session', e);
      return false;
    }
  }

  // Validate email format
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    // At least 6 characters
    return password.length >= 6;
  }

  // Check if email already exists
  emailExists(email) {
    const users = this.getAllUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Register new user
  register(userData) {
    const { name, email, password } = userData;

    // Validate input
    if (!name || name.trim().length === 0) {
      return { success: false, message: 'Name is required' };
    }

    if (!email || !this.validateEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    if (!password || !this.validatePassword(password)) {
      return { success: false, message: 'Password must be at least 6 characters long' };
    }

    // Check if email already exists
    if (this.emailExists(email)) {
      return { success: false, message: 'An account with this email already exists' };
    }

    // Create new user
    const newUser = {
      id: this.generateUserId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
      cart: []
    };

    // Save to users list
    const users = this.getAllUsers();
    users.push(newUser);
    this.saveUsers(users);

    return { success: true, message: 'Registration successful! Please login to continue.' };
  }

  // Login user
  login(email, password) {
    // Validate input
    if (!email || !this.validateEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    if (!password) {
      return { success: false, message: 'Password is required' };
    }

    // Find user
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u =>
      u.email.toLowerCase() === email.toLowerCase().trim() &&
      u.password === password
    );

    if (userIndex === -1) {
      return { success: false, message: 'Invalid email or password' };
    }

    const user = users[userIndex];

    // Merge guest cart with user cart
    try {
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        const guestCartItems = JSON.parse(guestCart);
        if (guestCartItems.length > 0) {
          // Get user's existing cart
          const userCart = user.cart || [];

          // Merge carts - add guest items to user cart
          guestCartItems.forEach(guestItem => {
            const existingItem = userCart.find(item => item.id === guestItem.id);
            if (existingItem) {
              // Item already exists, increase quantity
              existingItem.quantity += guestItem.quantity;
            } else {
              // New item, add to cart
              userCart.push(guestItem);
            }
          });

          // Save merged cart to user
          users[userIndex].cart = userCart;
          this.saveUsers(users);

          // Clear guest cart
          localStorage.removeItem('guestCart');
        }
      }
    } catch (e) {
      console.error('Error merging guest cart:', e);
    }

    // Create session
    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
    this.saveSessionUser(userSession);

    return { success: true, message: 'Login successful!', user: userSession };
  }

  // Logout user
  logout() {
    this.clearSession();
    return { success: true, message: 'Logged out successfully' };
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Generate unique user ID
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get user's cart
  getUserCart(userId) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    return user ? user.cart : [];
  }

  // Save user's cart
  saveUserCart(userId, cart) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].cart = cart;
      this.saveUsers(users);
      return true;
    }
    return false;
  }

  // Update user profile
  updateProfile(userId, updates) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      // Only allow updating name
      if (updates.name) {
        users[userIndex].name = updates.name.trim();
        this.saveUsers(users);

        // Update session if it's the current user
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser.name = updates.name.trim();
          this.saveSessionUser(this.currentUser);
        }

        return { success: true, message: 'Profile updated successfully' };
      }
    }

    return { success: false, message: 'Failed to update profile' };
  }
}

// Create global instance
const authService = new AuthService();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}
