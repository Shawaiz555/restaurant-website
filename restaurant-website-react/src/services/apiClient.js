class APIClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.accessToken = null;
  }

  setToken(token) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getToken() {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // Include cookies for refresh token
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      // Refresh failed, user needs to login
      this.setToken(null);
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Add authorization header if token exists and not already present
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add credentials for cookie handling
    if (options.credentials !== false) {
      config.credentials = 'include';
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 - Try to refresh token
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        try {
          await this.refreshAccessToken();
          // Retry original request with new token
          config.headers.Authorization = `Bearer ${this.getToken()}`;
          const retryResponse = await fetch(url, config);
          return await this.handleResponse(retryResponse);
        } catch (refreshError) {
          throw new Error('Session expired. Please login again.');
        }
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // File upload method (no Content-Type header, let browser set it)
  async uploadFile(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        ...options.headers
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    return await this.handleResponse(response);
  }
}

const apiClient = new APIClient();
export default apiClient;
