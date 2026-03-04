import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addDeal, updateDeal } from "../../store/slices/dealsSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import dealsService from "../../services/dealsService";
import productsService from "../../services/productsService";
import {
  ArrowLeft,
  Tag,
  Plus,
  Minus,
  X,
  Search,
  Check,
  ChevronDown,
  Edit3,
} from "lucide-react";

const AdminDealForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const pickerRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    items: [],
    isActive: true,
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Product picker state
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load all products for picker
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const products = await productsService.fetchProducts();
      setAllProducts(products);
    } catch {
      // Non-critical
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Load existing deal if editing
  const fetchDeal = useCallback(async () => {
    if (!isEdit) return;
    setIsFetching(true);
    try {
      const deal = await dealsService.getDealById(id);
      if (deal) {
        setFormData({
          title: deal.title || "",
          description: deal.description || "",
          price: deal.price !== undefined ? String(deal.price) : "",
          items: deal.items || [],
          isActive: deal.isActive !== undefined ? deal.isActive : true,
          startDate: deal.startDate ? deal.startDate.split("T")[0] : "",
          endDate: deal.endDate ? deal.endDate.split("T")[0] : "",
        });
      }
    } catch {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to load deal data",
        }),
      );
      navigate("/admin/deals");
    } finally {
      setIsFetching(false);
    }
  }, [id, isEdit, dispatch, navigate]);

  useEffect(() => {
    loadProducts();
    fetchDeal();
  }, [loadProducts, fetchDeal]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleAddItem = (product) => {
    const alreadyAdded = formData.items.some(
      (i) =>
        i.productId === product._id ||
        i.productId?.toString() === product._id?.toString(),
    );
    if (alreadyAdded) return;
    const newItem = {
      productId: product._id,
      name: product.name,
      imageUrl: productsService.getImageUrl(product),
      category: product.category || "",
      quantity: 1,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: "" }));
    }
  };

  const handleRemoveItem = (productId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter(
        (i) =>
          i.productId !== productId &&
          i.productId?.toString() !== productId?.toString(),
      ),
    }));
  };

  const handleQuantityChange = (productId, delta) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((i) => {
        const matches =
          i.productId === productId ||
          i.productId?.toString() === productId?.toString();
        if (!matches) return i;
        const newQty = Math.max(1, (i.quantity || 1) + delta);
        return { ...i, quantity: newQty };
      }),
    }));
  };

  const isItemSelected = (productId) =>
    formData.items.some(
      (i) =>
        i.productId === productId ||
        i.productId?.toString() === productId?.toString(),
    );

  const filteredProducts = allProducts.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Deal title is required";
    if (!formData.price) {
      newErrors.price = "Deal price is required";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = "Price must be a non-negative number";
    }
    if (formData.items.length === 0) {
      newErrors.items = "At least one item must be added to the deal";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
    }
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
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      items: formData.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity || 1,
      })),
      isActive: formData.isActive,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };

    try {
      if (isEdit) {
        const result = await dealsService.updateDeal(id, payload);
        if (result.success) {
          dispatch(updateDeal(result.deal));
          dispatch(
            showNotification({
              type: "success",
              message: "Deal updated successfully",
            }),
          );
          navigate("/admin/deals");
        } else {
          dispatch(
            showNotification({ type: "error", message: result.message }),
          );
        }
      } else {
        const result = await dealsService.createDeal(payload);
        if (result.success) {
          dispatch(addDeal(result.deal));
          dispatch(
            showNotification({
              type: "success",
              message: "Deal created successfully",
            }),
          );
          navigate("/admin/deals");
        } else {
          dispatch(
            showNotification({ type: "error", message: result.message }),
          );
        }
      }
    } catch {
      dispatch(
        showNotification({ type: "error", message: "Something went wrong" }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-gray font-medium">Loading deal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cream-light/30 to-gray-50 py-4 sm:py-6 sm:px-6">
      <div className="max-w-6xl space-y-4 lg:space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg border-2 border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                {isEdit ? (
                  <Edit3 className="w-6 h-6 text-white" />
                ) : (
                  <Plus className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-primary">
                  {isEdit ? "Edit Deal" : "Create New Deal"}
                </h1>
                <p className="text-sm text-dark-gray">
                  {isEdit
                    ? "Update deal details and items"
                    : "Fill in the details to create a new deal"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/deals")}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Deals
            </button>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Live Preview
          </p>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-dark text-lg truncate">
                  {formData.title || "Deal Title"}
                </h3>
                {formData.description && (
                  <p className="text-dark-gray text-sm mt-1 line-clamp-2">
                    {formData.description}
                  </p>
                )}
                {formData.items.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-cream text-primary-dark px-2 py-0.5 rounded-full"
                      >
                        {(item.quantity || 1) > 1 && (
                          <span className="font-bold text-primary mr-0.5">
                            {item.quantity}×
                          </span>
                        )}
                        {item.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-lg">
                  Rs. {formData.price ? Number(formData.price).toFixed(0) : "0"}
                </div>
                {formData.items.length > 0 && (
                  <div className="flex justify-end mt-2">
                    {formData.items.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-white bg-cream overflow-hidden flex-shrink-0"
                        style={{ marginLeft: idx > 0 ? "-8px" : "0" }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={productsService.getImageUrl(item)}
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-dark">Deal Details</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Deal Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Family Feast Deal"
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark ${
                  errors.title
                    ? "border-red-400 focus:border-red-400"
                    : "border-gray-200 focus:border-primary"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what makes this deal special..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark resize-none"
              />
            </div>

            {/* Price + Date Range row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Deal Price (Rs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-gray font-medium text-sm">
                    Rs.
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="1"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark ${
                      errors.price
                        ? "border-red-400 focus:border-red-400"
                        : "border-gray-200 focus:border-primary"
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Start Date{" "}
                  <span className="text-dark-gray font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  End Date{" "}
                  <span className="text-dark-gray font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-dark ${
                    errors.endDate
                      ? "border-red-400 focus:border-red-400"
                      : "border-gray-200 focus:border-primary"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-dark text-sm">Deal Active</p>
                <p className="text-xs text-dark-gray mt-0.5">
                  Inactive deals won't be shown to customers
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  formData.isActive ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    formData.isActive ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Deal Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-dark">
                  Deal Items <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-dark-gray mt-0.5">
                  Select products to include in this deal
                </p>
              </div>
              {/* Product Picker Trigger */}
              <div className="relative" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setShowPicker((v) => !v)}
                  className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Items
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showPicker ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Picker */}
                {showPicker && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Product List */}
                    <div className="max-h-64 overflow-y-auto">
                      {loadingProducts ? (
                        <div className="py-8 text-center text-dark-gray text-sm">
                          Loading products...
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="py-8 text-center text-dark-gray text-sm">
                          No products found
                        </div>
                      ) : (
                        filteredProducts.map((product) => {
                          const selected = isItemSelected(product._id);
                          return (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => handleAddItem(product)}
                              disabled={selected}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                selected
                                  ? "bg-primary/5 cursor-default"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {/* Product image */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                                {product.imageUrl ||
                                product.image ||
                                product.imageId ? (
                                  <img
                                    src={productsService.getImageUrl(product)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg text-primary">
                                    🍽️
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-dark text-sm truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-dark-gray mt-0.5 flex items-center gap-1">
                                  <span className="bg-gray-100 px-1.5 py-0.5 rounded-full">
                                    {product.category}
                                  </span>
                                  <span>Rs. {product.basePrice}</span>
                                </p>
                              </div>
                              {selected && (
                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Close */}
                    <div className="p-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowPicker(false)}
                        className="w-full text-sm text-dark-gray hover:text-dark py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Items List */}
            {formData.items.length === 0 ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center ${
                  errors.items
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <Tag
                  className={`w-10 h-10 mx-auto mb-2 ${errors.items ? "text-red-400" : "text-gray-400"}`}
                />
                <p
                  className={`text-sm ${errors.items ? "text-red-500" : "text-dark-gray"}`}
                >
                  {errors.items ||
                    "No items added yet. Click 'Add Items' to select products."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {errors.items && (
                  <p className="text-red-500 text-xs mb-2">{errors.items}</p>
                )}
                {formData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group"
                  >
                    {/* Image */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={productsService.getImageUrl(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark text-sm truncate">
                        {item.name}
                      </p>
                      {item.category && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-dark-gray font-medium mr-0.5">
                        Qty:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.productId, -1)}
                        disabled={(item.quantity || 1) <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-dark-gray hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-dark text-sm">
                        {item.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.productId, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-dark-gray hover:text-primary hover:border-primary transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-1.5 text-dark-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pb-6">
            <button
              type="button"
              onClick={() => navigate("/admin/deals")}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-dark font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Save Changes" : "Create Deal"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDealForm;
