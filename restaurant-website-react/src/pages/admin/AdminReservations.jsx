import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setReservations,
  updateReservationStatus,
  deleteReservation,
  setFilters,
  selectFilteredReservations,
  selectReservationStats,
  selectReservationsFilters,
} from "../../store/slices/reservationsSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import reservationsService from "../../services/reservationsService";
import SearchBar from "../../components/admin/common/SearchBar";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import StatsCard from "../../components/admin/common/StatsCard";
import {
  CalendarCheck,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  RefreshCw,
  UserCheck,
  UserX,
  ClipboardList,
} from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Cancelled", "Completed"];

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  Confirmed: "bg-green-100 text-green-800 border border-green-200",
  Cancelled: "bg-red-100 text-red-800 border border-red-200",
  Completed: "bg-blue-100 text-blue-800 border border-blue-200",
};

const AdminReservations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reservations = useSelector(selectFilteredReservations);
  const stats = useSelector(selectReservationStats);
  const filters = useSelector(selectReservationsFilters);

  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const allReservations = await reservationsService.getReservations();
      dispatch(setReservations(allReservations));
    } catch {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to load reservations",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.date, filters.search]);

  const handleStatusChange = async (reservationId, newStatus) => {
    setUpdatingId(reservationId);
    try {
      const result = await reservationsService.updateReservationStatus(
        reservationId,
        newStatus,
      );
      if (result.success) {
        dispatch(updateReservationStatus({ reservationId, status: newStatus }));
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
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reservationToDelete) return;
    try {
      const result = await reservationsService.deleteReservation(
        reservationToDelete._id,
      );
      if (result.success) {
        dispatch(deleteReservation(reservationToDelete._id));
        dispatch(
          showNotification({
            type: "success",
            message: "Reservation deleted successfully",
          }),
        );
      } else {
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to delete reservation",
        }),
      );
    } finally {
      setShowDeleteConfirm(false);
      setReservationToDelete(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = reservations.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-sans font-bold text-primary mb-2">
              Reservations Management
            </h1>
            <p className="text-dark-gray text-sm mt-1">
              Manage and track all table reservations
            </p>
          </div>
          <button
            onClick={loadReservations}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-dark-gray hover:border-primary hover:text-primary transition-all text-sm font-medium"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
        <StatsCard icon={CalendarCheck} label="Total" value={stats.total} />
        <StatsCard icon={Clock} label="Pending" value={stats.pending} />
        <StatsCard
          icon={CheckCircle}
          label="Confirmed"
          value={stats.confirmed}
        />
        <StatsCard icon={XCircle} label="Cancelled" value={stats.cancelled} />
        <StatsCard
          icon={CalendarCheck}
          label="Completed"
          value={stats.completed}
        />
        <StatsCard icon={Calendar} label="Today" value={stats.today} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full">
            <SearchBar
              placeholder="Search by name, email, phone or ID..."
              onSearch={(val) => dispatch(setFilters({ search: val }))}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filters.status}
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
              className="w-full lg:w-auto px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-dark bg-white transition-all"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => dispatch(setFilters({ date: e.target.value }))}
              className="w-full lg:w-auto px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-dark bg-white transition-all"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-dark-gray">
            <span className="font-semibold text-dark">
              {reservations.length}
            </span>{" "}
            reservation{reservations.length !== 1 ? "s" : ""}
          </p>
          {(filters.status !== "All" || filters.date || filters.search) && (
            <button
              onClick={() =>
                dispatch(setFilters({ status: "All", date: "", search: "" }))
              }
              className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-dark-gray font-medium">
              Loading reservations...
            </p>
          </div>
        </div>
      ) : paginatedReservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-sans font-bold text-dark mb-2">
            No reservations found
          </h3>
          <p className="text-dark-gray">
            {filters.search || filters.status !== "All" || filters.date
              ? "Try adjusting your filters"
              : "Reservations will appear here when customers book tables"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                      Reservation
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider hidden md:table-cell">
                      Date & Time
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider hidden lg:table-cell">
                      Table
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider hidden sm:table-cell">
                      Guests
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedReservations.map((res) => {
                    const tables =
                      res.tableIds?.length > 0
                        ? res.tableIds
                        : res.tableId
                          ? [res.tableId]
                          : [];

                    return (
                      <tr
                        key={res._id}
                        className="transition-colors cursor-pointer hover:bg-cream-light/30"
                        onClick={() =>
                          navigate(`/admin/reservations/${res._id}`)
                        }
                      >
                        {/* Reservation Info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${res.isGuestReservation ? "bg-orange-100" : "bg-primary/10"}`}
                            >
                              {res.isGuestReservation ? (
                                <UserX className="w-5 h-5 text-orange-500" />
                              ) : (
                                <UserCheck className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-dark text-sm">
                                {res.fullName}
                              </p>
                              <p className="text-xs text-dark-gray font-mono">
                                {res.reservationId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <p className="text-sm font-semibold text-dark">
                            {reservationsService.formatDate(
                              res.reservationDate,
                            )}
                          </p>
                          <p className="text-xs text-dark-gray">
                            {reservationsService.formatTime(
                              res.reservationTime,
                            )}
                          </p>
                        </td>

                        {/* Table */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          {tables.length > 0 ? (
                            <div className="space-y-1.5">
                              {tables.map((t) => (
                                <div
                                  key={t._id}
                                  className="flex items-center gap-1.5"
                                >
                                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-primary">
                                      #{t.tableNumber}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-dark">
                                      {t.name}
                                    </p>
                                    <p className="text-xs text-dark-gray">
                                      {t.location}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-dark-gray">—</span>
                          )}
                        </td>

                        {/* Party Size */}
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-dark text-sm font-medium">
                            <Users className="w-4 h-4 text-primary" />
                            {res.partySize}
                          </div>
                        </td>

                        {/* Status */}
                        <td
                          className="px-5 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative">
                            <select
                              value={res.status}
                              onChange={(e) =>
                                handleStatusChange(res._id, e.target.value)
                              }
                              disabled={updatingId === res._id}
                              className={`w-full pl-2 pr-6 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed ${STATUS_STYLES[res.status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                          </div>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-5 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/reservations/${res._id}`);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold border border-primary/20 hover:border-primary"
                              title="View details"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReservationToDelete(res);
                                setShowDeleteConfirm(true);
                              }}
                              className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                              title="Delete reservation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100">
          <p className="text-sm text-dark-gray">
            Showing{" "}
            <span className="font-semibold text-dark">{startIndex + 1}</span>
            {" – "}
            <span className="font-semibold text-dark">
              {Math.min(startIndex + itemsPerPage, reservations.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-dark">
              {reservations.length}
            </span>{" "}
            reservation{reservations.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-dark-gray hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            {(() => {
              const maxButtons = 5;
              const half = Math.floor(maxButtons / 2);
              let start = Math.max(1, currentPage - half);
              let end = Math.min(totalPages, start + maxButtons - 1);
              if (end - start + 1 < maxButtons)
                start = Math.max(1, end - maxButtons + 1);
              return Array.from(
                { length: end - start + 1 },
                (_, i) => start + i,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                    currentPage === page
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                      : "border-2 border-gray-200 text-dark-gray hover:border-primary hover:text-primary"
                  }`}
                >
                  {page}
                </button>
              ));
            })()}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-dark-gray hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Reservation"
        message={`Are you sure you want to delete reservation "${reservationToDelete?.reservationId}" for ${reservationToDelete?.fullName}? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setReservationToDelete(null);
        }}
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
};

export default AdminReservations;
