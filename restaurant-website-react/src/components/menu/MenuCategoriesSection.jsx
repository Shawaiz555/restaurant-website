import React from "react";
import ProductCard from "../common/ProductCard";
import { getAllProducts, getCategories } from "../../store/productsData";

const MenuCategoriesSection = ({
  categories,
  categoryIcons,
  activeCategory,
  handleCategoryChange,
  showMobileCategories,
  setShowMobileCategories,
  filteredProducts,
  searchTerm,
  setSearchTerm,
  activeCategoryName,
}) => {
  const allCategories = getCategories();

  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Categories */}
          <aside className="lg:w-80 flex-shrink-0">
            {/* Enhanced Mobile Category Toggle with Animation */}
            <div className="lg:hidden mb-6">
              {/* Attention-grabbing header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center animate-bounce">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <h3 className="font-display text-lg text-dark">
                    Browse Categories
                  </h3>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                  {categories.length} Available
                </span>
              </div>

              {/* Main Toggle Button */}
              <button
                onClick={() =>
                  setShowMobileCategories(!showMobileCategories)
                }
                className="w-full bg-gradient-to-r from-primary to-primary-dark rounded-2xl px-5 py-4 flex items-center justify-between shadow-2xl hover:shadow-3xl transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></div>

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/30 shadow-lg">
                    {categoryIcons[activeCategory] || "🍽️"}
                  </div>
                  <div className="text-left">
                    <div className="text-white/80 text-xs font-medium mb-1">
                      Current Selection
                    </div>
                    <span className="font-bold text-white text-lg">
                      {activeCategoryName}
                    </span>
                    <div className="text-white/70 text-xs mt-0.5">
                      Tap to change category
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 relative z-10">
                  <span className="bg-white text-primary px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
                    {categories.find((cat) => cat.id === activeCategory)
                      ?.count || 0}{" "}
                    items
                  </span>
                  <div
                    className={`w-8 h-8 bg-white/20 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      showMobileCategories ? "rotate-180" : ""
                    }`}
                  >
                    <span className="text-white text-xl">▼</span>
                  </div>
                </div>
              </button>

              {/* Quick Category Pills - Always visible on mobile */}
              {!showMobileCategories && (
                <div className="mt-4">
                  <p className="text-xs text-dark-gray mb-2 px-1">
                    Quick Access:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 5).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          handleCategoryChange(category.id);
                        }}
                        className={`${
                          activeCategory === category.id
                            ? "bg-primary text-white shadow-lg scale-105"
                            : "bg-white text-dark hover:bg-cream border border-gray-200"
                        } px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105`}
                      >
                        <span className="text-lg">
                          {categoryIcons[category.id] || "🍽️"}
                        </span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Categories Sidebar */}
            <div
              className={`${showMobileCategories ? "block" : "hidden"} lg:block bg-white rounded-3xl shadow-2xl overflow-hidden lg:sticky lg:top-24 border-2 border-primary/10`}
            >
              <div className="p-6 bg-gradient-to-br from-primary/5 via-cream-light to-primary/5 border-b-2 border-primary/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl shadow-lg">
                    📋
                  </div>
                  <h2 className="font-display text-2xl text-dark">
                    Categories
                  </h2>
                </div>
                <p className="text-dark-gray text-sm ml-13">
                  Browse {categories.length} delicious categories
                </p>
              </div>

              <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`${
                      activeCategory === category.id
                        ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg scale-[1.02] border-2 border-primary"
                        : "bg-gradient-to-br from-cream-light to-white text-dark hover:bg-gradient-to-br hover:from-cream hover:to-cream-light hover:scale-[1.01] border-2 border-transparent"
                    } w-full px-5 py-4 rounded-2xl mb-3 transition-all duration-300 flex items-center justify-between group relative overflow-hidden`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Shine effect on active */}
                    {activeCategory === category.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></div>
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      <div
                        className={`w-12 h-12 ${
                          activeCategory === category.id
                            ? "bg-white/20"
                            : "bg-primary/10"
                        } rounded-xl flex items-center justify-center text-2xl transition-all group-hover:scale-110`}
                      >
                        {categoryIcons[category.id] || "🍽️"}
                      </div>
                      <span className="font-semibold text-base text-left">
                        {category.label}
                      </span>
                    </div>
                    <div
                      className={`${
                        activeCategory === category.id
                          ? "bg-white text-primary shadow-md"
                          : "bg-primary/15 text-primary group-hover:bg-primary group-hover:text-white"
                      } px-4 py-2 rounded-xl text-sm font-bold transition-all min-w-[3rem] text-center`}
                    >
                      {category.count}
                    </div>
                  </button>
                ))}
              </div>

              {/* Enhanced Quick Stats */}
              <div className="p-6 bg-gradient-to-br from-primary/5 via-cream to-primary/5 border-t-2 border-primary/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all">
                    <div className="text-4xl font-display bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent mb-1">
                      {getAllProducts().length}
                    </div>
                    <div className="text-xs text-dark-gray font-medium">
                      Total Dishes
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all">
                    <div className="text-4xl font-display bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent mb-1">
                      {allCategories.length}
                    </div>
                    <div className="text-xs text-dark-gray font-medium">
                      Categories
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full text-xs text-dark-gray">
                    <span className="text-lg">⭐</span>
                    <span>Fresh & Delicious</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content - Products Grid */}
          <div className="flex-1 min-w-0" id="products-section">
            {/* Enhanced Results Header */}
            <div className="bg-gradient-to-r from-white via-cream-light to-white rounded-2xl px-6 lg:px-8 py-6 mb-8 shadow-xl border-2 border-primary/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                    {categoryIcons[activeCategory] || "🍽️"}
                  </div>
                  <div>
                    <h3 className="font-display text-3xl text-dark mb-2 flex items-center gap-3">
                      {activeCategoryName}
                      <span className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {filteredProducts.length}{" "}
                        {filteredProducts.length === 1 ? "item" : "items"}
                      </span>
                    </h3>
                    <p className="text-dark-gray text-base">
                      {searchTerm ? (
                        <span className="flex items-center gap-2">
                          <span className="text-xl">🎯</span>
                          Search results for{" "}
                          <span className="font-semibold text-primary">
                            "{searchTerm}"
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="text-xl">✨</span>
                          Handpicked delicious dishes just for you
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-xl font-medium transition-all hover:shadow-md"
                    >
                      <span>✕</span> Clear
                    </button>
                  )}
                  <div className="flex items-center gap-2 bg-gradient-to-br from-cream to-cream-light px-5 py-3 rounded-xl border border-primary/20">
                    <span className="text-2xl">📊</span>
                    <div className="text-left">
                      <div className="text-xs text-dark-gray">Showing</div>
                      <div className="text-sm font-bold text-primary">
                        {filteredProducts.length}/
                        {activeCategory === "all"
                          ? getAllProducts().length
                          : categories.find(
                              (cat) => cat.id === activeCategory,
                            )?.count || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white via-cream-light to-white rounded-3xl shadow-2xl p-16 text-center border-2 border-primary/10">
                <div className="relative inline-block mb-6">
                  <div className="text-8xl animate-bounce-slow">🔍</div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xl animate-pulse">
                    ?
                  </div>
                </div>
                <h3 className="font-display text-4xl text-dark mb-4">
                  No items found
                </h3>
                <p className="text-dark-gray text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm
                    ? `We couldn't find any items matching "${searchTerm}". Try different keywords or browse our categories.`
                    : `No items available in this category at the moment. Check back soon for new additions!`}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all font-semibold flex items-center gap-3 hover:scale-105"
                    >
                      <span>✕</span> Clear Search
                    </button>
                  )}
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-2xl hover:bg-primary hover:text-white transition-all font-semibold flex items-center gap-3 hover:scale-105"
                  >
                    <span>🍽️</span> View All Items
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }

        .animate-shine {
          animation: shine 2s infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff6b35, #ff8c42);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ff6b35;
        }
      `}</style>
    </section>
  );
};

export default MenuCategoriesSection;
