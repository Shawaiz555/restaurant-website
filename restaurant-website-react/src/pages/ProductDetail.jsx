import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productsService from "../services/productsService";
import { useCart } from "../hooks/useCart";
import Loader from "../components/common/Loader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Wine, Cake, PlusCircle } from "lucide-react";
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
    const loadProduct = async () => {
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

      try {
        const productData = await productsService.fetchProductById(id);
        if (!productData) {
          navigate("/");
          return;
        }
        setProduct(productData);

        // Get related products
        const related = await productsService.fetchProductsByCategory(
          productData.category,
        );
        setRelatedProducts(
          related.filter((p) => (p.id || p._id) !== id).slice(0, 6),
        );
        setLoading(false);
      } catch (error) {
        console.error("Error loading product:", error);
        navigate("/");
      }
    };

    loadProduct();
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
  // Default add-ons configuration for products that don't specify one
  const defaultAddOnsConfig = {
    showSpiceLevel: false,
    showDrinks: true,
    showDesserts: true,
    showExtras: false,
  };
  const addOnsConfig = product.addOnsConfig || defaultAddOnsConfig;
  console.log("Product addOnsConfig:", product.addOnsConfig);
  console.log("Final addOnsConfig:", addOnsConfig);

  // Normalise nutritionInfo to a flat array of {label, display} entries.
  // Handles both old object format {calories, protein, carbs, fat}
  // and new array format [{label, value, unit}].
  const nutritionRows = (() => {
    const raw = product.nutritionInfo;
    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw
        .filter((item) => item && (item.label || item.name) && item.value !== "" && item.value != null)
        .map((item) => {
          const label = item.label || item.name;
          const valueStr = String(item.value).trim();
          const display =
            item.unit && !valueStr.includes(item.unit)
              ? `${valueStr} ${item.unit}`
              : valueStr;
          return { label, display };
        });
    }

    // Old object format
    return ["calories", "protein", "carbs", "fat"]
      .filter((k) => raw[k] != null && raw[k] !== "")
      .map((k) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), display: String(raw[k]) }));
  })();

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
      id: product._id || product.id,
      name: product.name,
      price: calculateTotalPrice(),
      image: productsService.getImageUrl(product),
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
                    src={productsService.getImageUrl(product)}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/600x400?text=No+Image";
                    }}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl"
                  />
                </div>

                {/* Nutrition Info */}
                {nutritionRows.length > 0 && (
                  <div className="rounded-3xl p-3 lg:p-5">
                    <h3 className="font-sans font-bold text-2xl lg:text-3xl mb-4">
                      Nutrition Information
                    </h3>
                    <div className="bg-cream-light border-2 border-gray-200 rounded-2xl p-6 py-3 shadow-sm">
                      <div className="space-y-4">
                        {nutritionRows.map((row, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between py-1 ${idx < nutritionRows.length - 1 ? "border-b border-gray-200" : ""}`}
                          >
                            <span className="font-sans text-md lg:text-lg text-dark">
                              {row.label}
                            </span>
                            <span className="font-semibold text-lg text-primary">
                              {row.display}
                            </span>
                          </div>
                        ))}
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
                  <h1 className="font-sans font-bold text-4xl lg:text-5xl mb-4">
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
                  <h3 className="font-sans font-bold text-2xl mb-4">Description</h3>
                  <p className="text-dark-gray leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Ingredients */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <div>
                    <h3 className="font-sans font-bold text-2xl mb-4">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="bg-cream-light px-4 py-2 rounded-full text-dark-gray text-sm border-2 border-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection and Add to Cart */}
                <div className="rounded-3xl p-6 lg:p-8 bg-cream-light border border-gray-200 shadow-xl">
                  {/* Size Selection - Dropdown */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 font-sans text-lg mb-3 text-dark">
                      Select Size{" "}
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedSizeIndex}
                        onChange={(e) =>
                          setSelectedSizeIndex(Number(e.target.value))
                        }
                        className="w-full px-3 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 border-2 border-primary/30 rounded-xl focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all bg-cream-light hover:border-primary/60 hover:bg-cream-light font-sans text-sm sm:text-base appearance-none cursor-pointer shadow-sm hover:shadow-md text-dark leading-tight"
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

                  {/* Spice Level Selection - Dropdown (Only show if configured and has spice levels) */}
                  {addOnsConfig.showSpiceLevel &&
                    product.spiceLevels &&
                    product.spiceLevels.length > 0 && (
                      <div className="mb-6">
                        <label className="flex items-center gap-2 font-sans text-lg mb-3 text-dark">
                          Spice Level{" "}
                          <span className="text-xs text-dark-gray font-normal bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            Optional
                          </span>
                        </label>
                        <div className="relative group">
                          <select
                            value={selectedSpiceLevel?.name || ""}
                            onChange={(e) => {
                              const spice = product.spiceLevels.find(
                                (s) => s.name === e.target.value,
                              );
                              setSelectedSpiceLevel(spice || null);
                            }}
                            className="w-full px-3 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 border-2 border-primary/30 rounded-xl focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all bg-cream-light hover:border-primary/60 hover:bg-cream-light font-sans text-sm sm:text-base appearance-none cursor-pointer shadow-sm hover:shadow-md text-dark leading-tight"
                          >
                            <option
                              value=""
                              className="py-3 sm:py-4 px-2 sm:px-4 bg-cream-light text-dark text-xs sm:text-xs"
                              style={{
                                padding: "10px 12px",
                                backgroundColor: "#FFF8F0",
                              }}
                            >
                              🔘 No Spice Preference
                            </option>
                            {product.spiceLevels.map((spice, spiceIndex) => (
                              <option
                                key={spiceIndex}
                                value={spice.name}
                                className="py-3 sm:py-4 px-2 sm:px-4 bg-cream-light text-dark text-xs sm:text-base"
                                style={{
                                  padding: "10px 12px",
                                  backgroundColor: "#FFF8F0",
                                }}
                              >
                                {spice.name} • {spice.description}
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
                              Selected: {selectedSpiceLevel?.name}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                  {/* Price Display */}
                  <div className="bg-cream-light rounded-2xl p-4 sm:p-6 mb-6 border-2 border-primary/20">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 sm:w-10 sm:h-10 text-primary"
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
                        <span className="font-sans text-lg sm:text-2xl text-primary font-bold">
                          Rs.{calculateTotalPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-5 px-6 rounded-2xl font-sans text-md sm:text-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
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
              <div className="mb-20 px-4 lg:px-8">
                <div className="bg-cream-light rounded-3xl p-6 shadow-xl border border-gray-200 max-w-8xl mx-auto">
                  <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 lg:w-6 lg:h-6 text-primary"
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
                    <h2 className="font-sans font-bold text-3xl lg:text-5xl text-dark">
                      Customize Your Order
                    </h2>
                  </div>
                  <p className="text-dark-gray text-base lg:text-lg mb-6 lg:mb-8 pl-13 lg:pl-16">
                    Add drinks, desserts, or extras to complete your meal
                  </p>

                  {/* Tab Navigation */}
                  <div className="flex gap-1 sm:gap-2 lg:gap-3 mb-6 lg:mb-8 border-b-2 border-gray-200 bg-cream-light rounded-t-2xl px-1 sm:px-2 lg:px-3 pt-2 lg:pt-3 overflow-x-auto">
                    {addOnsConfig.showDrinks && (
                      <button
                        onClick={() => setActiveAddOnTab("drinks")}
                        className={`py-2 sm:py-3 lg:py-4 px-3 sm:px-4 md:px-6 lg:px-8 font-sans text-sm sm:text-base md:text-lg lg:text-xl transition-all relative rounded-t-xl whitespace-nowrap flex-shrink-0 ${
                          activeAddOnTab === "drinks"
                            ? "text-primary font-semibold bg-cream-light"
                            : "text-dark-gray hover:text-dark hover:bg-cream-light/50"
                        }`}
                      >
                        <span className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                          <span className="text-base sm:text-lg lg:text-xl">
                            🥤
                          </span>
                          <span className="hidden xs:inline">Drinks</span>
                          <span className="xs:hidden">Drinks</span>
                          {selectedAddOns.drinks.length > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] lg:min-w-[28px] h-5 sm:h-6 lg:h-7 px-1.5 sm:px-2 lg:px-2.5 text-[10px] sm:text-xs lg:text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                              {selectedAddOns.drinks.length}
                            </span>
                          )}
                        </span>
                        {activeAddOnTab === "drinks" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t"></span>
                        )}
                      </button>
                    )}
                    {addOnsConfig.showDesserts && (
                      <button
                        onClick={() => setActiveAddOnTab("desserts")}
                        className={`py-2 sm:py-3 lg:py-4 px-3 sm:px-4 md:px-6 lg:px-8 font-sans text-sm sm:text-base md:text-lg lg:text-xl transition-all relative rounded-t-xl whitespace-nowrap flex-shrink-0 ${
                          activeAddOnTab === "desserts"
                            ? "text-primary font-semibold bg-cream-light"
                            : "text-dark-gray hover:text-dark hover:bg-cream-light/50"
                        }`}
                      >
                        <span className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                          <span className="text-base sm:text-lg lg:text-xl">
                            🍰
                          </span>
                          <span>Desserts</span>
                          {selectedAddOns.desserts.length > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] lg:min-w-[28px] h-5 sm:h-6 lg:h-7 px-1.5 sm:px-2 lg:px-2.5 text-[10px] sm:text-xs lg:text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                              {selectedAddOns.desserts.length}
                            </span>
                          )}
                        </span>
                        {activeAddOnTab === "desserts" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t"></span>
                        )}
                      </button>
                    )}
                    {addOnsConfig.showExtras && (
                      <button
                        onClick={() => setActiveAddOnTab("extras")}
                        className={`py-2 sm:py-3 lg:py-4 px-3 sm:px-4 md:px-6 lg:px-8 font-sans text-sm sm:text-base md:text-lg lg:text-xl transition-all relative rounded-t-xl whitespace-nowrap flex-shrink-0 ${
                          activeAddOnTab === "extras"
                            ? "text-primary font-semibold bg-cream-light"
                            : "text-dark-gray hover:text-dark hover:bg-cream-light/50"
                        }`}
                      >
                        <span className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                          <span className="text-base sm:text-lg lg:text-xl">
                            ✨
                          </span>
                          <span>Extras</span>
                          {selectedAddOns.extras.length > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] lg:min-w-[28px] h-5 sm:h-6 lg:h-7 px-1.5 sm:px-2 lg:px-2.5 text-[10px] sm:text-xs lg:text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                              {selectedAddOns.extras.length}
                            </span>
                          )}
                        </span>
                        {activeAddOnTab === "extras" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t"></span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Tab Content - 2 Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 bg-cream-light p-3 sm:p-4 lg:p-6 rounded-b-2xl">
                    {/* Drinks Tab */}
                    {activeAddOnTab === "drinks" && addOnsConfig.showDrinks && (
                      <>
                        {(product.drinks || []).length === 0 ? (
                          <div className="text-center py-12 text-dark-gray">
                            <Wine className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">
                              No drink options available for this product.
                            </p>
                          </div>
                        ) : (
                          (product.drinks || []).map((drink, drinkIndex) => {
                            // Create a unique ID for drinks if not present
                            const drinkWithId = {
                              ...drink,
                              id: drink.id || `drink-${drinkIndex}`,
                            };
                            const selectedItem = selectedAddOns.drinks.find(
                              (d) => d.id === drinkWithId.id,
                            );
                            const isSelected = !!selectedItem;
                            const quantity = selectedItem?.quantity || 1;

                            return (
                              <div
                                key={drinkWithId.id}
                                onClick={() => {
                                  if (!isSelected) {
                                    toggleAddOn("drinks", drinkWithId);
                                  }
                                }}
                                className={`group relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 lg:p-5 border-2 rounded-xl transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg ring-2 ring-primary/20"
                                    : "border-gray-200 hover:border-primary/60 hover:bg-cream-light/50 hover:shadow-md hover:scale-[1.01]"
                                }`}
                              >
                                {/* Top row on mobile, left side on desktop */}
                                <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 min-w-0 mb-2 sm:mb-0">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAddOn("drinks", drinkWithId);
                                    }}
                                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                                      isSelected
                                        ? "bg-primary border-primary scale-110"
                                        : "border-gray-300 hover:border-primary/60 hover:bg-primary/5"
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg
                                        viewBox="0 0 16 16"
                                        fill="white"
                                        className="w-3 h-3 sm:w-4 sm:h-4"
                                      >
                                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-sans text-sm sm:text-base lg:text-lg text-dark truncate">
                                      {drinkWithId.name}
                                    </div>
                                    <div className="text-[11px] sm:text-xs lg:text-sm text-dark-gray">
                                      {drinkWithId.description || "350ml"}
                                    </div>
                                  </div>
                                  <div className="text-primary font-sans font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap flex-shrink-0 mr-2 sm:mr-3 lg:mr-4">
                                    +Rs.
                                    {(
                                      drinkWithId.price *
                                      (isSelected ? quantity : 1)
                                    ).toFixed(2)}
                                  </div>
                                </div>

                                {/* Quantity controls and "Add" button */}
                                <div className="flex items-center justify-end gap-0 flex-shrink-0">
                                  {isSelected ? (
                                    <div className="flex items-center gap-0.5 sm:gap-1 bg-white rounded-lg sm:rounded-xl border-2 border-primary shadow-md">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (quantity === 1) {
                                            toggleAddOn("drinks", drinkWithId);
                                          } else {
                                            updateAddOnQuantity(
                                              "drinks",
                                              drinkWithId.id,
                                              quantity - 1,
                                            );
                                          }
                                        }}
                                        className="text-primary hover:text-white hover:bg-primary font-bold text-lg sm:text-xl w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-l-lg transition-all active:scale-95"
                                      >
                                        {quantity === 1 ? "✕" : "−"}
                                      </button>
                                      <span className="font-sans font-bold text-dark min-w-[32px] sm:min-w-[40px] lg:min-w-[48px] text-center text-base sm:text-lg px-1 sm:px-2 lg:px-3">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateAddOnQuantity(
                                            "drinks",
                                            drinkWithId.id,
                                            quantity + 1,
                                          );
                                        }}
                                        className="text-primary hover:text-white hover:bg-primary font-bold text-lg sm:text-xl w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-r-lg transition-all active:scale-95"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAddOn("drinks", drink);
                                      }}
                                      className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm lg:text-base transition-all transform hover:scale-105 active:scale-95 border-2 border-primary/20 hover:border-primary"
                                    >
                                      Add
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </>
                    )}

                    {/* Desserts Tab */}
                    {activeAddOnTab === "desserts" &&
                      addOnsConfig.showDesserts && (
                        <>
                          {(product.desserts || []).length === 0 ? (
                            <div className="text-center py-12 text-dark-gray">
                              <Cake className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg">
                                No dessert options available for this product.
                              </p>
                            </div>
                          ) : (
                            (product.desserts || []).map(
                              (dessert, dessertIndex) => {
                                const dessertWithId = {
                                  ...dessert,
                                  id: dessert.id || `dessert-${dessertIndex}`,
                                };
                                const selectedItem =
                                  selectedAddOns.desserts.find(
                                    (d) => d.id === dessertWithId.id,
                                  );
                                const isSelected = !!selectedItem;
                                const quantity = selectedItem?.quantity || 1;

                                return (
                                  <div
                                    key={dessertWithId.id}
                                    onClick={() => {
                                      if (!isSelected) {
                                        toggleAddOn("desserts", dessertWithId);
                                      }
                                    }}
                                    className={`group relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer ${
                                      isSelected
                                        ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg ring-2 ring-primary/20"
                                        : "border-gray-200 hover:border-primary/60 hover:bg-cream-light/50 hover:shadow-md hover:scale-[1.01]"
                                    }`}
                                  >
                                    {/* Checkbox, name, and price in one row */}
                                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 min-w-0 mb-2 sm:mb-0">
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleAddOn(
                                            "desserts",
                                            dessertWithId,
                                          );
                                        }}
                                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                                          isSelected
                                            ? "bg-primary border-primary"
                                            : "border-gray-300 hover:border-primary/60"
                                        }`}
                                      >
                                        {isSelected && (
                                          <svg
                                            viewBox="0 0 16 16"
                                            fill="white"
                                            className="w-3 h-3 sm:w-4 sm:h-4"
                                          >
                                            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className="font-sans text-sm sm:text-base lg:text-lg text-dark font-medium flex-1 truncate">
                                        {dessertWithId.name}
                                      </span>
                                      <div className="text-primary font-sans font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap flex-shrink-0 mr-2 sm:mr-3 lg:mr-4">
                                        +Rs.
                                        {(
                                          dessertWithId.price *
                                          (isSelected ? quantity : 1)
                                        ).toFixed(2)}
                                      </div>
                                    </div>

                                    {/* Quantity controls and "Add" button */}
                                    <div className="flex items-center justify-end gap-0 flex-shrink-0">
                                      {isSelected ? (
                                        <div className="flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-white to-cream rounded-lg sm:rounded-xl border-2 border-primary/30 shadow-sm">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (quantity === 1) {
                                                toggleAddOn(
                                                  "desserts",
                                                  dessertWithId,
                                                );
                                              } else {
                                                updateAddOnQuantity(
                                                  "desserts",
                                                  dessertWithId.id,
                                                  quantity - 1,
                                                );
                                              }
                                            }}
                                            className="text-primary hover:text-white hover:bg-primary font-bold text-lg sm:text-xl w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-l-lg transition-all active:scale-95"
                                          >
                                            {quantity === 1 ? "✕" : "−"}
                                          </button>
                                          <span className="font-sans font-bold text-dark min-w-[28px] sm:min-w-[32px] lg:min-w-[40px] text-center text-base sm:text-lg bg-white px-1 sm:px-2 lg:px-3">
                                            {quantity}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updateAddOnQuantity(
                                                "desserts",
                                                dessertWithId.id,
                                                quantity + 1,
                                              );
                                            }}
                                            className="text-primary hover:text-white hover:bg-primary font-bold text-lg sm:text-xl w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-r-lg transition-all active:scale-95"
                                          >
                                            +
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleAddOn(
                                              "desserts",
                                              dessertWithId,
                                            );
                                          }}
                                          className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm lg:text-base transition-all transform hover:scale-105 active:scale-95 border-2 border-primary/20 hover:border-primary"
                                        >
                                          Add
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              },
                            )
                          )}
                        </>
                      )}

                    {/* Extras Tab */}
                    {activeAddOnTab === "extras" && addOnsConfig.showExtras && (
                      <>
                        {(product.extras || []).length === 0 ? (
                          <div className="text-center py-12 text-dark-gray">
                            <PlusCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">
                              No extra options available for this product.
                            </p>
                          </div>
                        ) : (
                          (product.extras || []).map((extra, extraIndex) => {
                            const extraWithId = {
                              ...extra,
                              id: extra.id || `extra-${extraIndex}`,
                            };
                            const selectedItem = selectedAddOns.extras.find(
                              (e) => e.id === extraWithId.id,
                            );
                            const isSelected = !!selectedItem;
                            const quantity = selectedItem?.quantity || 1;

                            return (
                              <div
                                key={extraWithId.id}
                                onClick={() => {
                                  if (!isSelected) {
                                    toggleAddOn("extras", extraWithId);
                                  }
                                }}
                                className={`group relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 lg:p-5 border-2 rounded-xl transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg ring-2 ring-primary/20"
                                    : "border-gray-200 hover:border-primary/60 hover:bg-cream-light/50 hover:shadow-md hover:scale-[1.01]"
                                }`}
                              >
                                {/* Checkbox, name, and price in one row */}
                                <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 min-w-0 mb-2 sm:mb-0">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAddOn("extras", extraWithId);
                                    }}
                                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                                      isSelected
                                        ? "bg-primary border-primary"
                                        : "border-gray-300 hover:border-primary/60"
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg
                                        viewBox="0 0 16 16"
                                        fill="white"
                                        className="w-3 h-3 sm:w-4 sm:h-4"
                                      >
                                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="font-sans text-sm sm:text-base lg:text-lg text-dark font-medium flex-1 truncate">
                                    {extraWithId.name}
                                  </span>
                                  <div className="text-primary font-sans font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap flex-shrink-0 mr-2 sm:mr-3 lg:mr-4">
                                    +Rs.
                                    {(
                                      extraWithId.price *
                                      (isSelected ? quantity : 1)
                                    ).toFixed(2)}
                                  </div>
                                </div>

                                {/* Quantity controls and "Add" button */}
                                <div className="flex items-center justify-end gap-0 flex-shrink-0">
                                  {isSelected ? (
                                    <div className="flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-white to-cream rounded-lg sm:rounded-xl border-2 border-primary/30 shadow-sm">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (quantity === 1) {
                                            toggleAddOn("extras", extraWithId);
                                          } else {
                                            updateAddOnQuantity(
                                              "extras",
                                              extraWithId.id,
                                              quantity - 1,
                                            );
                                          }
                                        }}
                                        className="text-primary hover:text-white hover:bg-primary font-bold text-lg sm:text-xl w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-l-lg transition-all active:scale-95"
                                      >
                                        {quantity === 1 ? "✕" : "−"}
                                      </button>
                                      <span className="font-sans font-bold text-dark min-w-[28px] sm:min-w-[32px] text-center text-base sm:text-lg bg-white px-1 sm:px-2">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateAddOnQuantity(
                                            "extras",
                                            extraWithId.id,
                                            quantity + 1,
                                          );
                                        }}
                                        className="text-primary hover:text-white hover:bg-primary font-bold text-lg sm:text-xl w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-r-lg transition-all active:scale-95"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAddOn("extras", extraWithId);
                                      }}
                                      className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm lg:text-base transition-all transform hover:scale-105 active:scale-95 border-2 border-primary/20 hover:border-primary"
                                    >
                                      Add
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
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
                  <h2 className="font-sans font-bold text-4xl lg:text-5xl">
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
                          navigate(
                            `/product/${relatedProduct.id || relatedProduct._id}`,
                          )
                        }
                        className="bg-white rounded-3xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      >
                        <div className="mb-4 overflow-hidden rounded-2xl">
                          <img
                            src={productsService.getImageUrl(relatedProduct)}
                            alt={relatedProduct.name}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x300?text=No+Image";
                            }}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-sans font-bold text-xl mb-2 text-center">
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
                          <span className="font-sans text-2xl text-dark">
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
    </>
  );
};

export default ProductDetail;
