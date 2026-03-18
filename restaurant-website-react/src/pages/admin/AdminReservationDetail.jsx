import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import reservationsService from "../../services/reservationsService";
import tablesService from "../../services/tablesService";
import { updateReservationStatus } from "../../store/slices/reservationsSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import {
  ArrowLeft,
  CalendarCheck,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  Hash,
  MessageSquare,
  TableIcon,
  UserCheck,
  UserX,
  FileText,
  ChevronDown,
  UserPlus,
  User,
  LayoutGrid,
  Layers,
  Plus,
  Check,
  Loader2,
} from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Cancelled", "Completed"];

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  Confirmed: "bg-green-100 text-green-800 border border-green-200",
  Cancelled: "bg-red-100 text-red-800 border border-red-200",
  Completed: "bg-blue-100 text-blue-800 border border-blue-200",
};

const STATUS_BAR = {
  Pending: "from-yellow-400 to-yellow-500",
  Confirmed: "from-green-500 to-green-600",
  Cancelled: "from-red-400 to-red-500",
  Completed: "from-blue-500 to-blue-600",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

const AdminReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Table assignment state (stacked mode only)
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await reservationsService.getReservationById(id);
        if (result.success) {
          setReservation(result.reservation);
        } else {
          setError(result.message || "Reservation not found");
        }
      } catch {
        setError("Failed to load reservation details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!reservation || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const result = await reservationsService.updateReservationStatus(
        reservation._id,
        newStatus,
      );
      if (result.success) {
        setReservation((prev) => ({ ...prev, status: newStatus }));
        dispatch(
          updateReservationStatus({
            reservationId: reservation._id,
            status: newStatus,
          }),
        );
        dispatch(
          showNotification({
            type: "success",
            message: `Status updated to ${newStatus}`,
          }),
        );
      } else {
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      dispatch(
        showNotification({ type: "error", message: "Failed to update status" }),
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Table filtering logic (mirrors Reservations.jsx) ──────────────────────
  const partySize = reservation?.partySize || 0;

  // Combined capacity of currently selected tables
  const assignCombinedCap = useMemo(
    () =>
      availableTables
        .filter((t) => selectedTableIds.includes(t._id))
        .reduce((s, t) => s + t.capacity, 0),
    [availableTables, selectedTableIds],
  );

  // Remaining seats still needed
  const assignRemaining = Math.max(0, partySize - assignCombinedCap);

  // Does any single table NOT cover the full party? → must multi-select
  const assignNeedsMulti = useMemo(
    () =>
      availableTables.length > 0 &&
      availableTables.every((t) => t.capacity < partySize),
    [availableTables, partySize],
  );

  // Target capacity tier for the "last pick" in multi-select mode
  const assignTargetCap = useMemo(() => {
    if (!assignNeedsMulti || assignRemaining <= 0) return null;
    const unselected = availableTables.filter(
      (t) => !selectedTableIds.includes(t._id),
    );
    if (!unselected.length) return null;
    const maxCap = Math.max(...unselected.map((t) => t.capacity));
    if (assignRemaining > maxCap) return "ALL";
    const fits = unselected.filter((t) => t.capacity >= assignRemaining);
    return Math.min(...fits.map((t) => t.capacity));
  }, [assignNeedsMulti, assignRemaining, availableTables, selectedTableIds]);

  // Which tables to show in the assign panel
  const assignFilteredTables = useMemo(() => {
    if (!availableTables.length) return [];
    return availableTables
      .filter((t) => {
        const isSel = selectedTableIds.includes(t._id);
        if (isSel) return true; // always show selected (allow deselect)
        if (!assignNeedsMulti) return t.capacity >= partySize; // single-select: must fit party
        if (assignRemaining <= 0) return false; // capacity already met
        if (assignTargetCap === "ALL") return true; // still need multiple
        return t.capacity === assignTargetCap; // final-pick tier
      })
      .sort((a, b) => {
        const aS = selectedTableIds.includes(a._id) ? 0 : 1;
        const bS = selectedTableIds.includes(b._id) ? 0 : 1;
        if (aS !== bS) return aS - bS;
        return b.capacity - a.capacity;
      });
  }, [
    availableTables,
    selectedTableIds,
    assignNeedsMulti,
    partySize,
    assignRemaining,
    assignTargetCap,
  ]);

  // Whether a table card should appear disabled
  const isAssignTableDisabled = useCallback(
    (table) => {
      if (selectedTableIds.includes(table._id)) return false; // selected → allow deselect
      if (!assignNeedsMulti) return table.capacity < partySize;
      return assignRemaining <= 0;
    },
    [selectedTableIds, assignNeedsMulti, partySize, assignRemaining],
  );
  // ──────────────────────────────────────────────────────────────────────────

  const openAssignPanel = async () => {
    setShowAssignPanel(true);
    setLoadingTables(true);
    setSelectedTableIds([]);
    try {
      const tables = await tablesService.getAvailableTables({
        date: reservation.reservationDate,
        time: reservation.reservationTime,
        excludeReservationId: reservation._id,
      });
      setAvailableTables(tables);
    } catch {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to load available tables",
        }),
      );
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const toggleTableSelection = (tableId) => {
    setSelectedTableIds((prev) => {
      const isSel = prev.includes(tableId);
      if (isSel) return prev.filter((id) => id !== tableId);
      // Block adding when capacity already satisfied
      const currentCap = availableTables
        .filter((t) => prev.includes(t._id))
        .reduce((s, t) => s + t.capacity, 0);
      if (currentCap >= partySize) return prev;
      return [...prev, tableId];
    });
  };

  const handleAssignTables = async () => {
    if (selectedTableIds.length === 0) return;
    setAssigning(true);
    try {
      const result = await reservationsService.assignTablesToReservation(
        reservation._id,
        selectedTableIds,
      );
      if (result.success) {
        setReservation(result.reservation);
        setShowAssignPanel(false);
        setSelectedTableIds([]);
        dispatch(
          showNotification({ type: "success", message: result.message }),
        );
      } else {
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      dispatch(
        showNotification({ type: "error", message: "Failed to assign tables" }),
      );
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-gray font-medium">Loading reservation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/admin/reservations")}
          className="flex items-center gap-2 text-dark-gray hover:text-primary font-semibold transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reservations
        </button>
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">
            Reservation Not Found
          </h3>
          <p className="text-dark-gray">{error}</p>
        </div>
      </div>
    );
  }

  const res = reservation;
  const tables =
    res.tableIds?.length > 0 ? res.tableIds : res.tableId ? [res.tableId] : [];
  const barClass = STATUS_BAR[res.status] || "from-gray-400 to-gray-500";
  const guestDetails = res.guestDetails;
  const hasGuests =
    guestDetails?.hasGuestList && guestDetails?.guests?.length > 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/reservations")}
        className="flex items-center gap-2 text-dark-gray hover:text-primary font-semibold transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reservations
      </button>

      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className={`h-1.5 w-full bg-gradient-to-r ${barClass}`} />
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${res.isGuestReservation ? "bg-orange-100 shadow-orange-100" : "bg-primary/10 shadow-primary/20"}`}
            >
              {res.isGuestReservation ? (
                <UserX className="w-7 h-7 text-orange-500" />
              ) : (
                <UserCheck className="w-7 h-7 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-sans font-bold text-primary">
                  Reservation Details
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${STATUS_STYLES[res.status] || "bg-gray-100 text-gray-800"}`}
                >
                  {res.status}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${res.isGuestReservation ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary"}`}
                >
                  {res.isGuestReservation ? "Guest" : "Registered User"}
                </span>
              </div>
              <p className="text-xs font-mono text-dark-gray mt-0.5">
                {res.reservationId}
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
                value={res.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`pl-3 pr-7 py-2 rounded-xl text-xs font-semibold border-2 cursor-pointer appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed ${STATUS_STYLES[res.status] || "bg-gray-100 border-gray-200 text-gray-800"}`}
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

      {/* Top Grid: Booking Contact + Reservation Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Contact */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-dark">Booking Contact</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: UserCheck, label: "Name", value: res.fullName },
              {
                icon: Mail,
                label: "Email",
                value: res.email,
                href: `mailto:${res.email}`,
              },
              {
                icon: Phone,
                label: "Phone",
                value: res.phone,
                href: `tel:${res.phone}`,
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
                      {value || "N/A"}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-dark break-all">
                      {value || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
              {res.isGuestReservation ? (
                <UserX className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              ) : (
                <UserCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs text-dark-gray font-semibold mb-0.5">
                  Customer Type
                </p>
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${res.isGuestReservation ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary"}`}
                >
                  {res.isGuestReservation
                    ? "Walk-in / Guest"
                    : "Registered User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-dark">Reservation Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-dark-gray font-semibold mb-0.5">
                  Date
                </p>
                <p className="text-sm font-medium text-dark">
                  {formatDate(res.reservationDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
              <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-dark-gray font-semibold mb-0.5">
                  Time
                </p>
                <p className="text-sm font-medium text-dark">
                  {formatTime(res.reservationTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
              <Users className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-dark-gray font-semibold mb-0.5">
                  Party Size
                </p>
                <p className="text-sm font-medium text-dark">
                  {res.partySize} {res.partySize === 1 ? "Guest" : "Guests"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
              <Hash className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-dark-gray font-semibold mb-0.5">
                  Reservation ID
                </p>
                <p className="text-xs font-mono font-medium text-dark break-all">
                  {res.reservationId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table + Special Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <TableIcon className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-bold text-dark">Table Details</h2>
            </div>
            {res.tableSelectionMode === "stacked" && !showAssignPanel && (
              <button
                onClick={openAssignPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {tables.length > 0 ? "Reassign Tables" : "Assign Tables"}
              </button>
            )}
          </div>

          {/* Assign Panel (stacked mode) */}
          {showAssignPanel && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-amber-800">
                  Select tables to assign
                </p>
                <button
                  onClick={() => {
                    setShowAssignPanel(false);
                    setSelectedTableIds([]);
                  }}
                  className="text-xs text-dark-gray hover:text-dark font-semibold"
                >
                  Cancel
                </button>
              </div>
              {loadingTables ? (
                <div className="flex items-center gap-2 py-4 justify-center text-dark-gray text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading available tables...
                </div>
              ) : availableTables.length === 0 ? (
                <p className="text-sm text-dark-gray text-center py-4">
                  No tables available at this date and time.
                </p>
              ) : assignFilteredTables.length === 0 ? (
                <p className="text-sm text-dark-gray text-center py-4">
                  No tables can accommodate {partySize} guests at this slot.
                </p>
              ) : (
                <>
                  {/* Seat progress hint */}
                  <div className="mb-3 flex items-center justify-between text-xs font-medium">
                    <span className="text-amber-700">
                      Party of <span className="font-bold">{partySize}</span>
                      {assignCombinedCap > 0 && (
                        <>
                          {" "}
                          ·{" "}
                          <span className="text-primary font-bold">
                            {assignCombinedCap}
                          </span>{" "}
                          seats covered
                        </>
                      )}
                    </span>
                    {assignRemaining > 0 && (
                      <span className="text-dark-gray">
                        Need{" "}
                        <span className="font-bold text-amber-700">
                          {assignRemaining}
                        </span>{" "}
                        more seat{assignRemaining !== 1 ? "s" : ""}
                      </span>
                    )}
                    {assignRemaining <= 0 && selectedTableIds.length > 0 && (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Full coverage
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {assignFilteredTables.map((t) => {
                      const isSelected = selectedTableIds.includes(t._id);
                      const disabled = isAssignTableDisabled(t);
                      return (
                        <button
                          key={t._id}
                          onClick={() =>
                            !disabled && toggleTableSelection(t._id)
                          }
                          disabled={disabled}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : disabled
                                ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                                : "border-gray-200 bg-white hover:border-primary/40 cursor-pointer"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-dark-gray"
                            }`}
                          >
                            #{t.tableNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-dark text-sm truncate">
                              {t.name}
                            </p>
                            <p className="text-xs text-dark-gray">
                              {t.location} · {t.capacity} seats
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTableIds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200 flex items-center justify-between gap-3">
                      <p className="text-xs text-amber-700 font-medium">
                        {selectedTableIds.length} table
                        {selectedTableIds.length !== 1 ? "s" : ""} ·{" "}
                        {assignCombinedCap} seats
                        {assignRemaining > 0 && (
                          <span className="text-red-500 ml-1">
                            (need {assignRemaining} more)
                          </span>
                        )}
                      </p>
                      <button
                        onClick={handleAssignTables}
                        disabled={assigning || assignRemaining > 0}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {assigning ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        {assigning ? "Assigning..." : "Confirm Assignment"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tables.length > 0 ? (
            <div className="space-y-3">
              {tables.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center gap-4 bg-gradient-to-r from-cream-light to-cream rounded-2xl p-4 border border-primary/10"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      #{t.tableNumber}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-dark text-base">{t.name}</p>
                    <div className="flex items-center gap-1 text-sm text-dark-gray mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {t.location}
                    </div>
                    {t.capacity && (
                      <p className="text-xs text-dark-gray mt-1">
                        Up to {t.capacity} seats
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {res.tableSelectionMode && (
                <div className="pt-1">
                  <p className="text-xs text-dark-gray font-semibold mb-2">
                    Selection Mode
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <TableIcon className="w-6 h-6 text-dark-gray" />
              </div>
              {res.tableSelectionMode === "stacked" ? (
                <>
                  <p className="text-sm font-semibold text-amber-700">
                    Pending table assignment
                  </p>
                  <p className="text-xs text-dark-gray mt-1">
                    Use "Assign Tables" to allocate tables for this reservation
                  </p>
                </>
              ) : (
                <p className="text-sm text-dark-gray">No table assigned</p>
              )}
            </div>
          )}
        </div>

        {/* Special Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-dark">Special Requests</h2>
          </div>
          {res.specialRequests ? (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-dark italic leading-relaxed">
                "{res.specialRequests}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-dark-gray" />
              </div>
              <p className="text-sm text-dark-gray">No special requests</p>
            </div>
          )}

          {/* Booked on */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-dark-gray">
              Booked on{" "}
              <span className="font-medium text-dark">
                {new Date(res.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Guest List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-dark">Guest List</h2>
            <p className="text-xs text-dark-gray mt-0.5">
              {hasGuests
                ? `${guestDetails.guests.length} guest${guestDetails.guests.length !== 1 ? "s" : ""} named`
                : "No guest names provided"}
            </p>
          </div>
        </div>

        <div className="p-6">
          {hasGuests ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guestDetails.guests.map((guest, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-dark text-sm truncate">
                          {guest.name}
                        </p>
                        <span className="text-[10px] font-bold text-primary/40 group-hover:text-primary transition-colors">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      {guest.note ? (
                        <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                          <p className="text-xs text-dark-gray leading-relaxed">
                            <MessageSquare className="w-3 h-3 inline-block mr-1 text-primary/40" />
                            {guest.note}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-dark-gray/40 mt-1 uppercase tracking-wider font-semibold">
                          No additional note
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm relative">
                <Users className="w-10 h-10 text-gray-300" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-50 rounded-full flex items-center justify-center border-2 border-white">
                  <UserX className="w-4 h-4 text-red-400" />
                </div>
              </div>
              <h3 className="font-bold text-dark text-lg mb-1">
                No Guest Names Listed
              </h3>
              <p className="text-sm text-dark-gray max-w-sm mx-auto leading-relaxed">
                This reservation was made without providing individual guest
                names. You can still manage the booking normally using the
                primary contact information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReservationDetail;
