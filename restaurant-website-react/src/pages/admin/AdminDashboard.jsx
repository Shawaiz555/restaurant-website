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
import {
  DollarSign,
  ShoppingBag,
  Pizza,
  Receipt,
  Plus,
  Package,
  TrendingUp,
  BarChart2,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";

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
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);

  const loadDashboardData = React.useCallback(async () => {
    try {
      // Load orders
      const orders = (await ordersService.getOrders()) || [];
      dispatch(setOrders(orders));

      // Load products
      const products = (await productsService.fetchProducts()) || [];
      // If products is the response object { success, products }, extract it
      const productsArray = products.products || products;
      dispatch(setProducts(productsArray));

      // Load expenses
      const expenses = (await expensesService.getExpenses()) || [];
      dispatch(setExpenses(expenses));
      dispatch(calculateSummary());

      // Calculate stats using analytics service (now async)
      const orderStats = (await analyticsService.getOrderStats()) || {}; // Ensure orderStats is an object
      const totalRevenue = ordersService.getTotalRevenue(orders); // Synchronous helper
      const expenseSummary = await expensesService.getSummary();

      setStats({
        revenue: totalRevenue,
        orders: orderStats.total || 0, // Add fallback
        pendingOrders: orderStats.pending || 0, // Add fallback
        products: productsArray.length,
        expenses:
          expenseSummary?.thisMonth?.total || expenseSummary?.total || 0,
      });

      // Get recent orders
      const recent = ordersService.getRecentOrders(orders, 5);
      setRecentOrders(recent);

      // Get top products
      const top = await analyticsService.getTopProducts(5);
      setTopProducts(top);

      // Calculate revenue trend for last 7 days
      const trend = calculateRevenueTrend(orders);
      setRevenueTrend(trend);

      // Calculate order status distribution
      const distribution = calculateOrderStatusDistribution(orderStats);
      setOrderStatusDistribution(distribution);
    } catch (error) {
      console.error("Dashboard data load error:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const calculateRevenueTrend = (orders) => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.orderDate)
            .toISOString()
            .split("T")[0];
          return orderDate === dateStr && order.status === "Completed";
        })
        .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

      last7Days.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: dayRevenue,
      });
    }

    return last7Days;
  };

  const calculateOrderStatusDistribution = (orderStats) => {
    if (!orderStats) return [];
    return [
      {
        status: "Pending",
        count: parseInt(orderStats.pending || 0),
        color: "#FCD34D",
        icon: Clock,
      },
      {
        status: "Processing",
        count: parseInt(orderStats.processing || 0),
        color: "#60A5FA",
        icon: RefreshCw,
      },
      {
        status: "Completed",
        count: parseInt(orderStats.completed || 0),
        color: "#34D399",
        icon: CheckCircle,
      },
      {
        status: "Cancelled",
        count: parseInt(orderStats.cancelled || 0),
        color: "#F87171",
        icon: XCircle,
      },
    ];
  };

  const formatCurrency = (amount) => {
    return `Rs ${parseFloat(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h1 className="text-2xl lg:text-4xl font-bold font-sans text-primary mb-2">
          Dashboard
        </h1>
        <p className="text-dark-gray">Welcome to your restaurant admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats.revenue)}
          onClick={() => navigate("/admin/analytics")}
        />
        <StatsCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.orders}
          change={
            stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : null
          }
          trend={stats.pendingOrders > 0 ? "up" : "neutral"}
          onClick={() => navigate("/admin/orders")}
        />
        <StatsCard
          icon={Pizza}
          label="Active Products"
          value={stats.products}
          onClick={() => navigate("/admin/products")}
        />
        <StatsCard
          icon={Receipt}
          label="Monthly Expenses"
          value={formatCurrency(stats.expenses)}
          onClick={() => navigate("/admin/expenses")}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-sans font-bold text-dark mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/admin/products/new")}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            <span className="font-semibold">Add New Product</span>
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            <Package className="w-6 h-6" />
            <span className="font-semibold">View All Orders</span>
          </button>
          <button
            onClick={() => navigate("/admin/expenses")}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-gray-300 text-dark hover:bg-cream transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            <DollarSign className="w-6 h-6" />
            <span className="font-semibold">Record Expense</span>
          </button>
        </div>
      </div>

      {/* Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Graph */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-sans font-bold text-dark">
              Revenue Trend (Last 7 Days)
            </h2>
            <TrendingUp className="w-5 h-5 text-dark-gray" />
          </div>

          {revenueTrend.length === 0 ||
          revenueTrend.every((d) => d.revenue === 0) ? (
            <div className="text-center py-12 text-dark-gray">
              <BarChart2 className="w-12 h-12 mx-auto mb-2 text-dark-gray/40" />
              <p>No revenue data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="relative h-64 flex items-end justify-between gap-2 px-2">
                {revenueTrend.map((day, index) => {
                  const maxRevenue = Math.max(
                    ...revenueTrend.map((d) => d.revenue),
                    1,
                  );
                  const heightPercent = (day.revenue / maxRevenue) * 100;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      {/* Bar */}
                      <div className="w-full flex flex-col items-center">
                        <span className="text-xs font-bold text-primary mb-1">
                          {day.revenue > 0
                            ? `Rs ${day.revenue.toFixed(0)}`
                            : ""}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg transition-all duration-500 hover:from-primary-dark hover:to-primary shadow-md relative group"
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                            {formatCurrency(day.revenue)}
                          </div>
                        </div>
                      </div>
                      {/* Date Label */}
                      <span className="text-xs text-dark-gray font-medium mt-1 text-center">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-dark-gray">
                  <span className="font-semibold">Total:</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(
                    revenueTrend.reduce((sum, d) => sum + d.revenue, 0),
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-sans font-bold text-dark">
              Order Status Distribution
            </h2>
            <BarChart2 className="w-5 h-5 text-dark-gray" />
          </div>

          {orderStatusDistribution.every((s) => s.count === 0) ? (
            <div className="text-center py-12 text-dark-gray">
              <Package className="w-12 h-12 mx-auto mb-2 text-dark-gray/40" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Donut Chart Representation */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  {/* Background Circle */}
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {(() => {
                      const total = orderStatusDistribution.reduce(
                        (sum, s) => sum + s.count,
                        0,
                      );
                      let currentPercent = 0;

                      return orderStatusDistribution.map((item, index) => {
                        if (item.count === 0) return null;

                        const percent = (item.count / total) * 100;
                        const offset = currentPercent;
                        currentPercent += percent;

                        // Circle parameters
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -(
                          (offset / 100) *
                          circumference
                        );

                        return (
                          <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                  </svg>

                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-dark">
                      {orderStatusDistribution.reduce(
                        (sum, s) => sum + s.count,
                        0,
                      )}
                    </span>
                    <span className="text-xs text-dark-gray font-medium">
                      Total Orders
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {orderStatusDistribution.map((item, index) => {
                  const total = orderStatusDistribution.reduce(
                    (sum, s) => sum + s.count,
                    0,
                  );
                  const percentage =
                    total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-cream-light rounded-xl hover:bg-cream transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium text-dark flex items-center gap-1.5">
                          {React.createElement(item.icon, {
                            className: "w-3.5 h-3.5",
                            style: { color: item.color },
                          })}{" "}
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-dark-gray">
                          {percentage}%
                        </span>
                        <span className="text-sm font-bold text-primary min-w-[3rem] text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-sans font-bold text-dark">
              Recent Orders
            </h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-primary hover:text-primary-dark text-sm font-semibold transition-colors"
            >
              View All →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <Package className="w-12 h-12 mx-auto mb-2 text-dark-gray/40" />
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
            <h2 className="text-xl font-sans font-bold text-dark">
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
              <Pizza className="w-12 h-12 mx-auto mb-2 text-dark-gray/40" />
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
