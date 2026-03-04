import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import reservationsService from "../../services/reservationsService";
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
  RefreshCw,
  FileText,
  ChevronDown,
  UserPlus,
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
  const tableInfo = res.tableId;
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
                  {res.isGuestReservation ? "Walk-in / Guest" : "Registered User"}
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
                <p className="text-xs text-dark-gray font-semibold mb-0.5">Date</p>
                <p className="text-sm font-medium text-dark">
                  {formatDate(res.reservationDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
              <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-dark-gray font-semibold mb-0.5">Time</p>
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
                  {res.partySize}{" "}
                  {res.partySize === 1 ? "Guest" : "Guests"}
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
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <TableIcon className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-dark">Table Details</h2>
          </div>
          {tableInfo ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-gradient-to-r from-cream-light to-cream rounded-2xl p-4 border border-primary/10">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    #{tableInfo.tableNumber}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-dark text-base">
                    {tableInfo.name}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-dark-gray mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {tableInfo.location}
                  </div>
                  {tableInfo.capacity && (
                    <p className="text-xs text-dark-gray mt-1">
                      Up to {tableInfo.capacity} seats
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <TableIcon className="w-6 h-6 text-dark-gray" />
              </div>
              <p className="text-sm text-dark-gray">No table assigned</p>
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
                  className="bg-gradient-to-r from-cream-light to-cream rounded-2xl p-4 border border-primary/10 hover:border-primary/20 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-dark text-sm truncate">
                        {guest.name}
                      </p>
                      {guest.note ? (
                        <p className="text-xs text-dark-gray mt-1 italic leading-relaxed">
                          {guest.note}
                        </p>
                      ) : (
                        <p className="text-xs text-dark-gray/60 mt-1 italic">
                          No note
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-dark-gray/40" />
              </div>
              <p className="font-semibold text-dark mb-1">
                No guest details provided
              </p>
              <p className="text-sm text-dark-gray max-w-sm">
                The customer did not add individual guest names for this
                reservation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReservationDetail;
