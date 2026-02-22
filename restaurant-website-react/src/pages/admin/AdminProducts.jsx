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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

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
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center text-2xl mb-3">
            📦
          </div>
          <p className="text-xs sm:text-sm text-dark-gray mb-2 font-semibold uppercase tracking-wide">
            Total Products
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {products.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center text-2xl mb-3">
            🏷️
          </div>
          <p className="text-xs sm:text-sm text-dark-gray mb-2 font-semibold uppercase tracking-wide">
            Categories
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {categories.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center text-2xl mb-3">
            👁️
          </div>
          <p className="text-xs sm:text-sm text-dark-gray mb-2 font-semibold uppercase tracking-wide">
            Showing
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {filteredProducts.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center text-2xl mb-3">
            🎯
          </div>
          <p className="text-xs sm:text-sm text-dark-gray mb-2 font-semibold uppercase tracking-wide">
            Selected Category
          </p>
          <p className="text-lg sm:text-xl font-bold text-primary truncate">
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

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Pagination Controls - Top */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-dark-gray font-medium">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredProducts.length)} of{" "}
                {filteredProducts.length} products
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-dark-gray font-medium">
                Items per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
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
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-cream text-dark-gray">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                      Image
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap min-w-[280px]">
                      Product Details
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                      Category
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                      Base Price
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                      Sizes
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                      Rating
                    </th>
                    <th className="px-8 py-5 text-center text-sm font-bold uppercase tracking-wider whitespace-nowrap min-w-[220px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-cream-light/30"
                      } hover:bg-cream-light transition-colors`}
                    >
                      {/* Image */}
                      <td className="px-8 py-5">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-cream-light shadow-md">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80x80?text=No+Image";
                            }}
                          />
                        </div>
                      </td>

                      {/* Product Details */}
                      <td className="px-8 py-5">
                        <div>
                          <h3 className="text-base font-bold text-dark mb-1.5">
                            {product.name}
                          </h3>
                          <p className="text-sm text-dark-gray line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                          {product.category}
                        </span>
                      </td>

                      {/* Base Price */}
                      <td className="px-8 py-5">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.basePrice)}
                        </span>
                      </td>

                      {/* Sizes */}
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-xs text-dark-gray mb-2">
                            {product.sizes?.length || 0} size(s)
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes?.slice(0, 2).map((size, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-cream px-2 py-1 rounded font-medium"
                              >
                                {size.name}: {formatCurrency(size.price)}
                              </span>
                            ))}
                            {product.sizes?.length > 2 && (
                              <span className="text-xs text-dark-gray font-medium">
                                +{product.sizes.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-lg">⭐</span>
                          <span className="text-base font-bold text-dark">
                            {product.rating || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/products/${product.id}/edit`)
                            }
                            className="px-8 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all hover:shadow-lg hover:scale-105"
                            title="Edit Product"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="px-8 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all hover:shadow-lg hover:scale-105"
                            title="Delete Product"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 hover:bg-cream-light/30 transition-colors"
                >
                  {/* Mobile Card Layout */}
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-cream-light shadow-md">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/112x112?text=No+Image";
                          }}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Category */}
                      <div className="mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-dark mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-bold text-dark">
                              {product.rating || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-dark-gray line-clamp-2 mb-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="mb-2">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.basePrice)}
                        </span>
                        <span className="text-xs text-dark-gray ml-2">
                          (Base Price)
                        </span>
                      </div>

                      {/* Sizes */}
                      <div className="mb-3">
                        <p className="text-xs text-dark-gray mb-1">
                          Available Sizes: {product.sizes?.length || 0}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {product.sizes?.slice(0, 2).map((size, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-cream px-2 py-1 rounded font-medium"
                            >
                              {size.name}: {formatCurrency(size.price)}
                            </span>
                          ))}
                          {product.sizes?.length > 2 && (
                            <span className="text-xs text-dark-gray font-medium">
                              +{product.sizes.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/products/${product.id}/edit`)
                          }
                          className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls - Bottom */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-dark-gray font-medium">
                    Page {currentPage} of {totalPages}
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white"
                      }`}
                      title="First Page"
                    >
                      ⏮️
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white"
                      }`}
                    >
                      ← Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Show only 5 pages at a time
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                currentPage === page
                                  ? "bg-primary text-white shadow-lg"
                                  : "bg-white text-primary border-2 border-gray-300 hover:border-primary hover:bg-primary/10"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-dark-gray">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white"
                      }`}
                    >
                      Next →
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white"
                      }`}
                      title="Last Page"
                    >
                      ⏭️
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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
