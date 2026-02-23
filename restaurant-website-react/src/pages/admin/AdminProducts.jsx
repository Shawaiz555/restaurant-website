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
import {
  Plus,
  Pizza,
  FileText,
  Tag,
  DollarSign,
  Ruler,
  Star,
  Edit,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
  FileImage,
  Package,
  Eye,
  Filter,
  FileSliders,
} from "lucide-react";

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

  const loadProducts = React.useCallback(() => {
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
  }, [dispatch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
            <h1 className="text-2xl lg:text-4xl font-display text-primary mb-2">
              Products Management
            </h1>
            <p className="text-dark-gray">Add, edit, and delete menu items</p>
          </div>
          <button
            onClick={() => navigate("/admin/products/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xs sm:text-sm text-dark-gray mb-2 font-semibold uppercase tracking-wide">
            Total Products
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {products.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center mb-3">
            <Tag className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xs sm:text-sm text-dark-gray mb-2 font-semibold uppercase tracking-wide">
            Categories
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {categories.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center mb-3">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xs sm:text-sm text-dark-gray mb-2 font-semibold uppercase tracking-wide">
            Showing
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {filteredProducts.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-xl flex items-center justify-center mb-3">
            <Filter className="w-6 h-6 text-primary" />
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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Pagination Controls - Top */}
        {filteredProducts.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-cream-light/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Pizza className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-md lg:text-xl font-bold text-dark">
                    Products Catalog
                  </p>
                  <p className="text-xs text-dark-gray">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredProducts.length)} of{" "}
                    {filteredProducts.length} products
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
                <label className="text-sm text-dark-gray font-semibold whitespace-nowrap">
                  Items per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Pizza className="w-24 h-24 mx-auto mb-6 text-primary animate-bounce" />
            <h3 className="text-2xl font-bold text-dark mb-3">
              No Products Found
            </h3>
            <p className="text-dark-gray text-lg mb-4">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your filters"
                : 'Click "Add New Product" to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Table View - All Devices */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-full table-auto">
                <thead className="bg-gradient-to-r from-primary/5 via-primary-light/5 to-primary/5 border-b-2 border-primary/20">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <FileImage className="w-4 h-4 text-primary" />
                        <span>Image</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap min-w-[250px]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span>Product Details</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center justify-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <span>Category</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span>Base Price</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide whitespace-nowrap min-w-[200px]">
                      <div className="flex items-center justify-center gap-2">
                        <Ruler className="w-4 h-4 text-primary" />
                        <span>Sizes</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span>Rating</span>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wide whitespace-nowrap min-w-[200px]">
                      <div className="flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4 text-primary" />
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-cream-light/60 transition-all duration-200 border-l-4 border-transparent hover:border-primary group`}
                    >
                      {/* Image */}
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex justify-center">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-cream-light to-gray-100 shadow-md ring-2 ring-gray-200 group-hover:ring-primary group-hover:shadow-lg transition-all duration-300">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80x80?text=No+Image";
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Product Details */}
                      <td className="px-4 lg:px-6 py-4">
                        <div className="max-w-sm">
                          <h3 className="text-sm font-bold text-dark mb-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-dark-gray line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary border border-primary/20 shadow-sm whitespace-nowrap">
                            {product.category}
                          </span>
                        </div>
                      </td>

                      {/* Base Price */}
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20">
                          <span className="text-sm font-bold text-primary">
                            {formatCurrency(product.basePrice)}
                          </span>
                        </div>
                      </td>

                      {/* Sizes */}
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div>
                          <p className="text-[10px] font-semibold text-dark-gray mb-1.5 uppercase tracking-wide">
                            {product.sizes?.length || 0} size
                            {product.sizes?.length !== 1 ? "s" : ""}
                          </p>
                          <div className="flex flex-wrap justify-center gap-1">
                            {product.sizes?.slice(0, 2).map((size, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-gradient-to-r from-cream to-cream-light px-2 py-1 rounded-md font-semibold text-dark border border-gray-200 shadow-sm"
                              >
                                {size.name}: {formatCurrency(size.price)}
                              </span>
                            ))}
                            {product.sizes?.length > 2 && (
                              <span className="text-[10px] text-white bg-primary px-2 py-1 rounded-md font-bold shadow-sm">
                                +{product.sizes.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 shadow-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-dark">
                            {product.rating || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/products/${product.id}/edit`)
                            }
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls - Bottom */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 lg:px-8 py-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-cream-light/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileSliders className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark">
                        Page {currentPage} of {totalPages}
                      </p>
                      <p className="text-xs text-dark-gray">
                        Navigate through pages
                      </p>
                    </div>
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                      }`}
                      title="First Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                      }`}
                    >
                      ← Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1.5">
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
                              className={`min-w-[40px] px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-primary to-primary-dark text-white scale-110 shadow-xl"
                                  : "bg-white text-primary border-2 border-gray-300 hover:border-primary hover:bg-primary/10 hover:scale-105 active:scale-95"
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
                            <span
                              key={page}
                              className="px-2 text-dark-gray font-bold"
                            >
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
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                      }`}
                    >
                      Next →
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                      }`}
                      title="Last Page"
                    >
                      <ChevronsRight className="w-4 h-4" />
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
