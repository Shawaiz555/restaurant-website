import ordersService from './ordersService';
import expensesService from './expensesService';

class AnalyticsService {
  // Get revenue data for a date range
  getRevenueData(dateRange = 'week') {
    const orders = ordersService.getOrders();
    const completedOrders = orders.filter((o) => o.status === 'Completed');

    const now = new Date();
    let startDate;

    if (dateRange === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (dateRange === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate = new Date(0); // All time
    }

    // Group revenue by date
    const revenueByDate = {};
    let totalRevenue = 0;

    completedOrders.forEach((order) => {
      const orderDate = new Date(order.orderDate);
      if (orderDate >= startDate) {
        const dateKey = orderDate.toISOString().split('T')[0];
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = 0;
        }
        const revenue = parseFloat(order.total) || 0;
        revenueByDate[dateKey] += revenue;
        totalRevenue += revenue;
      }
    });

    return {
      totalRevenue,
      revenueByDate,
      orderCount: completedOrders.filter(
        (o) => new Date(o.orderDate) >= startDate
      ).length,
    };
  }

  // Get top selling products
  getTopProducts(limit = 10) {
    const orders = ordersService.getOrders();
    const productCount = {};
    const productRevenue = {};

    orders
      .filter((o) => o.status === 'Completed')
      .forEach((order) => {
        order.items?.forEach((item) => {
          const productName = item.name || 'Unknown';
          const quantity = item.quantity || 1;
          const price = parseFloat(item.price) || 0;

          if (!productCount[productName]) {
            productCount[productName] = 0;
            productRevenue[productName] = 0;
          }

          productCount[productName] += quantity;
          productRevenue[productName] += price * quantity;
        });
      });

    // Convert to array and sort by count
    const topProducts = Object.keys(productCount)
      .map((name) => ({
        name,
        count: productCount[name],
        revenue: productRevenue[name],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return topProducts;
  }

  // Get order statistics
  getOrderStats() {
    const stats = ordersService.getOrderStats();
    const orders = ordersService.getOrders();

    const completedOrders = orders.filter((o) => o.status === 'Completed');
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (parseFloat(o.total) || 0),
      0
    );

    const averageOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    return {
      ...stats,
      totalRevenue,
      averageOrderValue,
    };
  }

  // Get customer statistics
  getCustomerStats() {
    const orders = ordersService.getOrders();
    const uniqueCustomers = new Set();
    const customerOrderCount = {};

    orders.forEach((order) => {
      const email = order.customerInfo?.email;
      if (email) {
        uniqueCustomers.add(email);
        if (!customerOrderCount[email]) {
          customerOrderCount[email] = 0;
        }
        customerOrderCount[email]++;
      }
    });

    const totalCustomers = uniqueCustomers.size;
    const guestOrders = orders.filter((o) => o.isGuestOrder).length;
    const registeredOrders = orders.length - guestOrders;

    // Calculate average orders per customer
    const avgOrdersPerCustomer =
      totalCustomers > 0 ? orders.length / totalCustomers : 0;

    return {
      totalCustomers,
      guestOrders,
      registeredOrders,
      avgOrdersPerCustomer: avgOrdersPerCustomer.toFixed(2),
    };
  }

  // Get revenue vs expenses comparison
  getRevenueVsExpenses(dateRange = 'month') {
    const revenueData = this.getRevenueData(dateRange);
    const expenseSummary = expensesService.calculateTotals(dateRange);

    const profit = revenueData.totalRevenue - expenseSummary.total;
    const profitMargin =
      revenueData.totalRevenue > 0
        ? (profit / revenueData.totalRevenue) * 100
        : 0;

    return {
      revenue: revenueData.totalRevenue,
      expenses: expenseSummary.total,
      profit,
      profitMargin: profitMargin.toFixed(2),
    };
  }

  // Get peak ordering times (hour of day analysis)
  getPeakOrderingTimes() {
    const orders = ordersService.getOrders();
    const hourlyOrders = Array(24).fill(0);

    orders.forEach((order) => {
      const hour = new Date(order.orderDate).getHours();
      hourlyOrders[hour]++;
    });

    return hourlyOrders.map((count, hour) => ({
      hour: `${hour}:00`,
      orders: count,
    }));
  }

  // Get revenue by category
  getRevenueByCategory() {
    const orders = ordersService.getOrders();
    const categoryRevenue = {};

    orders
      .filter((o) => o.status === 'Completed')
      .forEach((order) => {
        order.items?.forEach((item) => {
          // You might need to enhance this with actual product category data
          const category = item.category || 'Other';
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = 0;
          }
          categoryRevenue[category] += parseFloat(item.price) || 0;
        });
      });

    return Object.keys(categoryRevenue).map((category) => ({
      category,
      revenue: categoryRevenue[category],
    }));
  }

  // Get dashboard summary
  getDashboardSummary() {
    const orderStats = this.getOrderStats();
    const expenseSummary = expensesService.getSummary();
    const topProducts = this.getTopProducts(5);
    const customerStats = this.getCustomerStats();

    return {
      orders: orderStats,
      expenses: expenseSummary,
      topProducts,
      customers: customerStats,
      profit:
        orderStats.totalRevenue - (expenseSummary.thisMonth?.total || 0),
    };
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
