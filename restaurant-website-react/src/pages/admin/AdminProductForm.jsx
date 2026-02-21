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
    nutritionInfo: {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    },
    addOnsConfig: {
      showSpiceLevel: false,
      showDrinks: false,
      showDesserts: false,
      showExtras: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = () => {
    const product = productsService.getProductById(id);
    if (product) {
      setFormData({
        ...product,
        ingredients: product.ingredients || [""],
        sizes: product.sizes || [
          { name: "Regular", price: "", description: "" },
        ],
        nutritionInfo: product.nutritionInfo || {
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
        },
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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      nutritionInfo: {
        ...prev.nutritionInfo,
        [name]: value,
      },
    }));
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.image.trim()) newErrors.image = "Image URL is required";
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
            className="px-6 py-3 rounded-xl bg-gray-200 text-dark hover:bg-gray-300 transition-colors font-semibold"
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
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.category ? "border-red-500" : "border-gray-200"
                } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="e.g., Burgers"
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
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

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.image ? "border-red-500" : "border-gray-200"
                } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Base Price * ($)
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
            <div className="mt-4">
              <label className="block text-sm font-semibold text-dark mb-2">
                Image Preview
              </label>
              <img
                src={formData.image}
                alt="Preview"
                className="w-64 h-48 object-cover rounded-xl border-2 border-gray-200"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                }}
              />
            </div>
          )}
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">Sizes *</h2>
            <button
              type="button"
              onClick={addSize}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              + Add Size
            </button>
          </div>
          <div className="space-y-4">
            {formData.sizes.map((size, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-cream-light rounded-xl"
              >
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
                    Price ($)
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
                <div className="flex items-end gap-2">
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
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">Ingredients</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              + Add Ingredient
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
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
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
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
          <h2 className="text-xl font-bold text-dark mb-4">
            Nutrition Information (Optional)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Calories
              </label>
              <input
                type="text"
                name="calories"
                value={formData.nutritionInfo.calories}
                onChange={handleNutritionChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                placeholder="450 kcal"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Protein
              </label>
              <input
                type="text"
                name="protein"
                value={formData.nutritionInfo.protein}
                onChange={handleNutritionChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                placeholder="15g"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Carbs
              </label>
              <input
                type="text"
                name="carbs"
                value={formData.nutritionInfo.carbs}
                onChange={handleNutritionChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                placeholder="65g"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Fat
              </label>
              <input
                type="text"
                name="fat"
                value={formData.nutritionInfo.fat}
                onChange={handleNutritionChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                placeholder="12g"
              />
            </div>
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
                >
                  Delete Product
                </button>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-6 py-3 rounded-xl bg-gray-200 text-dark hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl font-semibold ${
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
