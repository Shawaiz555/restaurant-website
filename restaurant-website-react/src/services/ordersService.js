import apiClient from './apiClient';

class OrdersService {
  async getOrders(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/orders?${queryParams}` : '/orders';
      const response = await apiClient.get(endpoint);
      return response.orders || [];
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.order;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }

  async placeOrder(orderData) {
    try {
      const response = await apiClient.post('/orders', orderData);
      return {
        success: true,
        message: response.message,
        order: response.order,
        emailStatus: response.emailStatus
      };
    } catch (error) {
      console.error('Place order error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.put(`/orders/${orderId}/status`, { status });
      return {
        success: true,
        message: response.message,
        order: response.order
      };
    } catch (error) {
      console.error('Update order status error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async deleteOrder(orderId) {
    try {
      const response = await apiClient.delete(`/orders/${orderId}`);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Delete order error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async getOrderStats() {
    try {
      const response = await apiClient.get('/orders/stats/summary');
      const backendStats = response.stats || {};

      // Normalize to support both formats (backend camelCase and frontend expected short names)
      return {
        ...backendStats,
        total: backendStats.totalOrders || 0,
        pending: backendStats.pendingOrders || 0,
        processing: backendStats.processingOrders || 0,
        completed: backendStats.completedOrders || 0,
        cancelled: backendStats.cancelledOrders || 0,
        revenue: backendStats.totalRevenue || 0
      };
    } catch (error) {
      console.error('Get order stats error:', error);
      throw error;
    }
  }

  // Client-side search (for backward compatibility)
  searchOrders(orders = [], query) {
    if (!query || !Array.isArray(orders)) return orders || [];

    const lowerQuery = query.toLowerCase();
    return orders.filter(order =>
      order.orderId.toLowerCase().includes(lowerQuery) ||
      order.customerInfo.fullName.toLowerCase().includes(lowerQuery) ||
      order.customerInfo.email.toLowerCase().includes(lowerQuery) ||
      order.customerInfo.phone.includes(lowerQuery)
    );
  }

  // Helper methods for stats (client-side calculations for backward compatibility)
  getTotalRevenue(orders = []) {
    if (!Array.isArray(orders)) return 0;
    return orders
      .filter(order => order && order.status === 'Completed')
      .reduce((total, order) => total + (parseFloat(order.total) || 0), 0);
  }

  getRecentOrders(orders = [], limit = 5) {
    if (!Array.isArray(orders)) return [];
    return [...orders]
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, limit);
  }
}

const ordersService = new OrdersService();
export default ordersService;
