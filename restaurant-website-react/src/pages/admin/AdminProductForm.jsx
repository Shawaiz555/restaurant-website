import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import productsService from "../../services/productsService";
import { showNotification } from "../../store/slices/notificationSlice";
import {
  Edit3,
  Plus,
  ArrowLeft,
  Info,
  FileText,
  Tag,
  FileBadge,
  Image as ImageIcon,
  DollarSign,
  Star,
  Camera,
  X,
  Ruler,
  Salad,
  Apple,
  Settings,
  Flame,
  Wine,
  Cake,
  PlusCircle,
  Trash2,
  Check,
  FolderOpen,
  AlertCircle,
} from "lucide-react";

// Default add-ons data (stored in database for all products)
const defaultAddOnsData = {
  drinks: [
    { name: "Coca Cola (350ml)", price: 80, description: "" },
    { name: "Pepsi (350ml)", price: 80, description: "" },
    { name: "Sprite (350ml)", price: 80, description: "" },
    { name: "Sting (350ml)", price: 100, description: "" },
    { name: "Mirinda (350ml)", price: 80, description: "" },
    { name: "Fresh Orange Juice (1 Glass)", price: 150, description: "" },
    { name: "Mineral Water (350ml)", price: 50, description: "" },
  ],
  desserts: [
    { name: "Chocolate Brownie", price: 250, description: "" },
    { name: "Ice Cream Scoop", price: 150, description: "" },
    { name: "Cheesecake Slice", price: 350, description: "" },
    { name: "Tiramisu", price: 400, description: "" },
  ],
  extras: [
    { name: "Extra Cheese", price: 100, description: "" },
    { name: "Extra Sauce", price: 80, description: "" },
    { name: "Garlic Bread", price: 180, description: "" },
    { name: "Side Salad", price: 200, description: "" },
  ],
  spiceLevels: [
    { name: "No Spice", description: "No heat" },
    { name: "Mild", description: "Slightly spicy" },
    { name: "Medium", description: "Moderately spicy" },
    { name: "Hot", description: "Very spicy" },
    { name: "Extra Hot", description: "Extremely spicy" },
  ],
};

// Helper function to get default add-ons
const getDefaultAddOns = (type) => {
  return defaultAddOnsData[type];
};

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
    drinks: getDefaultAddOns("drinks"),
    desserts: getDefaultAddOns("desserts"),
    extras: getDefaultAddOns("extras"),
    spiceLevels: getDefaultAddOns("spiceLevels"),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);

  const loadProduct = React.useCallback(async () => {
    setLoading(true);
    try {
      const product = await productsService.fetchProductById(id);
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
          image: product.image || product.imageUrl || product.imageId || "",
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
          // Use existing add-ons if they exist, otherwise pre-populate with defaults
          drinks:
            product.drinks && product.drinks.length > 0
              ? product.drinks
              : getDefaultAddOns("drinks"),
          desserts:
            product.desserts && product.desserts.length > 0
              ? product.desserts
              : getDefaultAddOns("desserts"),
          extras:
            product.extras && product.extras.length > 0
              ? product.extras
              : getDefaultAddOns("extras"),
          spiceLevels:
            product.spiceLevels && product.spiceLevels.length > 0
              ? product.spiceLevels
              : getDefaultAddOns("spiceLevels"),
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
    } catch (error) {
      console.error("Error loading product:", error);
      dispatch(
        showNotification({
          type: "error",
          message: "An error occurred while loading the product",
        }),
      );
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  }, [id, dispatch, navigate]);

  // Load existing categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allProducts = await productsService.fetchProducts();
        const categories = [
          ...new Set(allProducts.map((p) => p.category)),
        ].sort();
        setExistingCategories(categories);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
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

  // Dynamic Add-ons handlers
  const handleAddOnChange = (type, index, field, value) => {
    const newAddOns = [...formData[type]];
    newAddOns[index][field] = value;
    setFormData((prev) => ({ ...prev, [type]: newAddOns }));
  };

  const addAddOn = (type) => {
    const newItem =
      type === "spiceLevels"
        ? { name: "", description: "" }
        : { name: "", description: "" };

    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], newItem],
    }));
  };

  const removeAddOn = (type, index) => {
    const newAddOns = formData[type].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [type]: newAddOns }));
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
        result = await productsService.updateProduct(id, cleanedData);
      } else {
        result = await productsService.addProduct(cleanedData);
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
          message:
            error.message || "An error occurred while saving the product",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cream-light/30 to-gray-50 py-4 sm:py-6 sm:px-6">
      <div className="max-w-6xl space-y-4 lg:space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg border-2 border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                {isEditMode ? (
                  <Edit3 className="w-6 h-6 text-white" />
                ) : (
                  <Plus className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-primary">
                  {isEditMode ? "Edit Product" : "Add New Product"}
                </h1>
                <p className="text-sm text-dark-gray">
                  {isEditMode
                    ? "Update product details and specifications"
                    : "Fill in the details to create a new product"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/products")}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
            <div className="flex items-center gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                  Basic Information
                </h2>
                <p className="text-xs text-dark-gray">
                  Essential product details
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg text-sm border-2 ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 bg-white`}
                  placeholder="e.g., Chicken Burger"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-5 h-5" /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Category *
                </label>
                {showNewCategoryInput ? (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-primary focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm bg-white"
                      placeholder="Enter new category name"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleNewCategorySubmit}
                        className="flex-1 sm:flex-none sm:px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Add Category</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategoryName("");
                        }}
                        className="flex-1 sm:flex-none sm:px-6 py-2.5 rounded-lg bg-gray-200 text-dark hover:bg-gray-300 transition-all font-semibold text-sm hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                    <p className="text-xs text-dark-gray italic">
                      💡 Enter a unique category name and click Add Category
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      name="category"
                      value={formData.category || ""}
                      onChange={handleCategoryChange}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        errors.category ? "border-red-500" : "border-gray-200"
                      } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 bg-white text-sm`}
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
                        + Add New Category
                      </option>
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.category}
                      </p>
                    )}
                    <p className="text-xs text-dark-gray mt-1.5 italic">
                      💡 Select from existing or create new
                    </p>
                  </>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FileBadge className="w-4 h-4 text-primary" />
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 rounded-lg text-sm border-2 ${
                    errors.description ? "border-red-500" : "border-gray-200"
                  } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 resize-none bg-white`}
                  placeholder="Describe your product in detail..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.description}
                  </p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Product Image *
                </label>
                <div className="max-w-md flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex-1 px-4 py-4 rounded-lg border-2 border-dashed ${
                      errors.image ? "border-red-500" : "border-gray-300"
                    } cursor-pointer hover:border-primary transition-all bg-gradient-to-br from-gray-50 to-white hover:from-primary/5 hover:to-primary-light/5 flex items-center justify-center gap-3 text-dark-gray hover:text-primary group`}
                  >
                    <FolderOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">
                        {formData.image
                          ? "Change Image"
                          : "Click to upload image"}
                      </p>
                      <p className="text-xs text-dark-gray">
                        JPG, PNG, WEBP, GIF (Max 5MB)
                      </p>
                    </div>
                  </label>
                </div>
                {errors.image && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.image}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Base Price * (Rs)
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg text-sm border-2 ${
                    errors.basePrice ? "border-red-500" : "border-gray-200"
                  } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 bg-white`}
                  placeholder="9.99"
                />
                {errors.basePrice && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.basePrice}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary fill-primary" />
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
                  className="w-full px-4 py-3 rounded-lg text-sm border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 bg-white"
                />
              </div>
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <label className="text-sm font-bold text-dark mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary" />
                  Image Preview
                </label>
                <div className="relative w-full max-w-md mx-auto lg:mx-0">
                  <div className="aspect-video rounded-xl overflow-hidden border-4 border-primary/20 shadow-2xl group">
                    <img
                      src={productsService.getImageUrl(formData.image)}
                      alt="Product Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x300?text=Image+Preview";
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: "" }));
                    }}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95"
                    title="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-xl flex items-center justify-center">
                  <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                    Sizes *
                  </h2>
                  <p className="text-xs text-dark-gray">
                    Define product size options
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addSize}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Size
              </button>
            </div>
            <div className="space-y-4">
              {formData.sizes.map((size, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="font-bold text-dark text-sm">
                      Size Option {index + 1}
                    </p>
                  </div>
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
                        className={`w-full px-4 py-2.5 rounded-lg text-sm border-2 ${
                          errors[`size_${index}_name`]
                            ? "border-red-500"
                            : "border-gray-200"
                        } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 bg-white transition-all`}
                        placeholder="e.g., Regular, Large"
                      />
                      {errors[`size_${index}_name`] && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{" "}
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
                        className={`w-full px-4 py-2.5 rounded-lg text-sm border-2 ${
                          errors[`size_${index}_price`]
                            ? "border-red-500"
                            : "border-gray-200"
                        } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 bg-white transition-all`}
                        placeholder="9.99"
                      />
                      {errors[`size_${index}_price`] && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{" "}
                          {errors[`size_${index}_price`]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={size.description}
                      onChange={(e) =>
                        handleSizeChange(index, "description", e.target.value)
                      }
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 bg-white transition-all"
                      placeholder="Description (optional)"
                    />
                    {formData.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-xl flex items-center justify-center">
                  <Salad className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                    Ingredients
                  </h2>
                  <p className="text-xs text-dark-gray">
                    List product ingredients
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addIngredient}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Ingredient
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {formData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 hover:border-primary/50 transition-all"
                >
                  <span className="w-7 h-7 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) =>
                      handleIngredientChange(index, e.target.value)
                    }
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 bg-white transition-all"
                    placeholder="e.g., Chicken, Lettuce"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sm:hidden">Remove</span>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Info */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-xl flex items-center justify-center">
                  <Apple className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                    Nutrition Information
                  </h2>
                  <p className="text-xs text-dark-gray">
                    Add nutritional facts (Optional)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addNutrition}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:from-primary-dark hover:to-primary transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Nutrition
              </button>
            </div>
            <div className="space-y-4">
              {formData.nutritionInfo.map((nutrition, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="font-bold text-dark text-sm">
                      Nutrition Item {index + 1}
                    </p>
                  </div>
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
                        className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 bg-white transition-all"
                        placeholder="e.g., Calories"
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
                        className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 bg-white transition-all"
                        placeholder="e.g., 450"
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
                        className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 bg-white transition-all"
                        placeholder="e.g., kcal"
                      />
                    </div>
                  </div>
                  {formData.nutritionInfo.length > 1 && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => removeNutrition(index)}
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons Configuration */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
            <div className="flex items-center gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                  Add-ons Configuration
                </h2>
                <p className="text-xs text-dark-gray">
                  Select available add-ons for this product
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <label className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl cursor-pointer hover:from-primary/5 hover:to-primary-light/10 transition-all border-2 border-gray-200 hover:border-primary/50 hover:shadow-md">
                <input
                  type="checkbox"
                  name="showSpiceLevel"
                  checked={formData.addOnsConfig.showSpiceLevel}
                  onChange={handleAddOnsConfigChange}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-dark flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-600" />
                    Spice Level
                  </p>
                  <p className="text-xs text-dark-gray">
                    Allow spice customization
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl cursor-pointer hover:from-primary/5 hover:to-primary-light/10 transition-all border-2 border-gray-200 hover:border-primary/50 hover:shadow-md">
                <input
                  type="checkbox"
                  name="showDrinks"
                  checked={formData.addOnsConfig.showDrinks}
                  onChange={handleAddOnsConfigChange}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-dark flex items-center gap-2">
                    <Wine className="w-4 h-4 text-blue-500" />
                    Drinks
                  </p>
                  <p className="text-xs text-dark-gray">Add drink options</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl cursor-pointer hover:from-primary/5 hover:to-primary-light/10 transition-all border-2 border-gray-200 hover:border-primary/50 hover:shadow-md">
                <input
                  type="checkbox"
                  name="showDesserts"
                  checked={formData.addOnsConfig.showDesserts}
                  onChange={handleAddOnsConfigChange}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-dark flex items-center gap-2">
                    <Cake className="w-4 h-4 text-pink-500" />
                    Desserts
                  </p>
                  <p className="text-xs text-dark-gray">Add dessert options</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl cursor-pointer hover:from-primary/5 hover:to-primary-light/10 transition-all border-2 border-gray-200 hover:border-primary/50 hover:shadow-md">
                <input
                  type="checkbox"
                  name="showExtras"
                  checked={formData.addOnsConfig.showExtras}
                  onChange={handleAddOnsConfigChange}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-dark flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-green-500" />
                    Extras
                  </p>
                  <p className="text-xs text-dark-gray">Add extra options</p>
                </div>
              </label>
            </div>
          </div>

          {/* Dynamic Spice Levels */}
          {formData.addOnsConfig.showSpiceLevel && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                      Spice Level Options
                    </h2>
                    <p className="text-xs text-dark-gray">
                      Configure available spice levels for this product
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addAddOn("spiceLevels")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Spice Level
                </button>
              </div>
              {formData.spiceLevels.length === 0 ? (
                <div className="text-center py-8 text-dark-gray">
                  <Flame className="w-12 h-12 mx-auto mb-3 text-red-500" />
                  <p className="text-sm">
                    No spice levels added yet. Click "Add Spice Level" to get
                    started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.spiceLevels.map((spiceLevel, index) => (
                    <div
                      key={index}
                      className="p-4 sm:p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <p className="font-bold text-dark text-sm">
                          Spice Level {index + 1}
                        </p>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-dark mb-2">
                          Level Name
                        </label>
                        <input
                          type="text"
                          value={spiceLevel.name}
                          onChange={(e) =>
                            handleAddOnChange(
                              "spiceLevels",
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 hover:border-orange-400 bg-white transition-all"
                          placeholder="e.g., Mild, Hot"
                        />
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={spiceLevel.description}
                          onChange={(e) =>
                            handleAddOnChange(
                              "spiceLevels",
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 hover:border-orange-400 bg-white transition-all"
                          placeholder="Description (e.g., Slightly spicy)"
                        />
                        <button
                          type="button"
                          onClick={() => removeAddOn("spiceLevels", index)}
                          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Drinks Add-ons */}
          {formData.addOnsConfig.showDrinks && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Wine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                      Drink Options
                    </h2>
                    <p className="text-xs text-dark-gray">
                      Add available drinks for this product
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addAddOn("drinks")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Drink
                </button>
              </div>
              {formData.drinks.length === 0 ? (
                <div className="text-center py-8 text-dark-gray">
                  <Wine className="w-12 h-12 mx-auto mb-3 text-blue-300" />
                  <p className="text-sm">
                    No drinks added yet. Click "Add Drink" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.drinks.map((drink, index) => (
                    <div
                      key={index}
                      className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <p className="font-bold text-dark text-sm">
                          Drink Option {index + 1}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-2">
                            Drink Name
                          </label>
                          <input
                            type="text"
                            value={drink.name}
                            onChange={(e) =>
                              handleAddOnChange(
                                "drinks",
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400 bg-white transition-all"
                            placeholder="e.g., Coke, Sprite"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-2">
                            Price (Rs)
                          </label>
                          <input
                            type="number"
                            value={drink.price}
                            onChange={(e) =>
                              handleAddOnChange(
                                "drinks",
                                index,
                                "price",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400 bg-white transition-all"
                            placeholder="2.99"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={drink.description}
                          onChange={(e) =>
                            handleAddOnChange(
                              "drinks",
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400 bg-white transition-all"
                          placeholder="Description (optional)"
                        />
                        <button
                          type="button"
                          onClick={() => removeAddOn("drinks", index)}
                          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Desserts Add-ons */}
          {formData.addOnsConfig.showDesserts && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                    <Cake className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                      Dessert Options
                    </h2>
                    <p className="text-xs text-dark-gray">
                      Add available desserts for this product
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addAddOn("desserts")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Dessert
                </button>
              </div>
              {formData.desserts.length === 0 ? (
                <div className="text-center py-8 text-dark-gray">
                  <Cake className="w-12 h-12 mx-auto mb-3 text-pink-300" />
                  <p className="text-sm">
                    No desserts added yet. Click "Add Dessert" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.desserts.map((dessert, index) => (
                    <div
                      key={index}
                      className="p-4 sm:p-5 bg-gradient-to-br from-pink-50 to-white rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <p className="font-bold text-dark text-sm">
                          Dessert Option {index + 1}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-2">
                            Dessert Name
                          </label>
                          <input
                            type="text"
                            value={dessert.name}
                            onChange={(e) =>
                              handleAddOnChange(
                                "desserts",
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 hover:border-pink-400 bg-white transition-all"
                            placeholder="e.g., Ice Cream, Cake"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-2">
                            Price (Rs)
                          </label>
                          <input
                            type="number"
                            value={dessert.price}
                            onChange={(e) =>
                              handleAddOnChange(
                                "desserts",
                                index,
                                "price",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 hover:border-pink-400 bg-white transition-all"
                            placeholder="3.99"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={dessert.description}
                          onChange={(e) =>
                            handleAddOnChange(
                              "desserts",
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 hover:border-pink-400 bg-white transition-all"
                          placeholder="Description (optional)"
                        />
                        <button
                          type="button"
                          onClick={() => removeAddOn("desserts", index)}
                          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Extras Add-ons */}
          {formData.addOnsConfig.showExtras && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark">
                      Extra Options
                    </h2>
                    <p className="text-xs text-dark-gray">
                      Add available extras for this product
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addAddOn("extras")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Extra
                </button>
              </div>
              {formData.extras.length === 0 ? (
                <div className="text-center py-8 text-dark-gray">
                  <PlusCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <p className="text-sm">
                    No extras added yet. Click "Add Extra" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.extras.map((extra, index) => (
                    <div
                      key={index}
                      className="p-4 sm:p-5 bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <p className="font-bold text-dark text-sm">
                          Extra Option {index + 1}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-2">
                            Extra Name
                          </label>
                          <input
                            type="text"
                            value={extra.name}
                            onChange={(e) =>
                              handleAddOnChange(
                                "extras",
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-green-400 bg-white transition-all"
                            placeholder="e.g., Extra Cheese, Bacon"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-2">
                            Price (Rs)
                          </label>
                          <input
                            type="number"
                            value={extra.price}
                            onChange={(e) =>
                              handleAddOnChange(
                                "extras",
                                index,
                                "price",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-green-400 bg-white transition-all"
                            placeholder="1.99"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={extra.description}
                          onChange={(e) =>
                            handleAddOnChange(
                              "extras",
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-4 py-2.5 rounded-lg text-sm border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-green-400 bg-white transition-all"
                          placeholder="Description (optional)"
                        />
                        <button
                          type="button"
                          onClick={() => removeAddOn("extras", index)}
                          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border-2 border-gray-100">
            <div className="flex flex-col gap-4 sm:gap-5">
              {isEditMode && (
                <div className="w-full pb-4 sm:pb-5 border-b-2 border-gray-200">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 text-dark hover:from-gray-300 hover:to-gray-400 transition-all font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl font-bold text-sm flex items-center justify-center gap-2 ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 active:scale-95"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {isEditMode ? "Update Product" : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
