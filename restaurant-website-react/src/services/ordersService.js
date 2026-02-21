class OrdersService {
  // Get all orders from localStorage
  getOrders() {
    try {
      const orders = localStorage.getItem('orders');
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Error reading orders:', error);
      return [];
    }
  }

  // Get single order by ID
  getOrderById(orderId) {
    const orders = this.getOrders();
    return orders.find((o) => o.orderId === orderId);
  }

  // Save orders to localStorage
  saveOrders(orders) {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
      return true;
    } catch (error) {
      console.error('Error saving orders:', error);
      return false;
    }
  }

  // Update order status
  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.orderId === orderId);

    if (orderIndex === -1) {
      return { success: false, message: 'Order not found' };
    }

    // Add status history tracking
    if (!orders[orderIndex].statusHistory) {
      orders[orderIndex].statusHistory = [];
    }

    orders[orderIndex].statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
    });

    orders[orderIndex].status = newStatus;
    orders[orderIndex].updatedAt = new Date().toISOString();

    this.saveOrders(orders);

    return {
      success: true,
      message: 'Order status updated successfully',
      order: orders[orderIndex],
    };
  }

  // Delete order
  deleteOrder(orderId) {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.orderId !== orderId);

    if (filtered.length === orders.length) {
      return { success: false, message: 'Order not found' };
    }

    this.saveOrders(filtered);
    return { success: true, message: 'Order deleted successfully' };
  }

  // Search orders
  searchOrders(query) {
    const orders = this.getOrders();
    const searchLower = query.toLowerCase();

    return orders.filter(
      (order) =>
        order.orderId?.toLowerCase().includes(searchLower) ||
        order.customerInfo?.name?.toLowerCase().includes(searchLower) ||
        order.customerInfo?.email?.toLowerCase().includes(searchLower) ||
        order.customerInfo?.phone?.includes(searchLower)
    );
  }

  // Get order statistics
  getOrderStats() {
    const orders = this.getOrders();

    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      processing: orders.filter((o) => o.status === 'Processing').length,
      completed: orders.filter((o) => o.status === 'Completed').length,
      cancelled: orders.filter((o) => o.status === 'Cancelled').length,
      guestOrders: orders.filter((o) => o.isGuestOrder).length,
      registeredOrders: orders.filter((o) => !o.isGuestOrder).length,
    };
  }

  // Get total revenue
  getTotalRevenue() {
    const orders = this.getOrders();
    return orders
      .filter((o) => o.status === 'Completed')
      .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
  }

  // Get revenue by date range
  getRevenueByDateRange(startDate, endDate) {
    const orders = this.getOrders();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return orders
      .filter((o) => {
        const orderDate = new Date(o.orderDate);
        return (
          o.status === 'Completed' && orderDate >= start && orderDate <= end
        );
      })
      .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
  }

  // Get recent orders
  getRecentOrders(limit = 10) {
    const orders = this.getOrders();
    return orders
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, limit);
  }
}

const ordersService = new OrdersService();
export default ordersService;
