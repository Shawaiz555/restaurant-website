import React, { useEffect, useState, useCallback, useRef } from "react";
import ordersService from "../../services/ordersService";
import useSettings from "../../hooks/useSettings";
import StatsCard from "../../components/admin/common/StatsCard";
import { SplitPageSkeleton } from "../../components/admin/common/SkeletonLoader";
import {
  Flame,
  Clock,
  RefreshCw,
  CheckCircle,
  ChefHat,
  AlertTriangle,
  RotateCcw,
  ListOrdered,
  Utensils,
} from "lucide-react";

const getOrderAge = (orderDate) => {
  const mins = Math.floor((Date.now() - new Date(orderDate)) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

// How long (minutes) before we consider an order "urgent"
const URGENT_MINS = 15;

const isUrgent = (orderDate) =>
  Math.floor((Date.now() - new Date(orderDate)) / 60000) >= URGENT_MINS;

const STATUS_NEXT = {
  Pending: {
    label: "Start Preparing",
    next: "Processing",
    color: "bg-blue-500 hover:bg-blue-600",
    icon: RefreshCw,
  },
  Processing: {
    label: "Mark Ready",
    next: "Completed",
    color: "bg-green-500 hover:bg-green-600",
    icon: CheckCircle,
  },
};

// ─── Order Card ──────────────────────────────────────────────────────────────
const OrderCard = ({ order, onStatusChange, updating }) => {
  const isPending = order.status === "Pending";
  const isUrgentNow = isUrgent(order.orderDate);
  const next = STATUS_NEXT[order.status];
  const { formatPrice: formatCurrency } = useSettings();
  const NextIcon = next?.icon;

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all relative ${
        isUrgentNow && isPending
          ? "bg-red-50 border-red-400 shadow-md"
          : isPending
            ? "bg-yellow-50 border-yellow-300"
            : "bg-blue-50 border-blue-300"
      }`}
    >
      {/* Urgent badge */}
      {isUrgentNow && isPending && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
          <AlertTriangle className="w-3 h-3" /> URGENT
        </div>
      )}

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            isPending
              ? "bg-yellow-200 text-yellow-800"
              : "bg-blue-200 text-blue-800"
          }`}
        >
          {isPending ? "PENDING" : "PREPARING"}
        </div>
        <div className="flex items-center gap-1 text-xs text-dark-gray font-medium">
          <Clock className="w-3 h-3" />
          {getOrderAge(order.orderDate)}
        </div>
      </div>

      {/* Customer */}
      <p className="font-bold text-dark text-sm mb-1">
        {order.customerInfo?.name || "Guest"}
      </p>
      <p className="text-xs text-dark-gray mb-3 font-mono">{order.orderId}</p>

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        {order.items?.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-dark font-medium truncate flex-1 mr-2">
              {item.name}
            </span>
            <span className="font-bold text-dark-gray shrink-0">
              ×{item.quantity}
            </span>
          </div>
        ))}
        {order.items?.length > 4 && (
          <p className="text-xs text-dark-gray italic">
            +{order.items.length - 4} more items
          </p>
        )}
      </div>

      {/* Special notes */}
      {order.customerInfo?.additionalNotes && (
        <div className="mb-3 px-2.5 py-2 bg-white/70 rounded-lg border border-white/80">
          <p className="text-xs text-amber-700 font-medium">
            Note: {order.customerInfo.additionalNotes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/50">
        <span className="text-sm font-bold text-primary">
          {formatCurrency(order.total)}
        </span>
        <span className="text-xs text-dark-gray">
          {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Action button */}
      {next && (
        <button
          disabled={updating === order._id}
          onClick={() => onStatusChange(order._id, next.next)}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white text-sm font-semibold transition-all ${next.color} disabled:opacity-50`}
        >
          {updating === order._id ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <NextIcon className="w-4 h-4" />
          )}
          {updating === order._id ? "Updating…" : next.label}
        </button>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const AdminKitchenQueue = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // order._id being updated
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [filter, setFilter] = useState("All"); // All | Pending | Processing
  const intervalRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const orders = await ordersService.getOrders();
      const kitchen = orders
        .filter((o) => o.status === "Pending" || o.status === "Processing")
        .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
      setAllOrders(kitchen);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Kitchen queue load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => load(true), 30000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      await load(true);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = allOrders.filter(
    (o) => filter === "All" || o.status === filter,
  );
  const pendingCount = allOrders.filter((o) => o.status === "Pending").length;
  const processingCount = allOrders.filter(
    (o) => o.status === "Processing",
  ).length;
  const urgentCount = allOrders.filter(
    (o) => o.status === "Pending" && isUrgent(o.orderDate),
  ).length;

  if (loading) return <SplitPageSkeleton stats={3} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-sans text-primary mb-0.5">
                Kitchen Queue
              </h1>
              <p className="text-dark-gray text-sm">
                Live order queue — update status as you prepare
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {urgentCount > 0 && (
              <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold animate-pulse">
                {urgentCount} urgent!
              </span>
            )}
            <button
              onClick={() => load(false)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-dark-gray hover:bg-cream transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
        <p className="text-xs text-dark-gray mt-2">
          Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes
          every 30s
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          icon={ListOrdered}
          label="Total Active"
          value={allOrders.length}
        />
        <StatsCard
          icon={Clock}
          label="Pending"
          value={pendingCount}
          change={urgentCount > 0 ? `${urgentCount} urgent` : null}
          trend={urgentCount > 0 ? "down" : "neutral"}
        />
        <StatsCard icon={Utensils} label="Preparing" value={processingCount} />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["All", "Pending", "Preparing"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-dark-gray border border-gray-200 hover:bg-cream"
            }`}
          >
            {tab === "All"
              ? `All (${allOrders.length})`
              : tab === "Pending"
                ? `Pending (${pendingCount})`
                : `Preparing (${processingCount})`}
          </button>
        ))}
      </div>

      {/* Queue Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-lg border border-gray-100 text-center text-green-600">
          <CheckCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p className="text-xl font-bold">Kitchen is all clear!</p>
          <p className="text-sm text-dark-gray mt-2">
            No active orders in the queue
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={handleStatusChange}
              updating={updating}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="flex flex-wrap items-center gap-4 text-xs text-dark-gray">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-300" />
            <span>Pending — not started yet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-300" />
            <span>Preparing — in progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span>Red border = waiting {URGENT_MINS}+ minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Orders sorted oldest first</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKitchenQueue;
