import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import productsService from "../../services/productsService";
import { showNotification } from "../../store/slices/notificationSlice";

const AdminProductForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
    basePrice: "",
    rating: 4,
    sizes: [{ name: "Regular", price: "", description: "" }],
    ingredients: [""],
    nutritionInfo: [
      { label: "Calories", value: "", unit: "kcal" },
      { label: "Protein", value: "", unit: "g" },
      { label: "Carbs", value: "", unit: "g" },
      { label: "Fat", value: "", unit: "g" },
    ],
    addOnsConfig: {
      showSpiceLevel: false,
      showDrinks: false,
      showDesserts: false,
      showExtras: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);

  const loadProduct = React.useCallback(() => {
    const product = productsService.getProductById(id);
    if (product) {
      // Convert old nutrition format to new array format
      let nutritionInfo = product.nutritionInfo;
      if (nutritionInfo && !Array.isArray(nutritionInfo)) {
        nutritionInfo = [
          {
            label: "Calories",
            value: nutritionInfo.calories || "",
            unit: "kcal",
          },
          { label: "Protein", value: nutritionInfo.protein || "", unit: "g" },
          { label: "Carbs", value: nutritionInfo.carbs || "", unit: "g" },
          { label: "Fat", value: nutritionInfo.fat || "", unit: "g" },
        ];
      } else if (!nutritionInfo) {
        nutritionInfo = [
          { label: "Calories", value: "", unit: "kcal" },
          { label: "Protein", value: "", unit: "g" },
          { label: "Carbs", value: "", unit: "g" },
          { label: "Fat", value: "", unit: "g" },
        ];
      }

      setFormData({
        ...product,
        ingredients: product.ingredients || [""],
        sizes: product.sizes || [
          { name: "Regular", price: "", description: "" },
        ],
        nutritionInfo,
        addOnsConfig: product.addOnsConfig || {
          showSpiceLevel: false,
          showDrinks: false,
          showDesserts: false,
          showExtras: false,
        },
      });
    } else {
      dispatch(
        showNotification({
          type: "error",
          message: "Product not found",
        }),
      );
      navigate("/admin/products");
    }
  }, [id, dispatch, navigate]);

  // Load existing categories on mount
  useEffect(() => {
    const allProducts = productsService.getProducts();
    const categories = [...new Set(allProducts.map((p) => p.category))].sort();
    setExistingCategories(categories);
  }, []);

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [isEditMode, loadProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNutritionChange = (index, field, value) => {
    const newNutrition = [...formData.nutritionInfo];
    newNutrition[index][field] = value;
    setFormData((prev) => ({ ...prev, nutritionInfo: newNutrition }));
  };

  const addNutrition = () => {
    setFormData((prev) => ({
      ...prev,
      nutritionInfo: [
        ...prev.nutritionInfo,
        { label: "", value: "", unit: "" },
      ],
    }));
  };

  const removeNutrition = (index) => {
    if (formData.nutritionInfo.length > 1) {
      const newNutrition = formData.nutritionInfo.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, nutritionInfo: newNutrition }));
    }
  };

  const handleAddOnsConfigChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      addOnsConfig: {
        ...prev.addOnsConfig,
        [name]: checked,
      },
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };

  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { name: "", price: "", description: "" }],
    }));
  };

  const removeSize = (index) => {
    if (formData.sizes.length > 1) {
      const newSizes = formData.sizes.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, sizes: newSizes }));
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "add_new") {
      setShowNewCategoryInput(true);
      setFormData((prev) => ({ ...prev, category: "" }));
    } else {
      setShowNewCategoryInput(false);
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  const handleNewCategorySubmit = () => {
    if (newCategoryName.trim()) {
      const trimmedCategory = newCategoryName.trim();

      // Add to categories list if not already present
      if (!existingCategories.includes(trimmedCategory)) {
        setExistingCategories((prev) => [...prev, trimmedCategory].sort());
      }

      setFormData((prev) => ({ ...prev, category: trimmedCategory }));
      setShowNewCategoryInput(false);
      setNewCategoryName("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.image.trim()) newErrors.image = "Product image is required";
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = "Base price must be a positive number";
    }

    // Validate sizes
    formData.sizes.forEach((size, index) => {
      if (!size.name.trim()) {
        newErrors[`size_${index}_name`] = `Size ${index + 1} name is required`;
      }
      if (!size.price || parseFloat(size.price) <= 0) {
        newErrors[`size_${index}_price`] =
          `Size ${index + 1} price must be positive`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      dispatch(
        showNotification({
          type: "error",
          message: "Please fix the errors in the form",
        }),
      );
      return;
    }

    setLoading(true);

    // Clean up ingredients (remove empty)
    const cleanedData = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      rating: parseFloat(formData.rating),
      ingredients: formData.ingredients.filter((ing) => ing.trim() !== ""),
      sizes: formData.sizes.map((size) => ({
        ...size,
        price: parseFloat(size.price),
      })),
    };

    try {
      let result;
      if (isEditMode) {
        result = productsService.updateProduct(id, cleanedData);
      } else {
        result = productsService.addProduct(cleanedData);
      }

      if (result.success) {
        dispatch(
          showNotification({
            type: "success",
            message: isEditMode
              ? "Product updated successfully"
              : "Product added successfully",
          }),
        );
        navigate("/admin/products");
      } else {
        dispatch(
          showNotification({
            type: "error",
            message: result.message,
          }),
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          type: "error",
          message: "An error occurred while saving the product",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const result = productsService.deleteProduct(id);
      if (result.success) {
        dispatch(
          showNotification({
            type: "success",
            message: "Product deleted successfully",
          }),
        );
        navigate("/admin/products");
      } else {
        dispatch(
          showNotification({
            type: "error",
            message: result.message,
          }),
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-primary mb-2">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-dark-gray">
              {isEditMode
                ? "Update product details"
                : "Fill in the details to create a new product"}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/products")}
            className="px-2 py-1 rounded-xl text-dark transition-colors font-semibold hover:text-primary border border-primary"
          >
            ← Back to Products
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-dark mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.name ? "border-red-500" : "border-gray-200"
                } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="e.g., Chicken Burger"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Category *
              </label>
              {showNewCategoryInput ? (
                <div className="space-y-2">
                  {/* Input Field */}
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
                    placeholder="Enter new category name"
                    autoFocus
                  />
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleNewCategorySubmit}
                      className="flex-1 sm:flex-none sm:px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all font-semibold text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">✓</span>
                      <span className="hidden sm:inline">Add Category</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategoryName("");
                      }}
                      className="flex-1 sm:flex-none sm:px-6 py-2 sm:py-3 rounded-xl bg-gray-200 text-dark hover:bg-gray-300 transition-all font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">✕</span>
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  </div>
                  <p className="text-xs text-dark-gray">
                    Enter a unique category name and click Add Category
                  </p>
                </div>
              ) : (
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleCategoryChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.category ? "border-red-500" : "border-gray-200"
                  } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-base`}
                >
                  <option value="">Select a category...</option>
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option
                    value="add_new"
                    className="font-semibold text-primary"
                  >
                    ➕ Add New Category
                  </option>
                </select>
              )}
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
              {!showNewCategoryInput && (
                <p className="text-xs text-dark-gray mt-2">
                  Select from existing categories or add a new one
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.description ? "border-red-500" : "border-gray-200"
                } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="Describe your product..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="max-w-lg md:col-span-2">
              <label className="block text-sm font-semibold text-dark mb-2">
                Product Image *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                    errors.image ? "border-red-500" : "border-gray-200"
                  } cursor-pointer hover:border-primary transition-all bg-white flex items-center justify-center gap-2 text-dark-gray hover:text-primary`}
                >
                  <span className="text-xl">📁</span>
                  <span className="text-sm font-medium">
                    {formData.image ? "Change Image" : "Choose Image File"}
                  </span>
                </label>
              </div>
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
              <p className="text-xs text-dark-gray mt-2">
                Supported formats: JPG, PNG, WEBP, GIF (Max 5MB)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Base Price * (Rs)
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.basePrice ? "border-red-500" : "border-gray-200"
                } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="9.99"
              />
              {errors.basePrice && (
                <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Rating (1-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                step="0.1"
                min="1"
                max="5"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Image Preview */}
          {formData.image && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-dark mb-3">
                Image Preview
              </label>
              <div className="relative w-full max-w-md">
                <img
                  src={formData.image}
                  alt="Product Preview"
                  className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 shadow-md"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Image+Preview";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, image: "" }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-dark">Sizes *</h2>
            <button
              type="button"
              onClick={addSize}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              + Add Size
            </button>
          </div>
          <div className="space-y-4">
            {formData.sizes.map((size, index) => (
              <div
                key={index}
                className="p-4 bg-cream-light rounded-xl space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Size Name
                    </label>
                    <input
                      type="text"
                      value={size.name}
                      onChange={(e) =>
                        handleSizeChange(index, "name", e.target.value)
                      }
                      className={`w-full px-4 py-2 rounded-lg border-2 ${
                        errors[`size_${index}_name`]
                          ? "border-red-500"
                          : "border-gray-200"
                      } focus:border-primary focus:outline-none`}
                      placeholder="e.g., Regular"
                    />
                    {errors[`size_${index}_name`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`size_${index}_name`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Price (Rs)
                    </label>
                    <input
                      type="number"
                      value={size.price}
                      onChange={(e) =>
                        handleSizeChange(index, "price", e.target.value)
                      }
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-2 rounded-lg border-2 ${
                        errors[`size_${index}_price`]
                          ? "border-red-500"
                          : "border-gray-200"
                      } focus:border-primary focus:outline-none`}
                      placeholder="9.99"
                    />
                    {errors[`size_${index}_price`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`size_${index}_price`]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={size.description}
                    onChange={(e) =>
                      handleSizeChange(index, "description", e.target.value)
                    }
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                    placeholder="Description (optional)"
                  />
                  {formData.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors whitespace-nowrap"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-dark">Ingredients</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              + Add Ingredient
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) =>
                    handleIngredientChange(index, e.target.value)
                  }
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="e.g., Chicken"
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors whitespace-nowrap"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-dark">
                Nutrition Information (Optional)
              </h2>
              <p className="text-sm text-dark-gray mt-1">
                Add nutritional facts for this product
              </p>
            </div>
            <button
              type="button"
              onClick={addNutrition}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors whitespace-nowrap"
            >
              + Add Nutrition
            </button>
          </div>
          <div className="space-y-4">
            {formData.nutritionInfo.map((nutrition, index) => (
              <div
                key={index}
                className="p-4 bg-cream-light rounded-xl space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      value={nutrition.label}
                      onChange={(e) =>
                        handleNutritionChange(index, "label", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                      placeholder="e.g., Calories, Fiber, Sodium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Value
                    </label>
                    <input
                      type="text"
                      value={nutrition.value}
                      onChange={(e) =>
                        handleNutritionChange(index, "value", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                      placeholder="e.g., 450, 15, 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={nutrition.unit}
                      onChange={(e) =>
                        handleNutritionChange(index, "unit", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                      placeholder="e.g., kcal, g, mg"
                    />
                  </div>
                </div>
                {formData.nutritionInfo.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeNutrition(index)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons Configuration */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-dark mb-4">
            Add-ons Configuration
          </h2>
          <p className="text-sm text-dark-gray mb-4">
            Select which add-ons should be available for this product
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-3 p-4 bg-cream-light rounded-xl cursor-pointer hover:bg-cream transition-colors">
              <input
                type="checkbox"
                name="showSpiceLevel"
                checked={formData.addOnsConfig.showSpiceLevel}
                onChange={handleAddOnsConfigChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-semibold text-dark">
                Show Spice Level
              </span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-cream-light rounded-xl cursor-pointer hover:bg-cream transition-colors">
              <input
                type="checkbox"
                name="showDrinks"
                checked={formData.addOnsConfig.showDrinks}
                onChange={handleAddOnsConfigChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-semibold text-dark">
                Show Drinks
              </span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-cream-light rounded-xl cursor-pointer hover:bg-cream transition-colors">
              <input
                type="checkbox"
                name="showDesserts"
                checked={formData.addOnsConfig.showDesserts}
                onChange={handleAddOnsConfigChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-semibold text-dark">
                Show Desserts
              </span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-cream-light rounded-xl cursor-pointer hover:bg-cream transition-colors">
              <input
                type="checkbox"
                name="showExtras"
                checked={formData.addOnsConfig.showExtras}
                onChange={handleAddOnsConfigChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-semibold text-dark">
                Show Extras
              </span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col gap-4">
            {isEditMode && (
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
                >
                  Delete Product
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-200 text-dark hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl font-semibold ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Product"
                    : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
