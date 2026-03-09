import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setTables,
  deleteTable,
  setFilters,
  selectFilteredTables,
  selectTableStats,
  selectTablesFilters,
} from "../../store/slices/tablesSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import tablesService from "../../services/tablesService";
import SearchBar from "../../components/admin/common/SearchBar";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import StatsCard from "../../components/admin/common/StatsCard";
import {
  Plus,
  Edit,
  Trash2,
  TableIcon,
  Users,
  MapPin,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  Clock,
  Wrench,
} from "lucide-react";

const LOCATION_STYLES = {
  Indoor: "bg-blue-100 text-blue-800 border border-blue-200",
  Outdoor: "bg-green-100 text-green-800 border border-green-200",
  VIP: "bg-purple-100 text-purple-800 border border-purple-200",
  Bar: "bg-orange-100 text-orange-800 border border-orange-200",
};

const STATUS_STYLES = {
  Available: "bg-green-100 text-green-800 border border-green-200",
  Reserved: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  Maintenance: "bg-red-100 text-red-800 border border-red-200",
};

const STATUS_ICONS = {
  Available: CheckCircle,
  Reserved: Clock,
  Maintenance: Wrench,
};

const AdminTables = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tables = useSelector(selectFilteredTables);
  const stats = useSelector(selectTableStats);
  const filters = useSelector(selectTablesFilters);

  const [tableToDelete, setTableToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const loadTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const allTables = await tablesService.getTables();
      dispatch(setTables(allTables));
    } catch (error) {
      console.error("Failed to load tables:", error);
      dispatch(
        showNotification({ type: "error", message: "Failed to load tables" }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.location, filters.status, filters.search]);

  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tableToDelete) return;
    try {
      const result = await tablesService.deleteTable(tableToDelete._id);
      if (result.success) {
        dispatch(deleteTable(tableToDelete._id));
        dispatch(
          showNotification({
            type: "success",
            message: "Table deleted successfully",
          }),
        );
      } else {
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      dispatch(
        showNotification({ type: "error", message: "Failed to delete table" }),
      );
    } finally {
      setShowDeleteConfirm(false);
      setTableToDelete(null);
    }
  };

  const totalPages = Math.ceil(tables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTables = tables.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-sans font-bold text-primary mb-2">
              Tables Management
            </h1>
            <p className="text-dark-gray text-sm mt-1">
              Manage restaurant tables, capacity, and availability
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/tables/new")}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Table
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard icon={TableIcon} label="Total Tables" value={stats.total} />
        <StatsCard
          icon={CheckCircle}
          label="Available"
          value={stats.available}
        />
        <StatsCard icon={Clock} label="Reserved" value={stats.reserved} />
        <StatsCard
          icon={Wrench}
          label="Maintenance"
          value={stats.maintenance}
        />
        <StatsCard
          icon={Users}
          label="Total Capacity"
          value={stats.totalCapacity}
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full">
            <SearchBar
              placeholder="Search tables by name or number..."
              onSearch={(val) => dispatch(setFilters({ search: val }))}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filters.location}
              onChange={(e) =>
                dispatch(setFilters({ location: e.target.value }))
              }
              className="w-full lg:w-auto px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-dark bg-white transition-all"
            >
              <option value="All">All Locations</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="VIP">VIP</option>
              <option value="Bar">Bar</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
              className="w-full lg:w-auto px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-dark bg-white transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-dark-gray">
            Showing{" "}
            <span className="font-semibold text-dark">{tables.length}</span>{" "}
            table{tables.length !== 1 ? "s" : ""}
          </p>
          {(filters.location !== "All" ||
            filters.status !== "All" ||
            filters.search) && (
            <button
              onClick={() =>
                dispatch(
                  setFilters({ location: "All", status: "All", search: "" }),
                )
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
            <p className="text-dark-gray font-medium">Loading tables...</p>
          </div>
        </div>
      ) : paginatedTables.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <TableIcon className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-sans font-bold text-dark mb-2">
            No tables found
          </h3>
          <p className="text-dark-gray mb-6">
            {filters.search ||
            filters.location !== "All" ||
            filters.status !== "All"
              ? "Try adjusting your filters"
              : "Get started by adding your first table"}
          </p>
          <button
            onClick={() => navigate("/admin/tables/new")}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all"
          >
            <Plus className="w-4 h-4" />
            Add First Table
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Table
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Active
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedTables.map((table) => {
                  const StatusIcon = STATUS_ICONS[table.status] || CheckCircle;
                  return (
                    <tr
                      key={table._id}
                      className="hover:bg-cream-light/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              #{table.tableNumber}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-dark text-sm">
                              {table.name}
                            </p>
                            {table.description && (
                              <p className="text-xs text-dark-gray line-clamp-1">
                                {table.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${LOCATION_STYLES[table.location] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                        >
                          <MapPin className="w-3 h-3" />
                          {table.location}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-dark text-sm font-medium">
                          <Users className="w-4 h-4 text-primary" />
                          {table.capacity} seats
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_STYLES[table.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {table.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${table.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {table.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/tables/${table._id}/edit`)
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cream-light text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(table)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100">
          <p className="text-sm text-dark-gray">
            Page <span className="font-semibold text-dark">{currentPage}</span>{" "}
            of <span className="font-semibold text-dark">{totalPages}</span>
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
              if (end - start + 1 < maxButtons) {
                start = Math.max(1, end - maxButtons + 1);
              }
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

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Table"
        message={`Are you sure you want to delete Table #${tableToDelete?.tableNumber} — "${tableToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTableToDelete(null);
        }}
        variant="danger"
        confirmText="Delete Table"
      />
    </div>
  );
};

export default AdminTables;
