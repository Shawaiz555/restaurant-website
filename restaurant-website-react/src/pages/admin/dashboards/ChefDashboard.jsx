import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useSettings from "../../../hooks/useSettings";
import StatsCard from "../../../components/admin/common/StatsCard";
import ordersService from "../../../services/ordersService";
import analyticsService from "../../../services/analyticsService";
import ingredientsService from "../../../services/ingredientsService";
import recipesService from "../../../services/recipesService";
import {
  ChefHat,
  Package,
  ShoppingBasket,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Flame,
  BookOpen,
} from "lucide-react";

const ChefDashboard = () => {
  const navigate = useNavigate();
  const { formatPrice: formatCurrency } = useSettings();

  const [stats, setStats] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    lowStockCount: 0,
    recipesCount: 0,
  });
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [orders, orderStats, lowStock, recipesRes] =
        await Promise.allSettled([
          ordersService.getOrders(),
          analyticsService.getOrderStats(),
          ingredientsService.getLowStockIngredients(),
          recipesService.getRecipes(),
        ]);

      const ordersData = orders.value || [];
      const orderStatsData = orderStats.value || {};
      const lowStockData = lowStock.value?.ingredients || [];
      const recipesData = recipesRes.value?.recipes || recipesRes.value || [];

      // Kitchen queue — pending and processing orders
      const kitchen = ordersData
        .filter((o) => o.status === "Pending" || o.status === "Processing")
        .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));

      setStats({
        pendingOrders: parseInt(orderStatsData.pending || 0),
        preparingOrders: parseInt(orderStatsData.processing || 0),
        lowStockCount: lowStockData.length,
        recipesCount: recipesData.length,
      });
      setKitchenOrders(kitchen);
      setLowStockItems(lowStockData.slice(0, 6));
      setRecipes(recipesData.slice(0, 5));
    } catch (err) {
      console.error("Chef dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getOrderAge = (orderDate) => {
    const mins = Math.floor((Date.now() - new Date(orderDate)) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-sans text-primary mb-0.5">
                Chef Dashboard
              </h1>
              <p className="text-dark-gray">
                Kitchen operations — orders queue, recipes & stock
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats.pendingOrders > 0 && (
              <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold animate-pulse">
                {stats.pendingOrders} orders waiting!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Clock}
          label="Pending Orders"
          value={stats.pendingOrders}
          change={stats.pendingOrders > 0 ? "Need to start" : null}
          trend={stats.pendingOrders > 0 ? "up" : "neutral"}
          onClick={() => navigate("/admin/orders")}
        />
        <StatsCard
          icon={RefreshCw}
          label="Preparing Now"
          value={stats.preparingOrders}
          onClick={() => navigate("/admin/orders")}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats.lowStockCount}
          change={stats.lowStockCount > 0 ? "Check ingredients" : null}
          trend={stats.lowStockCount > 0 ? "down" : "neutral"}
          onClick={() => navigate("/admin/ingredients")}
        />
        <StatsCard
          icon={BookOpen}
          label="Recipes"
          value={stats.recipesCount}
          onClick={() => navigate("/admin/recipes")}
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
              label: "Kitchen Queue",
              icon: Package,
              path: "/admin/orders",
              style:
                "bg-gradient-to-r from-primary to-primary-light text-white",
            },
            {
              label: "Recipes",
              icon: ChefHat,
              path: "/admin/recipes",
              style:
                "border-2 border-primary text-primary hover:bg-primary hover:text-white",
            },
            {
              label: "Ingredients",
              icon: ShoppingBasket,
              path: "/admin/ingredients",
              style:
                "border-2 border-orange-400 text-orange-600 hover:bg-orange-50",
            },
            {
              label: "Log Wastage",
              icon: AlertTriangle,
              path: "/admin/wastage",
              style: "border-2 border-gray-300 text-dark hover:bg-cream",
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

      {/* Kitchen Queue — main focus for Chef */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-sans font-bold text-dark">
              Kitchen Queue
            </h2>
            {kitchenOrders.length > 0 && (
              <span className="w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                {kitchenOrders.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-primary text-sm font-semibold"
          >
            View All Orders →
          </button>
        </div>

        {kitchenOrders.length === 0 ? (
          <div className="text-center py-10 text-green-600">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-60" />
            <p className="font-semibold">Kitchen is all clear!</p>
            <p className="text-sm text-dark-gray mt-1">No pending orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {kitchenOrders.map((order) => {
              const isPending = order.status === "Pending";
              return (
                <div
                  key={order.orderId}
                  className={`p-4 rounded-2xl border-2 cursor-pointer hover:shadow-md transition-all ${
                    isPending
                      ? "bg-yellow-50 border-yellow-300"
                      : "bg-blue-50 border-blue-300"
                  }`}
                  onClick={() => navigate("/admin/orders")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        isPending
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {isPending ? "PENDING" : "PREPARING"}
                    </div>
                    <span className="text-xs text-dark-gray font-medium">
                      {getOrderAge(order.orderDate)}
                    </span>
                  </div>
                  <p className="font-bold text-dark text-sm mb-1">
                    {order.customerInfo?.name || "Guest"}
                  </p>
                  <div className="space-y-1">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs text-dark-gray"
                      >
                        <span className="truncate flex-1">{item.name}</span>
                        <span className="font-semibold ml-2">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-xs text-dark-gray">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/50 flex justify-between items-center">
                    <span className="text-xs text-dark-gray">
                      {order.items?.length} items
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Row — Low Stock + Recent Recipes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredient Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">
              Ingredient Alerts
            </h2>
            <button
              onClick={() => navigate("/admin/ingredients")}
              className="text-primary text-sm font-semibold"
            >
              View Stock →
            </button>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold">
                All ingredients are well-stocked
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

        {/* Recipes Quick Access */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans font-bold text-dark">
              Recent Recipes
            </h2>
            <button
              onClick={() => navigate("/admin/recipes")}
              className="text-primary text-sm font-semibold"
            >
              All Recipes →
            </button>
          </div>
          {recipes.length === 0 ? (
            <div className="text-center py-8 text-dark-gray">
              <ChefHat className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No recipes yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="flex items-center gap-3 p-2.5 bg-cream-light rounded-xl cursor-pointer hover:bg-cream"
                  onClick={() => navigate("/admin/recipes")}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">
                      {recipe.productName || "Recipe"}
                    </p>
                    <p className="text-xs text-dark-gray">
                      {recipe.ingredients?.length || 0} ingredients
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

export default ChefDashboard;
