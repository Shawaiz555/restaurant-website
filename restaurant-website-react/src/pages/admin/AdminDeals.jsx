import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setDeals,
  deleteDeal,
  updateDeal,
  setFilters,
  selectFilteredDeals,
  selectDealStats,
  selectDealsFilters,
} from "../../store/slices/dealsSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import dealsService from "../../services/dealsService";
import SearchBar from "../../components/admin/common/SearchBar";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import StatsCard from "../../components/admin/common/StatsCard";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  ChevronsLeft,
  ChevronsRight,
  Package,
} from "lucide-react";

const AdminDeals = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const deals = useSelector(selectFilteredDeals);
  const stats = useSelector(selectDealStats);
  const filters = useSelector(selectDealsFilters);

  const [dealToDelete, setDealToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadDeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const allDeals = await dealsService.getDeals({ all: true });
      dispatch(setDeals(allDeals));
    } catch (error) {
      console.error("Failed to load deals:", error);
      dispatch(showNotification({ type: "error", message: "Failed to load deals" }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.search]);

  const handleDeleteClick = (deal) => {
    setDealToDelete(deal);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dealToDelete) return;
    try {
      const result = await dealsService.deleteDeal(dealToDelete._id);
      if (result.success) {
        dispatch(deleteDeal(dealToDelete._id));
        dispatch(showNotification({ type: "success", message: "Deal deleted successfully" }));
      } else {
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      dispatch(showNotification({ type: "error", message: "Failed to delete deal" }));
    } finally {
      setShowDeleteConfirm(false);
      setDealToDelete(null);
    }
  };

  const handleToggle = async (deal) => {
    if (togglingId) return;
    setTogglingId(deal._id);
    try {
      const result = await dealsService.toggleDeal(deal._id);
      if (result.success) {
        dispatch(updateDeal(result.deal));
        dispatch(
          showNotification({
            type: "success",
            message: `Deal ${result.deal.isActive ? "activated" : "deactivated"} successfully`,
          })
        );
      } else {
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      dispatch(showNotification({ type: "error", message: "Failed to toggle deal" }));
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(deals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDeals = deals.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-sans font-bold text-primary mb-2">
              Deal Management
            </h1>
            <p className="text-dark-gray text-sm mt-1">
              Create and manage special meal deals for your customers
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/deals/new")}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard icon={Tag} label="Total Deals" value={stats.total} />
        <StatsCard icon={CheckCircle} label="Active" value={stats.active} />
        <StatsCard icon={XCircle} label="Inactive" value={stats.inactive} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full">
            <SearchBar
              placeholder="Search deals by title or item name..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-dark-gray">
            Showing <span className="font-semibold text-dark">{deals.length}</span>{" "}
            deal{deals.length !== 1 ? "s" : ""}
          </p>
          {(filters.status !== "All" || filters.search) && (
            <button
              onClick={() => dispatch(setFilters({ status: "All", search: "" }))}
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
            <p className="text-dark-gray font-medium">Loading deals...</p>
          </div>
        </div>
      ) : paginatedDeals.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-sans font-bold text-dark mb-2">No deals found</h3>
          <p className="text-dark-gray mb-6">
            {filters.search || filters.status !== "All"
              ? "Try adjusting your filters"
              : "Get started by creating your first deal"}
          </p>
          <button
            onClick={() => navigate("/admin/deals/new")}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all"
          >
            <Plus className="w-4 h-4" />
            Create First Deal
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider">
                    Date Range
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
                {paginatedDeals.map((deal) => (
                  <tr key={deal._id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* Deal title + item count */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-dark text-sm truncate max-w-[200px]">
                            {deal.title}
                          </p>
                          {deal.description && (
                            <p className="text-xs text-dark-gray mt-0.5 truncate max-w-[200px]">
                              {deal.description}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-1 mt-1 text-xs text-dark-gray bg-gray-100 px-2 py-0.5 rounded-full">
                            <Package className="w-3 h-3" />
                            {deal.items?.length || 0} item{deal.items?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Item image thumbnails */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {(deal.items || []).slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-cream flex-shrink-0"
                            style={{ marginLeft: idx > 0 ? "-8px" : "0" }}
                            title={item.name}
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-primary font-bold">
                                {item.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                        ))}
                        {(deal.items || []).length > 3 && (
                          <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary"
                            style={{ marginLeft: "-8px" }}
                          >
                            +{deal.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary text-base">
                        Rs. {Number(deal.price).toFixed(0)}
                      </span>
                    </td>

                    {/* Date range */}
                    <td className="px-6 py-4">
                      {deal.startDate || deal.endDate ? (
                        <div className="text-xs text-dark-gray space-y-0.5">
                          {deal.startDate && <p>From: {formatDate(deal.startDate)}</p>}
                          {deal.endDate && <p>Until: {formatDate(deal.endDate)}</p>}
                        </div>
                      ) : (
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-100">
                          Always Active
                        </span>
                      )}
                    </td>

                    {/* Active toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(deal)}
                        disabled={togglingId === deal._id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          deal.isActive ? "bg-primary" : "bg-gray-300"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                        title={deal.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            deal.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/deals/${deal._id}/edit`)}
                          className="p-2 text-dark-gray hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Edit deal"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(deal)}
                          className="p-2 text-dark-gray hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete deal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-dark-gray">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDealToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Deal"
        message={
          dealToDelete
            ? `Are you sure you want to delete "${dealToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminDeals;
