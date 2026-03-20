import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useSettings from "../../../hooks/useSettings";
import StatsCard from "../../../components/admin/common/StatsCard";
import { DashboardSkeleton } from "../../../components/admin/common/SkeletonLoader";
import StatusBadge from "../../../components/admin/common/StatusBadge";
import ordersService from "../../../services/ordersService";
import analyticsService from "../../../services/analyticsService";
import reservationsService from "../../../services/reservationsService";
import staffService from "../../../services/staffService";
import ingredientsService from "../../../services/ingredientsService";
import expensesService from "../../../services/expensesService";
import {
  ShoppingBag,
  CalendarCheck,
  Users,
  AlertTriangle,
  Package,
  UserCheck,
  Clock,
  CheckCircle,
  RefreshCw,
  XCircle,
  Receipt,
  BarChart2,
} from "lucide-react";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { formatPrice: formatCurrency } = useSettings();

  const [stats, setStats] = useState({
    orders: 0,
    pendingOrders: 0,
    reservations: 0,
    pendingReservations: 0,
    totalStaff: 0,
    lowStockCount: 0,
    expenses: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [orderStatusDist, setOrderStatusDist] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [
        orders,
        orderStats,
        resStats,
        staffRes,
        lowStock,
        expSummary,
        sessions,
      ] = await Promise.allSettled([
        ordersService.getOrders(),
        analyticsService.getOrderStats(),
        reservationsService.getReservationStats(),
        staffService.getStaff(),
        ingredientsService.getLowStockIngredients(),
        expensesService.getSummary(),
        staffService.getLiveSessions(),
      ]);

      const ordersData = orders.value || [];
      const orderStatsData = orderStats.value || {};
      const resStatsData = resStats.value || {};
      const staffData = staffRes.value?.staff || [];
      const lowStockData = lowStock.value?.ingredients || [];
      const expData = expSummary.value || {};
      const sessionsData = sessions.value?.sessions || [];

      setStats({
        orders: orderStatsData.total || 0,
        pendingOrders: orderStatsData.pending || 0,
        reservations: resStatsData.total || 0,
        pendingReservations: resStatsData.pending || 0,
        totalStaff: staffData.length,
        lowStockCount: lowStockData.length,
        expenses: expData?.thisMonth?.total || expData?.total || 0,
      });

      setRecentOrders(ordersService.getRecentOrders(ordersData, 6));
      setLiveSessions(sessionsData);
      setLowStockItems(lowStockData.slice(0, 5));
      setOrderStatusDist([
        {
          status: "Pending",
          count: parseInt(orderStatsData.pending || 0),
          color: "#FCD34D",
          icon: Clock,
        },
        {
          status: "Processing",
          count: parseInt(orderStatsData.processing || 0),
          color: "#60A5FA",
          icon: RefreshCw,
        },
        {
          status: "Completed",
          count: parseInt(orderStatsData.completed || 0),
          color: "#34D399",
          icon: CheckCircle,
        },
        {
          status: "Cancelled",
          count: parseInt(orderStatsData.cancelled || 0),
          color: "#F87171",
          icon: XCircle,
        },
      ]);
    } catch (err) {
      console.error("Manager dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DashboardSkeleton stats={4} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h1 className="text-2xl lg:text-3xl font-bold font-sans text-primary mb-1">
          Manager Dashboard
        </h1>
        <p className="text-dark-gray">
          Daily operations, staff oversight & supply chain
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          icon={CalendarCheck}
          label="Reservations"
          value={stats.reservations}
          change={
            stats.pendingReservations > 0
              ? `${stats.pendingReservations} pending`
              : null
          }
          trend={stats.pendingReservations > 0 ? "up" : "neutral"}
          onClick={() => navigate("/admin/reservations")}
        />
        <StatsCard
          icon={Users}
          label="Staff Members"
          value={stats.totalStaff}
          onClick={() => navigate("/admin/staff")}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats.lowStockCount}
          change={stats.lowStockCount > 0 ? "Reorder needed" : null}
          trend={stats.lowStockCount > 0 ? "down" : "neutral"}
          onClick={() => navigate("/admin/ingredients")}
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          icon={Receipt}
          label="Monthly Expenses"
          value={formatCurrency(stats.expenses)}
          onClick={() => navigate("/admin/expenses")}
        />
        <StatsCard
          icon={UserCheck}
          label="Staff Online Now"
          value={liveSessions.length}
          change={liveSessions.length > 0 ? "Currently active" : null}
          trend="neutral"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-lg font-sans font-bold text-dark mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "View Orders",
              icon: Package,
              path: "/admin/orders",
              style:
                "bg-gradient-to-r from-primary to-primary-light text-white",
            },
            {
              label: "Reservations",
              icon: CalendarCheck,
              path: "/admin/reservations",
              style:
                "border-2 border-primary text-primary hover:bg-primary hover:text-white",
            },
            {
              label: "Manage Staff",
              icon: Users,
              path: "/admin/staff",
              style: "border-2 border-blue-400 text-blue-600 hover:bg-blue-50",
            },
            {
              label: "Stock Overview",
              icon: AlertTriangle,
              path: "/admin/ingredients",
              style:
                "border-2 border-orange-400 text-orange-600 hover:bg-orange-50",
            },
          ].map(({ label, icon: Icon, path, style }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 font-semibold text-xs sm:text-sm ${style}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">
              Order Status
            </h2>
            <BarChart2 className="w-5 h-5 text-dark-gray" />
          </div>
          <div className="space-y-3">
            {orderStatusDist.map((item, i) => {
              const total = orderStatusDist.reduce((s, x) => s + x.count, 0);
              const pct =
                total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
              const width = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dark">{item.status}</span>
                    <span className="font-bold text-primary">
                      {item.count}{" "}
                      <span className="text-dark-gray font-normal">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Staff */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">
              Staff Online
            </h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              {liveSessions.length} active
            </span>
          </div>
          {liveSessions.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No staff currently online</p>
            </div>
          ) : (
            <div className="space-y-2">
              {liveSessions.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center gap-3 p-2.5 bg-cream-light rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-dark-gray capitalize">
                      {s.role?.replace("_", " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row — Recent Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">
              Recent Orders
            </h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-primary text-sm font-semibold"
            >
              View All →
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between p-2.5 bg-cream-light rounded-xl cursor-pointer hover:bg-cream"
                  onClick={() => navigate("/admin/orders")}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">
                      {order.customerInfo?.name || "Guest"}
                    </p>
                    <p className="text-xs text-dark-gray">{order.orderId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(order.total)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">
              Low Stock Alerts
            </h2>
            <button
              onClick={() => navigate("/admin/ingredients")}
              className="text-primary text-sm font-semibold"
            >
              Manage →
            </button>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold">
                All stock levels are healthy
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-2.5 bg-red-50 border border-red-100 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-dark">
                        {item.name}
                      </p>
                      <p className="text-xs text-dark-gray">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      {item.currentStock} {item.unit}
                    </p>
                    <p className="text-xs text-dark-gray">
                      Min: {item.minimumStock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
