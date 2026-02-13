import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProductsByCategory } from "../store/productsData";
import { addOnsData } from "../store/addOnsData";
import { useCart } from "../hooks/useCart";
import Navbar from "../components/layout/Navbar";
import CartDrawer from "../components/layout/CartDrawer";
import Footer from "../components/layout/Footer";
import Loader from "../components/common/Loader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState({
    drinks: [],
    desserts: [],
    extras: [],
  });
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState(null);
  const [activeAddOnTab, setActiveAddOnTab] = useState("drinks");

  useEffect(() => {
    setLoading(true);

    // Reset customizations when product changes
    setSelectedAddOns({
      drinks: [],
      desserts: [],
      extras: [],
    });
    setSelectedSpiceLevel(null);
    setSelectedSizeIndex(0);
    setActiveAddOnTab("drinks");

    // Simulate loading time
    setTimeout(() => {
      const productData = getProductById(id);
      if (!productData) {
        navigate("/");
        return;
      }
      setProduct(productData);

      // Get related products
      const related = getProductsByCategory(productData.category)
        .filter((p) => p.id !== id)
        .slice(0, 6);
      setRelatedProducts(related);
      setLoading(false);
    }, 800);
  }, [id, navigate]);

  const handleBackToHome = () => {
    setNavigating(true);
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  if (loading || navigating || !product) {
    return <Loader />;
  }

  const selectedSize = product.sizes[selectedSizeIndex];
  const addOnsConfig = product.addOnsConfig || {
    showSpiceLevel: false,
    showDrinks: true,
    showDesserts: true,
    showExtras: false,
  };

  // Toggle add-on selection with quantity
  const toggleAddOn = (category, item) => {
    setSelectedAddOns((prev) => {
      const categoryItems = prev[category];
      const isSelected = categoryItems.some((i) => i.id === item.id);

      if (isSelected) {
        // Remove item
        return {
          ...prev,
          [category]: categoryItems.filter((i) => i.id !== item.id),
        };
      } else {
        // Add item with default quantity of 1
        return {
          ...prev,
          [category]: [...categoryItems, { ...item, quantity: 1 }],
        };
      }
    });
  };

  // Update quantity for an add-on item
  const updateAddOnQuantity = (category, itemId, newQuantity) => {
    if (newQuantity < 1) return; // Minimum quantity is 1

    setSelectedAddOns((prev) => {
      const categoryItems = prev[category];
      return {
        ...prev,
        [category]: categoryItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      };
    });
  };

  // Calculate total price including add-ons with quantities
  const calculateTotalPrice = () => {
    let total = selectedSize.price;

    // Add drinks prices with quantities
    selectedAddOns.drinks.forEach((drink) => {
      total += drink.price * (drink.quantity || 1);
    });

    // Add desserts prices with quantities
    selectedAddOns.desserts.forEach((dessert) => {
      total += dessert.price * (dessert.quantity || 1);
    });

    // Add extras prices with quantities
    selectedAddOns.extras.forEach((extra) => {
      total += extra.price * (extra.quantity || 1);
    });

    return total;
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: calculateTotalPrice(),
      image: product.image,
      size: selectedSize.name,
      addOns: selectedAddOns,
      spiceLevel: selectedSpiceLevel,
    });

    // Reset customizations after adding to cart
    setSelectedAddOns({
      drinks: [],
      desserts: [],
      extras: [],
    });
    setSelectedSpiceLevel(null);
    setSelectedSizeIndex(0);
    setActiveAddOnTab("drinks");
  };

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main>
        {/* Product Detail Section */}
        <section className="pt-28 lg:pt-30 lg:pb-20">
          <div className="container mx-auto px-3 sm:px-6 lg:px-12">
            {/* Back Button */}
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 ml-6 text-dark hover:text-primary transition-colors mb-8 font-medium"
            >
              <span className="text-xl">←</span>
              <span>Back to Home</span>
            </button>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
              {/* Left Column - Image and Nutrition */}
              <div className="space-y-6">
                {/* Main Product Image */}
                <div className="rounded-3xl p-3 lg:p-5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl"
                  />
                </div>

                {/* Nutrition Info - Professional Design */}
                {product.nutritionInfo && (
                  <div className="rounded-3xl p-3 lg:p-5">
                    <h3 className="font-display text-2xl lg:text-3xl mb-4">
                      Nutrition Information
                    </h3>
                    <div className="bg-cream border-2 border-gray-200 rounded-2xl p-6 py-3 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-1 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </div>
                            <span className="font-display text-md lg:text-lg text-dark">
                              Calories
                            </span>
                          </div>
                          <span className="font-semibold text-lg text-primary">
                            {product.nutritionInfo.calories}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </div>
                            <span className="font-display text-md lg:text-lg text-dark">
                              Protein
                            </span>
                          </div>
                          <span className="font-semibold text-lg text-primary">
                            {product.nutritionInfo.protein}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                              </svg>
                            </div>
                            <span className="font-display text-md lg:text-lg text-dark">
                              Carbs
                            </span>
                          </div>
                          <span className="font-semibold text-lg text-primary">
                            {product.nutritionInfo.carbs}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            </div>
                            <span className="font-display text-md lg:text-lg text-dark">
                              Fat
                            </span>
                          </div>
                          <span className="font-semibold text-lg text-primary">
                            {product.nutritionInfo.fat}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Product Details and Order Form */}
              <div className="space-y-8 px-3 lg:px-0">
                {/* Product Name and Category */}
                <div>
                  <p className="text-primary font-medium mb-2">
                    {product.category}
                  </p>
                  <h1 className="font-display text-4xl lg:text-5xl mb-4">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < product.rating
                            ? "text-primary text-xl"
                            : "text-gray-300 text-xl"
                        }
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-display text-2xl mb-4">Description</h3>
                  <p className="text-dark-gray leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="font-display text-2xl mb-4">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="bg-cream px-4 py-2 rounded-full text-dark-gray text-sm border-2 border-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Size Selection and Add to Cart */}
                <div className="rounded-3xl p-6 lg:p-8 bg-cream border border-gray-200 shadow-xl">
                  {/* Size Selection - Dropdown */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 font-display text-lg mb-3 text-dark">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      Select Size{" "}
                      <span className="text-red-500 text-xl">*</span>
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedSizeIndex}
                        onChange={(e) =>
                          setSelectedSizeIndex(Number(e.target.value))
                        }
                        className="w-full px-3 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 border-2 border-primary/30 rounded-xl focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all bg-cream hover:border-primary/60 hover:bg-cream-light font-display text-sm sm:text-base appearance-none cursor-pointer shadow-sm hover:shadow-md text-dark leading-tight"
                      >
                        {product.sizes.map((size, index) => (
                          <option
                            key={index}
                            value={index}
                            className="py-3 sm:py-4 px-2 sm:px-4 bg-cream text-dark text-xs sm:text-base"
                            style={{
                              padding: "10px 12px",
                              backgroundColor: "#FFF8F0",
                            }}
                          >
                            {size.name} • Rs.{size.price.toFixed(2)} •{" "}
                            {size.description}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-y-[-45%]">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {/* Helper text */}
                    <p className="mt-2 text-xs text-dark-gray flex items-center gap-1 flex-wrap">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="truncate">
                        Selected: {product.sizes[selectedSizeIndex].name}
                      </span>
                    </p>
                  </div>

                  {/* Spice Level Selection - Dropdown (Only show if configured) */}
                  {addOnsConfig.showSpiceLevel && (
                    <div className="mb-6">
                      <label className="flex items-center gap-2 font-display text-lg mb-3 text-dark">
                        <svg
                          className="w-5 h-5 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                          />
                        </svg>
                        Spice Level{" "}
                        <span className="text-xs text-dark-gray font-normal bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                          Optional
                        </span>
                      </label>
                      <div className="relative group">
                        <select
                          value={selectedSpiceLevel || ""}
                          onChange={(e) =>
                            setSelectedSpiceLevel(e.target.value || null)
                          }
                          className="w-full px-3 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 border-2 border-primary/30 rounded-xl focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all bg-cream hover:border-primary/60 hover:bg-cream-light font-display text-sm sm:text-base appearance-none cursor-pointer shadow-sm hover:shadow-md text-dark leading-tight"
                        >
                          <option
                            value=""
                            className="py-3 sm:py-4 px-2 sm:px-4 bg-cream text-dark text-xs sm:text-xs"
                            style={{
                              padding: "10px 12px",
                              backgroundColor: "#FFF8F0",
                            }}
                          >
                            🔘 No Spice Preference
                          </option>
                          {addOnsData.spiceLevel.map((spice) => (
                            <option
                              key={spice.id}
                              value={spice.id}
                              className="py-3 sm:py-4 px-2 sm:px-4 bg-cream text-dark text-xs sm:text-base"
                              style={{
                                padding: "10px 12px",
                                backgroundColor: "#FFF8F0",
                              }}
                            >
                              {spice.icon} {spice.name} • {spice.description}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-y-[-45%]">
                          <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                        {/* Selected indicator - only show when something is selected */}
                        {selectedSpiceLevel && (
                          <div className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      {/* Helper text */}
                      {selectedSpiceLevel && (
                        <p className="mt-2 text-xs text-dark-gray flex items-center gap-1 flex-wrap">
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="truncate">
                            Selected:{" "}
                            {
                              addOnsData.spiceLevel.find(
                                (s) => s.id === selectedSpiceLevel,
                              )?.name
                            }
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price Display */}
                  <div className="bg-gradient-to-br from-cream via-cream-light to-cream rounded-2xl p-4 sm:p-6 mb-6 border-2 border-primary/20">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-lg text-dark-gray font-semibold mb-0.5">
                            Total Price
                          </p>
                          <p className="text-xs text-dark-gray/70 truncate">
                            Including all selections
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-display text-lg sm:text-2xl text-primary font-bold">
                          Rs.{calculateTotalPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-5 px-6 rounded-2xl font-display text-md sm:text-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                  >
                    <svg
                      className="w-6 h-6 transition-transform group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Add to Cart</span>
                    <svg
                      className="w-5 h-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Add-ons Section - Full Width Outside Grid */}
            {(addOnsConfig.showDrinks ||
              addOnsConfig.showDesserts ||
              addOnsConfig.showExtras) && (
              <div className="mb-20 px-4 lg:px-6">
                <div className="bg-gradient-to-br from-cream via-cream-light to-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </div>
                    <h2 className="font-display text-3xl lg:text-4xl text-dark">
                      Customize Your Order
                    </h2>
                  </div>
                  <p className="text-dark-gray mb-6 pl-13">
                    Add drinks, desserts, or extras to complete your meal
                  </p>

                  {/* Tab Navigation */}
                  <div className="flex gap-2 mb-6 border-b-2 border-gray-200 bg-cream rounded-t-2xl px-2 pt-2">
                    {addOnsConfig.showDrinks && (
                      <button
                        onClick={() => setActiveAddOnTab("drinks")}
                        className={`py-3 px-6 font-display text-base lg:text-lg transition-all relative rounded-t-xl ${
                          activeAddOnTab === "drinks"
                            ? "text-primary font-semibold bg-cream"
                            : "text-dark-gray hover:text-dark hover:bg-cream-light/50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          🥤 Drinks
                          {selectedAddOns.drinks.length > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                              {selectedAddOns.drinks.length}
                            </span>
                          )}
                        </span>
                        {activeAddOnTab === "drinks" && (
                          <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t"></span>
                        )}
                      </button>
                    )}
                    {addOnsConfig.showDesserts && (
                      <button
                        onClick={() => setActiveAddOnTab("desserts")}
                        className={`py-3 px-6 font-display text-base lg:text-lg transition-all relative rounded-t-xl ${
                          activeAddOnTab === "desserts"
                            ? "text-primary font-semibold bg-cream"
                            : "text-dark-gray hover:text-dark hover:bg-cream-light/50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          🍰 Desserts
                          {selectedAddOns.desserts.length > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                              {selectedAddOns.desserts.length}
                            </span>
                          )}
                        </span>
                        {activeAddOnTab === "desserts" && (
                          <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t"></span>
                        )}
                      </button>
                    )}
                    {addOnsConfig.showExtras && (
                      <button
                        onClick={() => setActiveAddOnTab("extras")}
                        className={`py-3 px-6 font-display text-base lg:text-lg transition-all relative rounded-t-xl ${
                          activeAddOnTab === "extras"
                            ? "text-primary font-semibold bg-cream"
                            : "text-dark-gray hover:text-dark hover:bg-cream-light/50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          ✨ Extras
                          {selectedAddOns.extras.length > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                              {selectedAddOns.extras.length}
                            </span>
                          )}
                        </span>
                        {activeAddOnTab === "extras" && (
                          <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t"></span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Tab Content - 2 Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cream p-4 rounded-b-2xl">
                    {/* Drinks Tab */}
                    {activeAddOnTab === "drinks" && addOnsConfig.showDrinks && (
                      <>
                        {addOnsData.drinks.map((drink) => {
                          const selectedItem = selectedAddOns.drinks.find(
                            (d) => d.id === drink.id,
                          );
                          const isSelected = !!selectedItem;
                          const quantity = selectedItem?.quantity || 1;

                          return (
                            <div
                              key={drink.id}
                              className={`group relative flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-200 ${
                                isSelected
                                  ? "border-primary bg-gradient-to-br from-cream to-cream-light shadow-lg scale-[1.02]"
                                  : "border-gray-200 hover:border-primary/60 hover:bg-cream-light/50 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      toggleAddOn("drinks", drink)
                                    }
                                    className="w-6 h-6 text-primary rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-primary cursor-pointer transition-all flex-shrink-0 appearance-none checked:bg-primary checked:border-primary"
                                    style={{
                                      backgroundImage: isSelected
                                        ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                                        : "none",
                                    }}
                                  />
                                </div>
                                <span className="font-display text-base lg:text-lg text-dark truncate font-medium">
                                  {drink.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                {isSelected && (
                                  <div className="flex items-center gap-1 bg-gradient-to-r from-white to-cream rounded-xl border-2 border-primary/30 shadow-sm">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateAddOnQuantity(
                                          "drinks",
                                          drink.id,
                                          quantity - 1,
                                        );
                                      }}
                                      className="text-dark hover:text-white hover:bg-primary font-semibold text-xl w-9 h-9 flex items-center justify-center rounded-l-lg transition-all active:scale-95"
                                    >
                                      −
                                    </button>
                                    <span className="font-display font-semibold text-dark min-w-[32px] text-center text-lg bg-white px-2">
                                      {quantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateAddOnQuantity(
                                          "drinks",
                                          drink.id,
                                          quantity + 1,
                                        );
                                      }}
                                      className="text-dark hover:text-white hover:bg-primary font-semibold text-xl w-9 h-9 flex items-center justify-center rounded-r-lg transition-all active:scale-95"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                                <div className="flex flex-col items-end">
                                  <span className="text-primary font-display font-bold text-base lg:text-lg whitespace-nowrap">
                                    +Rs.
                                    {(
                                      drink.price * (isSelected ? quantity : 1)
                                    ).toFixed(2)}
                                  </span>
                                  {isSelected && quantity > 1 && (
                                    <span className="text-xs text-dark-gray">
                                      Rs.{drink.price.toFixed(2)} each
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Desserts Tab */}
                    {activeAddOnTab === "desserts" &&
                      addOnsConfig.showDesserts && (
                        <>
                          {addOnsData.desserts.map((dessert) => {
                            const selectedItem = selectedAddOns.desserts.find(
                              (d) => d.id === dessert.id,
                            );
                            const isSelected = !!selectedItem;
                            const quantity = selectedItem?.quantity || 1;

                            return (
                              <div
                                key={dessert.id}
                                className={`group relative flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-200 ${
                                  isSelected
                                    ? "border-primary bg-gradient-to-br from-cream to-cream-light shadow-lg scale-[1.02]"
                                    : "border-gray-200 hover:border-primary/60 hover:bg-cream-light/50 hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        toggleAddOn("desserts", dessert)
                                      }
                                      className="w-6 h-6 text-primary rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-primary cursor-pointer transition-all flex-shrink-0 appearance-none checked:bg-primary checked:border-primary"
                                      style={{
                                        backgroundImage: isSelected
                                          ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                                          : "none",
                                      }}
                                    />
                                  </div>
                                  <span className="font-display text-base lg:text-lg text-dark truncate font-medium">
                                    {dessert.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {isSelected && (
                                    <div className="flex items-center gap-1 bg-gradient-to-r from-white to-cream rounded-xl border-2 border-primary/30 shadow-sm">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateAddOnQuantity(
                                            "desserts",
                                            dessert.id,
                                            quantity - 1,
                                          );
                                        }}
                                        className="text-dark hover:text-white hover:bg-primary font-bold text-xl w-9 h-9 flex items-center justify-center rounded-l-lg transition-all active:scale-95"
                                      >
                                        −
                                      </button>
                                      <span className="font-display font-bold text-dark min-w-[32px] text-center text-lg bg-white px-2">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateAddOnQuantity(
                                            "desserts",
                                            dessert.id,
                                            quantity + 1,
                                          );
                                        }}
                                        className="text-dark hover:text-white hover:bg-primary font-bold text-xl w-9 h-9 flex items-center justify-center rounded-r-lg transition-all active:scale-95"
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                  <div className="flex flex-col items-end">
                                    <span className="text-primary font-display font-bold text-base lg:text-lg whitespace-nowrap">
                                      +Rs.
                                      {(
                                        dessert.price *
                                        (isSelected ? quantity : 1)
                                      ).toFixed(2)}
                                    </span>
                                    {isSelected && quantity > 1 && (
                                      <span className="text-xs text-dark-gray">
                                        Rs.{dessert.price.toFixed(2)} each
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}

                    {/* Extras Tab */}
                    {activeAddOnTab === "extras" && addOnsConfig.showExtras && (
                      <>
                        {addOnsData.extras.map((extra) => {
                          const selectedItem = selectedAddOns.extras.find(
                            (e) => e.id === extra.id,
                          );
                          const isSelected = !!selectedItem;
                          const quantity = selectedItem?.quantity || 1;

                          return (
                            <div
                              key={extra.id}
                              className={`group relative flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-200 ${
                                isSelected
                                  ? "border-primary bg-gradient-to-br from-cream to-cream-light shadow-lg scale-[1.02]"
                                  : "border-gray-200 hover:border-primary/60 hover:bg-cream-light/50 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      toggleAddOn("extras", extra)
                                    }
                                    className="w-6 h-6 text-primary rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-primary cursor-pointer transition-all flex-shrink-0 appearance-none checked:bg-primary checked:border-primary"
                                    style={{
                                      backgroundImage: isSelected
                                        ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                                        : "none",
                                    }}
                                  />
                                </div>
                                <span className="font-display text-base lg:text-lg text-dark truncate font-medium">
                                  {extra.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                {isSelected && (
                                  <div className="flex items-center gap-1 bg-gradient-to-r from-white to-cream rounded-xl border-2 border-primary/30 shadow-sm">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateAddOnQuantity(
                                          "extras",
                                          extra.id,
                                          quantity - 1,
                                        );
                                      }}
                                      className="text-dark hover:text-white hover:bg-primary font-bold text-xl w-9 h-9 flex items-center justify-center rounded-l-lg transition-all active:scale-95"
                                    >
                                      −
                                    </button>
                                    <span className="font-display font-bold text-dark min-w-[32px] text-center text-lg bg-white px-2">
                                      {quantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateAddOnQuantity(
                                          "extras",
                                          extra.id,
                                          quantity + 1,
                                        );
                                      }}
                                      className="text-dark hover:text-white hover:bg-primary font-bold text-xl w-9 h-9 flex items-center justify-center rounded-r-lg transition-all active:scale-95"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                                <div className="flex flex-col items-end">
                                  <span className="text-primary font-display font-bold text-base lg:text-lg whitespace-nowrap">
                                    +Rs.
                                    {(
                                      extra.price * (isSelected ? quantity : 1)
                                    ).toFixed(2)}
                                  </span>
                                  {isSelected && quantity > 1 && (
                                    <span className="text-xs text-dark-gray">
                                      Rs.{extra.price.toFixed(2)} each
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div className="mt-20 px-4 lg:px-6">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="font-display text-4xl lg:text-5xl">
                    Related Products
                  </h2>
                  <div className="flex gap-2">
                    <button className="swiper-button-prev-related w-12 h-12 rounded-full bg-white border-2 border-dark/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all">
                      ←
                    </button>
                    <button className="swiper-button-next-related w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all">
                      →
                    </button>
                  </div>
                </div>

                <Swiper
                  modules={[Navigation]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation={{
                    nextEl: ".swiper-button-next-related",
                    prevEl: ".swiper-button-prev-related",
                  }}
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    },
                    1280: {
                      slidesPerView: 4,
                      spaceBetween: 30,
                    },
                  }}
                  className="pb-8"
                >
                  {relatedProducts.map((relatedProduct) => (
                    <SwiperSlide key={relatedProduct.id}>
                      <div
                        onClick={() =>
                          navigate(`/product/${relatedProduct.id}`)
                        }
                        className="bg-white rounded-3xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      >
                        <div className="mb-4 overflow-hidden rounded-2xl">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-display text-xl mb-2 text-center">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex justify-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < relatedProduct.rating
                                  ? "text-primary"
                                  : "text-gray-300"
                              }
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <div className="text-center">
                          <span className="font-display text-2xl text-dark">
                            Rs.{relatedProduct.basePrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetail;
