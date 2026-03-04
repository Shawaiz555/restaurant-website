import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ordersService from "../../services/ordersService";
import { updateOrderStatus } from "../../store/slices/ordersSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import StatusBadge from "../../components/admin/common/StatusBadge";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  CreditCard,
  RefreshCw,
  Utensils,
  Coffee,
  Cake,
  Plus,
  DollarSign,
  Star,
  FileText,
  ClipboardList,
  ChevronDown,
} from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Processing", "Completed", "Cancelled"];

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  Processing: "bg-blue-100 text-blue-800 border border-blue-200",
  Completed: "bg-green-100 text-green-800 border border-green-200",
  Cancelled: "bg-red-100 text-red-800 border border-red-200",
};

const STATUS_BAR = {
  Pending: "from-yellow-400 to-yellow-500",
  Processing: "from-blue-500 to-blue-600",
  Completed: "from-green-500 to-green-600",
  Cancelled: "from-red-400 to-red-500",
};

const formatCurrency = (amount) =>
  `Rs ${parseFloat(amount || 0).toFixed(2)}`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await ordersService.getOrderById(id);
        if (data) {
          setOrder(data);
        } else {
          setError("Order not found");
        }
      } catch {
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!order || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const result = await ordersService.updateOrderStatus(order._id, newStatus);
      if (result.success) {
        setOrder((prev) => ({ ...prev, status: newStatus }));
        dispatch(updateOrderStatus({ orderId: order._id, status: newStatus }));
        dispatch(
          showNotification({
            type: "success",
            message: `Status updated to ${newStatus}`,
          }),
        );
      } else {
        dispatch(
          showNotification({ type: "error", message: result.message }),
        );
      }
    } catch {
      dispatch(
        showNotification({ type: "error", message: "Failed to update status" }),
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-gray font-medium">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-gray hover:text-primary font-semibold transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">Order Not Found</h3>
          <p className="text-dark-gray">{error}</p>
        </div>
      </div>
    );
  }

  const barClass = STATUS_BAR[order.status] || "from-gray-400 to-gray-500";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/orders")}
        className="flex items-center gap-2 text-dark-gray hover:text-primary font-semibold transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </button>

      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className={`h-1.5 w-full bg-gradient-to-r ${barClass}`} />
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-sans font-bold text-primary">
                  Order Details
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-800"}`}
                >
                  {order.status}
                </span>
                {order.isGuestOrder && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-700">
                    Guest Order
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-dark-gray mt-0.5 break-all">
                {order.orderId}
              </p>
            </div>
          </div>

          {/* Status Updater */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-xs font-semibold text-dark-gray whitespace-nowrap">
              Update Status:
            </label>
            <div className="relative">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`pl-3 pr-7 py-2 rounded-xl text-xs font-semibold border-2 cursor-pointer appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed ${STATUS_STYLES[order.status] || "bg-gray-100 border-gray-200 text-gray-800"}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Grid: Customer Info + Order Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-primary" />
            </div>
            <h2 className="font-bold text-dark">Customer Information</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                icon: User,
                label: "Name",
                value:
                  order.customerInfo?.name ||
                  order.customerInfo?.fullName ||
                  "N/A",
              },
              {
                icon: Mail,
                label: "Email",
                value: order.customerInfo?.email || "N/A",
                href: order.customerInfo?.email
                  ? `mailto:${order.customerInfo.email}`
                  : null,
              },
              {
                icon: Phone,
                label: "Phone",
                value: order.customerInfo?.phone || "N/A",
                href: order.customerInfo?.phone
                  ? `tel:${order.customerInfo.phone}`
                  : null,
              },
              {
                icon: MapPin,
                label: "Address",
                value: order.customerInfo?.address || "N/A",
              },
            ].map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5"
              >
                <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-dark-gray font-semibold mb-0.5">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm font-medium text-primary hover:underline break-all"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-dark break-all">
                      {value}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
              {order.isGuestOrder ? (
                <User className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Star className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs text-dark-gray font-semibold mb-0.5">
                  Customer Type
                </p>
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${order.isGuestOrder ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary"}`}
                >
                  {order.isGuestOrder ? "Guest Order" : "Registered User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-primary" />
            </div>
            <h2 className="font-bold text-dark">Order Information</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: Hash, label: "Order ID", value: order.orderId, mono: true },
              {
                icon: CreditCard,
                label: "Payment Method",
                value: order.paymentMethod,
              },
              {
                icon: Calendar,
                label: "Order Date",
                value: formatDate(order.orderDate),
              },
            ].map(({ icon: Icon, label, value, mono }) => (
              <div
                key={label}
                className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5"
              >
                <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-dark-gray font-semibold mb-0.5">
                    {label}
                  </p>
                  <p
                    className={`text-sm font-medium text-dark break-all ${mono ? "font-mono text-xs" : ""}`}
                  >
                    {value || "N/A"}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
              <RefreshCw className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-dark-gray font-semibold mb-1">
                  Status
                </p>
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <Utensils className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-dark">Order Items</h2>
            <p className="text-xs text-dark-gray mt-0.5">
              {order.items?.length || 0} item
              {(order.items?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {order.items?.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-cream-light to-cream rounded-2xl p-5 border border-primary/10 hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Item header */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-xs font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <p className="font-bold text-dark">{item.name}</p>
                  </div>

                  {/* Item details */}
                  <div className="ml-9 space-y-1.5">
                    {item.size && (
                      <p className="text-xs text-dark-gray">
                        <span className="font-semibold text-dark">Size:</span>{" "}
                        {item.size}
                      </p>
                    )}
                    {item.spiceLevel && (
                      <p className="text-xs text-dark-gray">
                        <span className="font-semibold text-dark">
                          Spice Level:
                        </span>{" "}
                        {item.spiceLevel.name}
                      </p>
                    )}
                    {item.addOns && (
                      <div className="space-y-1 mt-1 pt-1 border-t border-primary/10">
                        {item.addOns.drinks?.length > 0 && (
                          <p className="flex items-start gap-1.5 text-xs text-dark-gray">
                            <Coffee className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>
                              <span className="font-semibold text-dark">
                                Drinks:
                              </span>{" "}
                              {item.addOns.drinks
                                .map((d) => `${d.name} ×${d.quantity}`)
                                .join(", ")}
                            </span>
                          </p>
                        )}
                        {item.addOns.desserts?.length > 0 && (
                          <p className="flex items-start gap-1.5 text-xs text-dark-gray">
                            <Cake className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 mt-0.5" />
                            <span>
                              <span className="font-semibold text-dark">
                                Desserts:
                              </span>{" "}
                              {item.addOns.desserts
                                .map((d) => `${d.name} ×${d.quantity}`)
                                .join(", ")}
                            </span>
                          </p>
                        )}
                        {item.addOns.extras?.length > 0 && (
                          <p className="flex items-start gap-1.5 text-xs text-dark-gray">
                            <Plus className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>
                              <span className="font-semibold text-dark">
                                Extras:
                              </span>{" "}
                              {item.addOns.extras
                                .map((e) => `${e.name} ×${e.quantity}`)
                                .join(", ")}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price + Qty */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary text-base">
                    {formatCurrency(item.price)}
                  </p>
                  <span className="inline-block text-xs text-dark-gray bg-white border border-gray-200 px-2 py-0.5 rounded-full mt-1">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <DollarSign className="w-4.5 h-4.5 text-primary" />
          </div>
          <h2 className="font-bold text-dark">Order Summary</h2>
        </div>

        <div className="p-6 max-w-sm ml-auto space-y-3">
          <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm text-dark-gray font-semibold">
              Subtotal
            </span>
            <span className="text-sm font-bold text-dark">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm text-dark-gray font-semibold">
              Delivery Fee
            </span>
            <span className="text-sm font-bold text-dark">
              {formatCurrency(order.deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-gradient-to-r from-primary to-primary-dark rounded-xl px-4 py-4 shadow-md shadow-primary/20">
            <span className="text-sm font-bold text-white">Total Amount</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
