import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addTable, updateTable } from "../../store/slices/tablesSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import tablesService from "../../services/tablesService";
import {
  TableIcon,
  Save,
  ArrowLeft,
  Hash,
  Users,
  MapPin,
  AlignLeft,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";

const LOCATIONS = ["Indoor", "Outdoor", "VIP", "Bar"];
const STATUSES = ["Available", "Reserved", "Maintenance"];

const LOCATION_COLORS = {
  Indoor: "from-blue-500 to-blue-600",
  Outdoor: "from-green-500 to-green-600",
  VIP: "from-purple-500 to-purple-600",
  Bar: "from-orange-500 to-orange-600",
};

const AdminTableForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    tableNumber: "",
    name: "",
    capacity: "",
    location: "Indoor",
    status: "Available",
    description: "",
    imageUrl: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchTable = useCallback(async () => {
    if (!isEdit) return;
    setIsFetching(true);
    try {
      const table = await tablesService.getTableById(id);
      if (table) {
        setFormData({
          tableNumber: table.tableNumber ?? "",
          name: table.name ?? "",
          capacity: table.capacity ?? "",
          location: table.location ?? "Indoor",
          status: table.status ?? "Available",
          description: table.description ?? "",
          imageUrl: table.imageUrl ?? "",
          isActive: table.isActive !== undefined ? table.isActive : true,
        });
      }
    } catch (error) {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to load table data",
        }),
      );
      navigate("/admin/tables");
    } finally {
      setIsFetching(false);
    }
  }, [id, isEdit, dispatch, navigate]);

  useEffect(() => {
    fetchTable();
  }, [fetchTable]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.tableNumber)
      newErrors.tableNumber = "Table number is required";
    else if (isNaN(formData.tableNumber) || parseInt(formData.tableNumber) < 1)
      newErrors.tableNumber = "Table number must be a positive number";

    if (!formData.name.trim()) newErrors.name = "Table name is required";

    if (!formData.capacity) newErrors.capacity = "Capacity is required";
    else if (isNaN(formData.capacity) || parseInt(formData.capacity) < 1)
      newErrors.capacity = "Capacity must be at least 1";
    else if (parseInt(formData.capacity) > 20)
      newErrors.capacity = "Capacity cannot exceed 20";

    if (!formData.location) newErrors.location = "Location is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    const payload = {
      ...formData,
      tableNumber: parseInt(formData.tableNumber, 10),
      capacity: parseInt(formData.capacity, 10),
    };

    try {
      if (isEdit) {
        const result = await tablesService.updateTable(id, payload);
        if (result.success) {
          dispatch(updateTable(result.table));
          dispatch(
            showNotification({
              type: "success",
              message: "Table updated successfully",
            }),
          );
          navigate("/admin/tables");
        } else {
          dispatch(
            showNotification({ type: "error", message: result.message }),
          );
        }
      } else {
        const result = await tablesService.createTable(payload);
        if (result.success) {
          dispatch(addTable(result.table));
          dispatch(
            showNotification({
              type: "success",
              message: "Table created successfully",
            }),
          );
          navigate("/admin/tables");
        } else {
          dispatch(
            showNotification({ type: "error", message: result.message }),
          );
        }
      }
    } catch (error) {
      dispatch(
        showNotification({ type: "error", message: "Something went wrong" }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-gray font-medium">Loading table data...</p>
        </div>
      </div>
    );
  }

  const locationGradient =
    LOCATION_COLORS[formData.location] || "from-primary to-primary-dark";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg border-2 border-gray-200">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
              <TableIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary">
                {isEdit ? "Edit Table" : "Add New Table"}
              </h1>
              <p className="text-sm text-dark-gray">
                {isEdit
                  ? "Update table names, capacity and location details"
                  : "Fill in the details to create a new restaurant table"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/tables")}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tables
          </button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-xs font-semibold text-dark-gray uppercase tracking-wider mb-4">
          Preview
        </p>
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 bg-gradient-to-br ${locationGradient} rounded-2xl flex items-center justify-center shadow-md`}
          >
            <span className="text-white text-xl font-bold">
              {formData.tableNumber ? `#${formData.tableNumber}` : "#"}
            </span>
          </div>
          <div>
            <h3 className="font-sans font-bold text-dark text-lg">
              {formData.name || "Table Name"}
            </h3>
            <div className="flex flex-col lg:flex-row items-center gap-2 mt-1">
              <span className="text-xs text-dark-gray bg-gray-100 px-2 py-0.5 rounded-md">
                {formData.location}
              </span>
              <span className="text-xs text-dark-gray bg-gray-100 px-2 py-0.5 rounded-md">
                {formData.capacity || "0"} seats
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                  formData.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : formData.status === "Reserved"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {formData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="lg:p-6 p-3 space-y-5">
          {/* Row: Table Number + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Table Number */}
            <div className="space-y-2">
              <label className="block text-dark font-semibold text-sm">
                Table Number <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="number"
                  name="tableNumber"
                  value={formData.tableNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  min="1"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark placeholder:text-gray-400 ${
                    errors.tableNumber
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-primary"
                  }`}
                />
              </div>
              {errors.tableNumber && (
                <p className="text-red-500 text-xs">{errors.tableNumber}</p>
              )}
            </div>

            {/* Table Name */}
            <div className="space-y-2">
              <label className="block text-dark font-semibold text-sm">
                Table Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <TableIcon className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Garden Table, Booth A"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark placeholder:text-gray-400 ${
                    errors.name
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-primary"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Row: Capacity + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Capacity */}
            <div className="space-y-2">
              <label className="block text-dark font-semibold text-sm">
                Capacity (seats) <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Users className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                  min="1"
                  max="20"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark placeholder:text-gray-400 ${
                    errors.capacity
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-primary"
                  }`}
                />
              </div>
              {errors.capacity && (
                <p className="text-red-500 text-xs">{errors.capacity}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-dark font-semibold text-sm">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark bg-white appearance-none ${
                    errors.location
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-primary"
                  }`}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              {errors.location && (
                <p className="text-red-500 text-xs">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-dark font-semibold text-sm">
              Status
            </label>
            <div className="flex gap-3 flex-wrap">
              {STATUSES.map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.status === s
                      ? s === "Available"
                        ? "border-green-400 bg-green-50 text-green-700"
                        : s === "Reserved"
                          ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                          : "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-200 text-dark-gray hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={formData.status === s}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${
                      formData.status === s
                        ? s === "Available"
                          ? "bg-green-500"
                          : s === "Reserved"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="text-sm font-semibold">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-dark font-semibold text-sm">
              Description (optional)
            </label>
            <div className="relative group">
              <div className="absolute top-3.5 left-4 pointer-events-none">
                <AlignLeft className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Cozy corner booth with great view of the garden"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark placeholder:text-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
            <div>
              <p className="font-semibold text-dark text-sm">
                Active & Visible
              </p>
              <p className="text-xs text-dark-gray mt-0.5">
                Customers can see and book this table when active
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
              className="focus:outline-none"
            >
              {formData.isActive ? (
                <ToggleRight className="w-10 h-10 text-primary" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t border-gray-100 px-6 py-5 bg-gray-50 flex flex-col lg:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/tables")}
            className="w-full lg:w-auto px-6 py-3 rounded-xl border-2 border-gray-200 text-dark-gray font-semibold hover:border-gray-300 hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEdit ? "Saving..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? "Save Changes" : "Create Table"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTableForm;
