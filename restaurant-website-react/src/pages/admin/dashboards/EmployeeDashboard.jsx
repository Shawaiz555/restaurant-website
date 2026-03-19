import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StatsCard from "../../../components/admin/common/StatsCard";
import StatusBadge from "../../../components/admin/common/StatusBadge";
import ordersService from "../../../services/ordersService";
import reservationsService from "../../../services/reservationsService";
import tablesService from "../../../services/tablesService";
import {
  CalendarCheck,
  TableIcon,
  CreditCard,
  Package,
  Clock,
  CheckCircle,
  RefreshCw,
  XCircle,
  Users,
} from "lucide-react";

const formatCurrency = (amount) => `Rs ${parseFloat(amount || 0).toFixed(2)}`;

const STATUS_CONFIG = {
  Pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  Processing: { color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  Completed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  Cancelled: { color: "bg-red-100 text-red-700", icon: XCircle },
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pendingOrders: 0,
    processingOrders: 0,
    todayReservations: 0,
    availableTables: 0,
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      const [orders, reservations, tablesRes] =
        await Promise.allSettled([
          ordersService.getOrders(),
          reservationsService.getReservations(),
          tablesService.getTables(),
        ]);

      const ordersData = orders.status === "fulfilled" ? (orders.value || []) : [];
      const reservationsData = Array.isArray(reservations.value) ? reservations.value : [];
      const tablesData = tablesRes.value?.tables || tablesRes.value || [];

      // Today's reservations — field is reservationDate ("YYYY-MM-DD" string)
      const todayRes = reservationsData.filter(
        (r) => r.reservationDate === today && r.status !== "Cancelled",
      );

      // Active orders (pending + processing), newest first
      const active = [...ordersData]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .filter((o) => o.status === "Pending" || o.status === "Processing")
        .slice(0, 8);

      const availableTables = tablesData.filter(
        (t) => t.status === "available" && t.isActive,
      ).length;

      // Compute stats from orders data directly (employees cannot call /stats/summary)
      const pendingOrders = ordersData.filter((o) => o.status === "Pending").length;
      const processingOrders = ordersData.filter((o) => o.status === "Processing").length;

      setStats({
        pendingOrders,
        processingOrders,
        todayReservations: todayRes.length,
        availableTables,
      });
      setActiveOrders(active);
      setTodayReservations(todayRes.slice(0, 5));
      setTables(tablesData.filter((t) => t.isActive).slice(0, 8));
    } catch (err) {
      console.error("Employee dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 30 seconds so new orders appear without manual reload
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 animate-pulse h-40"
              />
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
              Employee Dashboard
            </h1>
            <p className="text-dark-gray">
              Front-of-house — orders, tables & reservations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-dark-gray font-medium">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Clock}
          label="Pending Orders"
          value={stats.pendingOrders}
          change={stats.pendingOrders > 0 ? "Need attention" : null}
          trend={stats.pendingOrders > 0 ? "up" : "neutral"}
          onClick={() => navigate("/admin/orders")}
        />
        <StatsCard
          icon={RefreshCw}
          label="Processing Orders"
          value={stats.processingOrders}
          onClick={() => navigate("/admin/orders")}
        />
        <StatsCard
          icon={CalendarCheck}
          label="Today's Reservations"
          value={stats.todayReservations}
          onClick={() => navigate("/admin/reservations")}
        />
        <StatsCard
          icon={TableIcon}
          label="Available Tables"
          value={stats.availableTables}
          onClick={() => navigate("/admin/tables")}
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
              label: "All Orders",
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
              label: "Tables",
              icon: TableIcon,
              path: "/admin/tables",
              style: "border-2 border-gray-300 text-dark hover:bg-cream",
            },
            {
              label: "Payments",
              icon: CreditCard,
              path: "/admin/payments",
              style:
                "border-2 border-green-400 text-green-600 hover:bg-green-50",
            },
          ].map(({ label, icon: Icon, path, style }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 font-semibold text-sm ${style}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">
              Active Orders
            </h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-primary text-sm font-semibold"
            >
              View All →
            </button>
          </div>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold">
                No active orders — all clear!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeOrders.map((order) => {
                const cfg =
                  STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                const Icon = cfg.icon;
                return (
                  <div
                    key={order.orderId}
                    className="flex items-center justify-between p-2.5 bg-cream-light rounded-xl cursor-pointer hover:bg-cream"
                    onClick={() => navigate("/admin/orders")}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">
                          {order.customerInfo?.fullName || "Guest"}
                        </p>
                        <p className="text-xs text-dark-gray">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(order.total)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Reservations */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">
              Today's Reservations
            </h2>
            <button
              onClick={() => navigate("/admin/reservations")}
              className="text-primary text-sm font-semibold"
            >
              View All →
            </button>
          </div>
          {todayReservations.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No reservations for today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayReservations.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between p-2.5 bg-cream-light rounded-xl"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark truncate">
                        {r.fullName || "Guest"}
                      </p>
                      <p className="text-xs text-dark-gray">
                        {r.partySize} guests · {r.reservationTime}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Status Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-sans font-bold text-dark">
            Table Status
          </h2>
          <button
            onClick={() => navigate("/admin/tables")}
            className="text-primary text-sm font-semibold"
          >
            Manage →
          </button>
        </div>
        {tables.length === 0 ? (
          <div className="text-center py-6 text-dark-gray">
            <TableIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No active tables</p>
            <p className="text-xs mt-1 opacity-70">Tables will appear here once added by an admin</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {tables.map((table) => {
              const isAvailable = table.status === "available";
              return (
                <div
                  key={table._id}
                  className={`p-3 rounded-xl text-center border-2 transition-all ${
                    isAvailable
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-600"
                  }`}
                >
                  <TableIcon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-bold">T{table.tableNumber}</p>
                  <p className="text-[10px] capitalize">{table.status}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
