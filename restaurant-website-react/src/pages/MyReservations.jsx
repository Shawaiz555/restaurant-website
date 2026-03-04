import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../store/slices/notificationSlice";
import reservationsService from "../services/reservationsService";
import ConfirmModal from "../components/admin/common/ConfirmModal";
import {
  CalendarCheck,
  Calendar,
  Clock,
  Users,
  TableIcon,
  Phone,
  Mail,
  MessageSquare,
  XCircle,
  RefreshCw,
  ChevronDown,
  Plus,
} from "lucide-react";

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  Confirmed: "bg-green-100 text-green-800 border border-green-200",
  Cancelled: "bg-red-100 text-red-800 border border-red-200",
  Completed: "bg-blue-100 text-blue-800 border border-blue-200",
};

const STATUS_ICONS = {
  Pending: Clock,
  Confirmed: CalendarCheck,
  Cancelled: XCircle,
  Completed: CalendarCheck,
};

const formatTimeDisplay = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

const MyReservations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(
        showNotification({
          type: "error",
          message: "Please login to view your reservations",
        }),
      );
      navigate("/login");
    }
  }, [isAuthenticated, navigate, dispatch]);

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reservationsService.getMyReservations();
      setReservations(data);
    } catch (error) {
      console.error("Failed to load reservations:", error);
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to load your reservations",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) loadReservations();
  }, [isAuthenticated, loadReservations]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const result = await reservationsService.cancelMyReservation(
        cancelTarget._id,
      );
      if (result.success) {
        setReservations((prev) =>
          prev.map((r) =>
            r._id === cancelTarget._id ? { ...r, status: "Cancelled" } : r,
          ),
        );
        dispatch(
          showNotification({
            type: "success",
            message: "Reservation cancelled successfully",
          }),
        );
      } else {
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to cancel reservation",
        }),
      );
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
      setCancelTarget(null);
    }
  };

  const upcomingReservations = reservations.filter(
    (r) => !["Cancelled", "Completed"].includes(r.status),
  );
  const pastReservations = reservations.filter((r) =>
    ["Cancelled", "Completed"].includes(r.status),
  );

  const ReservationCard = ({ res }) => {
    const isExpanded = expandedId === res._id;
    const StatusIcon = STATUS_ICONS[res.status] || Clock;
    const tables = res.tableIds?.length > 0 ? res.tableIds : (res.tableId ? [res.tableId] : []);
    const canCancel = !["Cancelled", "Completed"].includes(res.status);

    return (
      <div
        className={`bg-white rounded-2xl border-2 shadow-sm transition-all duration-200 overflow-hidden ${
          isExpanded
            ? "border-primary/30 shadow-md"
            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
        }`}
      >
        {/* Card Header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Status Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  res.status === "Confirmed"
                    ? "bg-green-100"
                    : res.status === "Pending"
                      ? "bg-yellow-100"
                      : res.status === "Cancelled"
                        ? "bg-red-100"
                        : "bg-blue-100"
                }`}
              >
                <StatusIcon
                  className={`w-6 h-6 ${
                    res.status === "Confirmed"
                      ? "text-green-600"
                      : res.status === "Pending"
                        ? "text-yellow-600"
                        : res.status === "Cancelled"
                          ? "text-red-500"
                          : "text-blue-600"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-primary">
                    {res.reservationId}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${STATUS_STYLES[res.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {res.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-dark-gray">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {reservationsService.formatDate(res.reservationDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {formatTimeDisplay(res.reservationTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {res.partySize} {res.partySize === 1 ? "guest" : "guests"}
                  </span>
                </div>
                {tables.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {tables.map((t) => (
                      <div key={t._id} className="flex items-center gap-1.5 text-sm text-dark">
                        <TableIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        Table #{t.tableNumber} — {t.name}
                        <span className="text-xs text-dark-gray">({t.location})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {canCancel && (
                <button
                  onClick={() => {
                    setCancelTarget(res);
                    setShowCancelModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              )}
              <button
                onClick={() => setExpandedId(isExpanded ? null : res._id)}
                className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                  isExpanded
                    ? "border-primary text-primary bg-primary/5"
                    : "border-gray-200 text-dark-gray hover:border-gray-300"
                }`}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-dark-gray uppercase tracking-wider">
                  Contact
                </p>
                <div className="flex items-center gap-2 text-sm text-dark">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="truncate">{res.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-dark">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  {res.phone}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-dark-gray uppercase tracking-wider">
                  Special Requests
                </p>
                {res.specialRequests ? (
                  <div className="flex items-start gap-2 text-sm text-dark">
                    <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="italic">{res.specialRequests}</span>
                  </div>
                ) : (
                  <p className="text-sm text-dark-gray">None</p>
                )}
              </div>
            </div>
            <p className="text-xs text-dark-gray mt-3">
              Booked on{" "}
              {new Date(res.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-cream-light to-amber-50 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-sans font-bold text-dark">
                My Reservations
              </h1>
            </div>
            <p className="text-dark-gray text-sm ml-13">
              {reservations.length > 0
                ? `${reservations.length} reservation${reservations.length !== 1 ? "s" : ""} total`
                : "Your booking history"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadReservations}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-dark-gray hover:border-primary hover:text-primary transition-all text-sm font-medium"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => navigate("/reservations")}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-dark-gray font-medium">
              Loading your reservations...
            </p>
          </div>
        ) : reservations.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center mx-auto mb-5">
              <CalendarCheck className="w-12 h-12 text-primary/60" />
            </div>
            <h3 className="text-xl font-sans font-bold text-dark mb-2">
              No Reservations Yet
            </h3>
            <p className="text-dark-gray mb-8 max-w-sm mx-auto">
              You haven't made any table reservations yet. Book your first table
              and enjoy a wonderful dining experience!
            </p>
            <button
              onClick={() => navigate("/reservations")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Make a Reservation
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcomingReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h2 className="font-sans font-bold text-dark text-lg">
                    Upcoming
                  </h2>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-lg">
                    {upcomingReservations.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {upcomingReservations.map((r) => (
                    <ReservationCard key={r._id} res={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {pastReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <h2 className="font-sans font-bold text-dark-gray text-lg">
                    Past & Cancelled
                  </h2>
                  <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-lg">
                    {pastReservations.length}
                  </span>
                </div>
                <div className="space-y-3 opacity-80">
                  {pastReservations.map((r) => (
                    <ReservationCard key={r._id} res={r} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirm Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Reservation"
        message={`Are you sure you want to cancel reservation ${cancelTarget?.reservationId}? This action cannot be undone.`}
        onConfirm={handleCancelConfirm}
        onCancel={() => {
          setShowCancelModal(false);
          setCancelTarget(null);
        }}
        variant="danger"
        confirmText={cancelling ? "Cancelling..." : "Yes, Cancel"}
        cancelText="Keep Reservation"
      />
    </div>
  );
};

export default MyReservations;
