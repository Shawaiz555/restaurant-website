class AuthService {
  // Admin user credentials - seeded on app initialization
  ADMIN_USER = {
    id: 'admin_shawaiz',
    name: 'Muhammad Shawaiz',
    email: 'shawaizbutt555@gmail.com',
    password: 'Admin123',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    cart: []
  };

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password) {
    return password.length >= 6;
  }

  getAllUsers() {
    try {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } catch (e) {
      console.error('Error reading users:', e);
      return [];
    }
  }

  saveUsers(users) {
    try {
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Error saving users:', e);
      return false;
    }
  }

  emailExists(email) {
    const users = this.getAllUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize admin user on app startup
  initializeAdminUser() {
    const users = this.getAllUsers();
    const adminExists = users.find(u => u.email === this.ADMIN_USER.email);

    if (!adminExists) {
      users.push(this.ADMIN_USER);
      this.saveUsers(users);
      console.log('Admin user initialized successfully');
    }
  }

  register(userData) {
    const { name, email, password } = userData;

    if (!name || name.trim().length === 0) {
      return { success: false, message: 'Name is required' };
    }

    if (!email || !this.validateEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    if (!password || !this.validatePassword(password)) {
      return { success: false, message: 'Password must be at least 6 characters long' };
    }

    if (this.emailExists(email)) {
      return { success: false, message: 'An account with this email already exists' };
    }

    const newUser = {
      id: this.generateUserId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: 'user', // Default role for new users
      createdAt: new Date().toISOString(),
      cart: []
    };

    const users = this.getAllUsers();
    users.push(newUser);
    this.saveUsers(users);

    return { success: true, message: 'Registration successful! Please login to continue.' };
  }

  login(email, password) {
    if (!email || !this.validateEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    if (!password) {
      return { success: false, message: 'Password is required' };
    }

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
          const userCart = user.cart || [];

          guestCartItems.forEach(guestItem => {
            const existingItem = userCart.find(item => item.id === guestItem.id);
            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
            } else {
              userCart.push(guestItem);
            }
          });

          users[userIndex].cart = userCart;
          this.saveUsers(users);
          localStorage.removeItem('guestCart');
        }
      }
    } catch (e) {
      console.error('Error merging guest cart:', e);
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user', // Include role in session
      createdAt: user.createdAt
    };

    return { success: true, message: 'Login successful!', user: userSession };
  }
}

const authService = new AuthService();
export default authService;
