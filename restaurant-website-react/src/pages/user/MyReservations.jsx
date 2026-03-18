import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../store/slices/notificationSlice";
import reservationsService from "../../services/reservationsService";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
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
  BookOpen,
  LayoutGrid,
  Layers,
} from "lucide-react";

const STATUS_CONFIG = {
  Pending: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: "bg-amber-100",
    iconColor: "text-amber-600",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
  Confirmed: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: "bg-emerald-100",
    iconColor: "text-emerald-600",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  Cancelled: {
    badge: "bg-red-50 text-red-600 border border-red-200",
    icon: "bg-red-100",
    iconColor: "text-red-500",
    dot: "bg-red-400",
    bar: "bg-red-400",
  },
  Completed: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: "bg-blue-100",
    iconColor: "text-blue-600",
    dot: "bg-blue-400",
    bar: "bg-blue-400",
  },
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

const InfoRow = ({ icon: Icon, label }) => (
  <span className="flex items-center gap-2 text-sm text-gray-600">
    <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
    <span>{label}</span>
  </span>
);

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
      const sorted = [...data].sort((a, b) => {
        const d = a.reservationDate?.localeCompare(b.reservationDate) || 0;
        return d !== 0
          ? d
          : a.reservationTime?.localeCompare(b.reservationTime) || 0;
      });
      setReservations(sorted);
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

  // Local date string used to determine if a reservation date is past
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isDateUpcoming = (dateStr) =>
    !!dateStr && dateStr.slice(0, 10) >= todayStr;

  // Show all reservations — no date filtering
  const upcomingReservations = reservations.filter(
    (r) => !["Cancelled", "Completed"].includes(r.status),
  );
  const completedReservations = reservations.filter(
    (r) => r.status === "Completed",
  );
  const cancelledReservations = reservations.filter(
    (r) => r.status === "Cancelled",
  );

  const ReservationCard = ({ res, isPast }) => {
    const isExpanded = expandedId === res._id;
    const StatusIcon = STATUS_ICONS[res.status] || Clock;
    const cfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.Pending;
    const tables =
      res.tableIds?.length > 0
        ? res.tableIds
        : res.tableId
          ? [res.tableId]
          : [];
    const canCancel =
      !["Cancelled", "Completed"].includes(res.status) &&
      isDateUpcoming(res.reservationDate);

    return (
      <div
        className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${
          isPast ? "opacity-70" : ""
        } ${
          isExpanded
            ? "border-primary/30 shadow-lg shadow-primary/5"
            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
        }`}
      >
        {/* Status accent bar */}
        <div className={`absolute top-0 left-0 w-1 h-full ${cfg.bar}`} />

        {/* Main card content */}
        <div className="pl-5 pr-4 pt-4 pb-3">
          {/* Top row: icon + content */}
          <div className="flex items-start gap-3">
            {/* Status icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.icon}`}
            >
              <StatusIcon className={`w-5 h-5 ${cfg.iconColor}`} />
            </div>

            {/* Info block — takes full width */}
            <div className="flex-1 min-w-0">
              {/* ID + badge */}
              <div className="flex items-center flex-wrap gap-2 mb-2.5">
                <span className="font-mono text-xs font-bold text-primary tracking-wide">
                  {res.reservationId}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 ${cfg.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {res.status}
                </span>
              </div>

              {/* Detail rows */}
              <div className="flex flex-col gap-1.5">
                <InfoRow
                  icon={Calendar}
                  label={reservationsService.formatDate(res.reservationDate)}
                />
                <InfoRow
                  icon={Clock}
                  label={formatTimeDisplay(res.reservationTime)}
                />
                <InfoRow
                  icon={Users}
                  label={`${res.partySize} ${res.partySize === 1 ? "guest" : "guests"}`}
                />
                {tables.map((t) => (
                  <InfoRow
                    key={t._id}
                    icon={TableIcon}
                    label={`Table #${t.tableNumber} — ${t.name} · ${t.location}`}
                  />
                ))}
                {res.tableSelectionMode && (
                  <span
                    className={`self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      res.tableSelectionMode === "stacked"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {res.tableSelectionMode === "stacked" ? (
                      <Layers className="w-3 h-3" />
                    ) : (
                      <LayoutGrid className="w-3 h-3" />
                    )}
                    {res.tableSelectionMode === "stacked"
                      ? "Stack Tables"
                      : "Custom Selection"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons — full width row at bottom of card */}
          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
            {canCancel && (
              <button
                onClick={() => {
                  setCancelTarget(res);
                  setShowCancelModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold border border-red-100 hover:border-red-500"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
            <button
              onClick={() => setExpandedId(isExpanded ? null : res._id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                isExpanded
                  ? "border-primary/40 text-primary bg-primary/5"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              aria-label="Toggle details"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              />
              {isExpanded ? "Hide Details" : "View Details"}
            </button>
          </div>
        </div>

        {/* Expanded details panel */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Contact */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Contact
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="break-all">{res.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {res.phone}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Special Requests
                </p>
                {res.specialRequests ? (
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="italic leading-relaxed">
                      {res.specialRequests}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No special requests
                  </p>
                )}
              </div>
            </div>

            {/* Guest List */}
            {res.guestDetails?.hasGuestList &&
              res.guestDetails?.guests?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Guest List ({res.guestDetails.guests.length}{" "}
                    {res.guestDetails.guests.length === 1 ? "Guest" : "Guests"})
                  </p>
                  <div className="space-y-2">
                    {res.guestDetails.guests.map((guest, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 bg-white rounded-xl border border-gray-100 px-3 py-2.5"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-[10px] font-bold">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {guest.name}
                          </p>
                          {guest.note && (
                            <p className="text-xs text-gray-400 italic mt-0.5">
                              {guest.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {res.tableSelectionMode && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Table Selection Mode
                </p>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    res.tableSelectionMode === "stacked"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {res.tableSelectionMode === "stacked" ? (
                    <Layers className="w-3.5 h-3.5" />
                  ) : (
                    <LayoutGrid className="w-3.5 h-3.5" />
                  )}
                  {res.tableSelectionMode === "stacked"
                    ? "Stack Tables"
                    : "Custom Selection"}
                </div>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Booked on{" "}
                <span className="font-medium text-gray-500">
                  {new Date(res.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/40 to-white pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                My Reservations
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {reservations.length > 0
                  ? `${reservations.length} reservation${reservations.length !== 1 ? "s" : ""}`
                  : "Your booking history"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadReservations}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => navigate("/reservations")}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-11 h-11 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">
              Loading your reservations...
            </p>
          </div>
        ) : reservations.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-orange-100">
              <BookOpen className="w-10 h-10 text-primary/50" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Reservations Yet
            </h3>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              You haven't made any table reservations yet. Book your first table
              and enjoy a wonderful dining experience!
            </p>
            <button
              onClick={() => navigate("/reservations")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-7 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Make a Reservation
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming section */}
            {upcomingReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h2 className="text-base font-bold text-gray-800">
                    Upcoming
                  </h2>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-2 py-0.5 rounded-full">
                    {upcomingReservations.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {upcomingReservations.map((r) => (
                    <ReservationCard key={r._id} res={r} isPast={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed section */}
            {completedReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h2 className="text-base font-bold text-gray-500">
                    Completed
                  </h2>
                  <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-2 py-0.5 rounded-full">
                    {completedReservations.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {completedReservations.map((r) => (
                    <div key={r._id}>
                      <ReservationCard res={r} isPast={true} />
                      <div className="mt-1.5 mx-1 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2.5">
                        <p className="text-xs text-blue-700 font-medium">
                          Hope you had a wonderful dining experience! We'd love
                          to have you back.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled section */}
            {cancelledReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <h2 className="text-base font-bold text-gray-500">
                    Cancelled
                  </h2>
                  <span className="bg-red-50 text-red-500 border border-red-100 text-xs font-bold px-2 py-0.5 rounded-full">
                    {cancelledReservations.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {cancelledReservations.map((r) => (
                    <div key={r._id}>
                      <ReservationCard res={r} isPast={true} />
                      <div className="mt-1.5 mx-1 px-4 py-2.5 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-2.5">
                        <p className="text-xs text-orange-700 font-medium">
                          This reservation was cancelled. Ready to book again?{" "}
                          <button
                            onClick={() => navigate("/reservations")}
                            className="underline font-semibold hover:text-primary transition-colors"
                          >
                            Make a new booking
                          </button>
                        </p>
                      </div>
                    </div>
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
