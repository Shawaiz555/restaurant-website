import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../../components/admin/common/SearchBar";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import { setProducts, deleteProduct } from "../../store/slices/productsSlice";
import {
  selectAllProducts,
  selectCategories,
} from "../../store/slices/productsSlice";
import productsService from "../../services/productsService";
import { showNotification } from "../../store/slices/notificationSlice";

const AdminProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const categories = useSelector(selectCategories);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    // Migrate products from static to localStorage if not already done
    const migrated = productsService.migrateProductsToLocalStorage();
    if (migrated) {
      dispatch(
        showNotification({
          type: "info",
          message: "Products migrated to localStorage for editing",
        }),
      );
    }

    const allProducts = productsService.getProducts();
    dispatch(setProducts(allProducts));
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const result = productsService.deleteProduct(productToDelete.id);
    if (result.success) {
      dispatch(deleteProduct(productToDelete.id));
      dispatch(
        showNotification({
          type: "success",
          message: "Product deleted successfully",
        }),
      );
      loadProducts(); // Reload to update categories
    } else {
      dispatch(
        showNotification({
          type: "error",
          message: result.message,
        }),
      );
    }
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };


  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount) => {
    return `Rs ${parseFloat(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-primary mb-2">
              Products Management
            </h1>
            <p className="text-dark-gray">Add, edit, and delete menu items</p>
          </div>
          <button
            onClick={() => navigate("/admin/products/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
          >
            <span className="text-xl">➕</span>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-dark-gray mb-1">Total Products</p>
          <p className="text-2xl font-bold text-primary">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-dark-gray mb-1">Categories</p>
          <p className="text-2xl font-bold text-primary">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-dark-gray mb-1">Showing</p>
          <p className="text-2xl font-bold text-primary">
            {filteredProducts.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-xs text-dark-gray mb-1">Selected Category</p>
          <p className="text-lg font-bold text-primary truncate">
            {selectedCategory}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <SearchBar
            placeholder="Search products by name or description..."
            onSearch={setSearchTerm}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm sm:text-base"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-6xl mb-4">🍕</div>
            <h3 className="text-xl font-bold text-dark mb-2">
              No Products Found
            </h3>
            <p className="text-dark-gray mb-4">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your filters"
                : 'Click "Add New Product" to get started'}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="relative h-72 overflow-hidden bg-cream-light">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
                <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {formatCurrency(product.basePrice)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-dark truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-primary font-semibold">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-semibold text-dark">
                      {product.rating || 0}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-dark-gray line-clamp-2 mb-3">
                  {product.description}
                </p>

                {/* Sizes */}
                <div className="mb-3">
                  <p className="text-xs text-dark-gray mb-1">
                    Sizes: {product.sizes?.length || 0}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.sizes?.slice(0, 3).map((size, index) => (
                      <span
                        key={index}
                        className="text-xs bg-cream px-2 py-1 rounded"
                      >
                        {size.name} - {formatCurrency(size.price)}
                      </span>
                    ))}
                    {product.sizes?.length > 3 && (
                      <span className="text-xs text-dark-gray">
                        +{product.sizes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/products/${product.id}/edit`)
                    }
                    className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone and will remove the product from your menu.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminProducts;
