import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import StatsCard from "../../components/admin/common/StatsCard";
import StatusBadge from "../../components/admin/common/StatusBadge";
import { setOrders } from "../../store/slices/ordersSlice";
import { setProducts } from "../../store/slices/productsSlice";
import {
  setExpenses,
  calculateSummary,
} from "../../store/slices/expensesSlice";
import ordersService from "../../services/ordersService";
import productsService from "../../services/productsService";
import expensesService from "../../services/expensesService";
import analyticsService from "../../services/analyticsService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    pendingOrders: 0,
    products: 0,
    expenses: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load orders
    const orders = ordersService.getOrders();
    dispatch(setOrders(orders));

    // Load products
    const products = productsService.getProducts();
    dispatch(setProducts(products));

    // Load expenses
    const expenses = expensesService.getExpenses();
    dispatch(setExpenses(expenses));
    dispatch(calculateSummary());

    // Calculate stats
    const orderStats = ordersService.getOrderStats();
    const totalRevenue = ordersService.getTotalRevenue();
    const expenseSummary = expensesService.getSummary();

    setStats({
      revenue: totalRevenue,
      orders: orderStats.total,
      pendingOrders: orderStats.pending,
      products: products.length,
      expenses: expenseSummary.thisMonth.total,
    });

    // Get recent orders
    const recent = ordersService.getRecentOrders(5);
    setRecentOrders(recent);

    // Get top products
    const top = analyticsService.getTopProducts(5);
    setTopProducts(top);
  };

  const formatCurrency = (amount) => {
    return `Rs ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h1 className="text-3xl font-display text-primary mb-2">Dashboard</h1>
        <p className="text-dark-gray">Welcome to your restaurant admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon="💰"
          label="Total Revenue"
          value={formatCurrency(stats.revenue)}
          onClick={() => navigate("/admin/analytics")}
        />
        <StatsCard
          icon="📦"
          label="Total Orders"
          value={stats.orders}
          change={
            stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : null
          }
          trend={stats.pendingOrders > 0 ? "up" : "neutral"}
          onClick={() => navigate("/admin/orders")}
        />
        <StatsCard
          icon="🍕"
          label="Active Products"
          value={stats.products}
          onClick={() => navigate("/admin/products")}
        />
        <StatsCard
          icon="💸"
          label="Monthly Expenses"
          value={formatCurrency(stats.expenses)}
          onClick={() => navigate("/admin/expenses")}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-display text-dark mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/admin/products/new")}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span className="text-2xl">➕</span>
            <span className="font-semibold">Add New Product</span>
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            <span className="text-2xl">📦</span>
            <span className="font-semibold">View All Orders</span>
          </button>
          <button
            onClick={() => navigate("/admin/expenses/new")}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-gray-300 text-dark hover:bg-cream transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            <span className="text-2xl">💰</span>
            <span className="font-semibold">Record Expense</span>
          </button>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-dark">Recent Orders</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-primary hover:text-primary-dark text-sm font-semibold transition-colors"
            >
              View All →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <div className="text-4xl mb-2">📦</div>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between p-3 bg-cream-light rounded-xl hover:bg-cream transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/orders`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">
                      {order.customerInfo?.name || "Guest"}
                    </p>
                    <p className="text-xs text-dark-gray truncate">
                      {order.orderId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-sm font-bold text-primary whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-dark">
              Top Selling Products
            </h2>
            <button
              onClick={() => navigate("/admin/analytics")}
              className="text-primary hover:text-primary-dark text-sm font-semibold transition-colors"
            >
              View Analytics →
            </button>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <div className="text-4xl mb-2">🍕</div>
              <p>No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 bg-cream-light rounded-xl"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-dark-gray">
                        {product.count} sold
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary ml-3 whitespace-nowrap">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
