import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import StatsCard from "../../../components/admin/common/StatsCard";
import StatusBadge from "../../../components/admin/common/StatusBadge";
import { setOrders } from "../../../store/slices/ordersSlice";
import { setProducts } from "../../../store/slices/productsSlice";
import { setExpenses, calculateSummary } from "../../../store/slices/expensesSlice";
import ordersService from "../../../services/ordersService";
import productsService from "../../../services/productsService";
import expensesService from "../../../services/expensesService";
import analyticsService from "../../../services/analyticsService";
import reservationsService from "../../../services/reservationsService";
import staffService from "../../../services/staffService";
import ingredientsService from "../../../services/ingredientsService";
import {
  DollarSign, ShoppingBag, Pizza, Receipt, CalendarCheck,
  Users, TrendingUp, BarChart2, Clock, RefreshCw, CheckCircle,
  XCircle, Plus, Package, AlertTriangle, Settings, UserCheck,
} from "lucide-react";

const formatCurrency = (amount) =>
  `Rs ${parseFloat(amount || 0).toFixed(2)}`;

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [stats, setStats] = useState({
    revenue: 0, orders: 0, pendingOrders: 0,
    products: 0, expenses: 0, reservations: 0,
    pendingReservations: 0, totalStaff: 0, lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [orderStatusDist, setOrderStatusDist] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateRevenueTrend = (orders) => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      const revenue = orders
        .filter((o) => new Date(o.orderDate).toISOString().split("T")[0] === dateStr && o.status === "Completed")
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      return { date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), revenue };
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [orders, productsRes, expenses, orderStats, expenseSummary, reservationStats, staffRes, lowStock] =
        await Promise.allSettled([
          ordersService.getOrders(),
          productsService.fetchProducts(),
          expensesService.getExpenses(),
          analyticsService.getOrderStats(),
          expensesService.getSummary(),
          reservationsService.getReservationStats(),
          staffService.getStaff(),
          ingredientsService.getLowStockIngredients(),
        ]);

      const ordersData = orders.value || [];
      const productsArr = productsRes.value?.products || productsRes.value || [];
      const expensesData = expenses.value || [];
      const orderStatsData = orderStats.value || {};
      const expSummary = expenseSummary.value || {};
      const resStats = reservationStats.value || {};
      const staffData = staffRes.value?.staff || [];
      const lowStockData = lowStock.value?.ingredients || [];

      dispatch(setOrders(ordersData));
      dispatch(setProducts(productsArr));
      dispatch(setExpenses(expensesData));
      dispatch(calculateSummary());

      setStats({
        revenue: ordersService.getTotalRevenue(ordersData),
        orders: orderStatsData.total || 0,
        pendingOrders: orderStatsData.pending || 0,
        products: productsArr.length,
        expenses: expSummary?.thisMonth?.total || expSummary?.total || 0,
        reservations: resStats.total || 0,
        pendingReservations: resStats.pending || 0,
        totalStaff: staffData.length,
        lowStockCount: lowStockData.length,
      });

      setRecentOrders(ordersService.getRecentOrders(ordersData, 5));
      setTopProducts(await analyticsService.getTopProducts(5));
      setRevenueTrend(calculateRevenueTrend(ordersData));
      setOrderStatusDist([
        { status: "Pending",    count: parseInt(orderStatsData.pending    || 0), color: "#FCD34D", icon: Clock },
        { status: "Processing", count: parseInt(orderStatsData.processing || 0), color: "#60A5FA", icon: RefreshCw },
        { status: "Completed",  count: parseInt(orderStatsData.completed  || 0), color: "#34D399", icon: CheckCircle },
        { status: "Cancelled",  count: parseInt(orderStatsData.cancelled  || 0), color: "#F87171", icon: XCircle },
      ]);

      // Live sessions
      const sessionsRes = await staffService.getLiveSessions().catch(() => ({ sessions: [] }));
      setLiveSessions(sessionsRes.sessions || []);
    } catch (err) {
      console.error("SuperAdmin dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow animate-pulse h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-sans text-primary mb-1">
              Super Admin Dashboard
            </h1>
            <p className="text-dark-gray">Full business overview & control center</p>
          </div>
          <button
            onClick={() => navigate("/admin/settings")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-dark hover:bg-primary hover:text-white transition-all text-sm font-semibold"
          >
            <Settings className="w-4 h-4" /> System Settings
          </button>
        </div>
      </div>

      {/* Stats Row 1 — Financial + Orders */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard icon={DollarSign}    label="Total Revenue"       value={formatCurrency(stats.revenue)}      onClick={() => navigate("/admin/analytics")} />
        <StatsCard icon={ShoppingBag}   label="Total Orders"        value={stats.orders}
          change={stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : null}
          trend={stats.pendingOrders > 0 ? "up" : "neutral"}
          onClick={() => navigate("/admin/orders")} />
        <StatsCard icon={Pizza}         label="Active Products"     value={stats.products}                     onClick={() => navigate("/admin/products")} />
        <StatsCard icon={Receipt}       label="Monthly Expenses"    value={formatCurrency(stats.expenses)}     onClick={() => navigate("/admin/expenses")} />
        <StatsCard icon={CalendarCheck} label="Reservations"        value={stats.reservations}
          change={stats.pendingReservations > 0 ? `${stats.pendingReservations} pending` : null}
          trend={stats.pendingReservations > 0 ? "up" : "neutral"}
          onClick={() => navigate("/admin/reservations")} />
      </div>

      {/* Stats Row 2 — Staff + Stock */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard icon={Users}         label="Total Staff"         value={stats.totalStaff}                   onClick={() => navigate("/admin/staff")} />
        <StatsCard icon={AlertTriangle} label="Low Stock Items"     value={stats.lowStockCount}
          change={stats.lowStockCount > 0 ? "Needs attention" : null}
          trend={stats.lowStockCount > 0 ? "down" : "neutral"}
          onClick={() => navigate("/admin/ingredients")} />
        <StatsCard icon={UserCheck}     label="Staff Online Now"    value={liveSessions.length}
          change={liveSessions.length > 0 ? "Active sessions" : null}
          trend="neutral"
          onClick={() => navigate("/admin/staff")} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-sans font-bold text-dark mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Product",   icon: Plus,     path: "/admin/products/new", style: "bg-gradient-to-r from-primary to-primary-light text-white" },
            { label: "View Orders",   icon: Package,  path: "/admin/orders",       style: "border-2 border-primary text-primary hover:bg-primary hover:text-white" },
            { label: "Manage Staff",  icon: Users,    path: "/admin/staff",        style: "border-2 border-blue-400 text-blue-600 hover:bg-blue-50" },
            { label: "Analytics",     icon: TrendingUp, path: "/admin/analytics", style: "border-2 border-gray-300 text-dark hover:bg-cream" },
          ].map(({ label, icon: Icon, path, style }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 font-semibold text-sm ${style}`}>
              <Icon className="w-5 h-5" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-sans font-bold text-dark">Revenue — Last 7 Days</h2>
            <TrendingUp className="w-5 h-5 text-dark-gray" />
          </div>
          {revenueTrend.every((d) => d.revenue === 0) ? (
            <div className="text-center py-12 text-dark-gray">
              <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>No revenue data yet</p>
            </div>
          ) : (
            <div className="relative h-52 flex items-end justify-between gap-1.5 px-1">
              {revenueTrend.map((day, i) => {
                const max = Math.max(...revenueTrend.map((d) => d.revenue), 1);
                const h = (day.revenue / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-primary">
                      {day.revenue > 0 ? `Rs ${day.revenue.toFixed(0)}` : ""}
                    </span>
                    <div className="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg relative group"
                      style={{ height: `${Math.max(h, 4)}%` }}>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-dark text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        {formatCurrency(day.revenue)}
                      </div>
                    </div>
                    <span className="text-[10px] text-dark-gray font-medium">{day.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Status Donut */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-sans font-bold text-dark">Order Status</h2>
            <BarChart2 className="w-5 h-5 text-dark-gray" />
          </div>
          {orderStatusDist.every((s) => s.count === 0) ? (
            <div className="text-center py-12 text-dark-gray">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderStatusDist.map((item, i) => {
                const total = orderStatusDist.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-cream-light rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-dark">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-dark-gray">{pct}%</span>
                      <span className="text-sm font-bold text-primary w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row — Recent Orders + Live Staff + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">Recent Orders</h2>
            <button onClick={() => navigate("/admin/orders")} className="text-primary text-sm font-semibold">View All →</button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.orderId} className="flex items-center justify-between p-2.5 bg-cream-light rounded-xl cursor-pointer hover:bg-cream"
                  onClick={() => navigate("/admin/orders")}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{order.customerInfo?.name || "Guest"}</p>
                    <p className="text-xs text-dark-gray truncate">{order.orderId}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-bold text-primary">{formatCurrency(order.total)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Staff Sessions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">Staff Online</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              {liveSessions.length} active
            </span>
          </div>
          {liveSessions.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No staff online</p>
            </div>
          ) : (
            <div className="space-y-2">
              {liveSessions.slice(0, 5).map((s) => (
                <div key={s._id} className="flex items-center gap-3 p-2.5 bg-cream-light rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{s.name}</p>
                    <p className="text-xs text-dark-gray capitalize">{s.role?.replace("_", " ")}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500" title="Online" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">Top Products</h2>
            <button onClick={() => navigate("/admin/analytics")} className="text-primary text-sm font-semibold">Analytics →</button>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <Pizza className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3 p-2.5 bg-cream-light rounded-xl">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{product.name}</p>
                    <p className="text-xs text-dark-gray">{product.count} sold</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatCurrency(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
