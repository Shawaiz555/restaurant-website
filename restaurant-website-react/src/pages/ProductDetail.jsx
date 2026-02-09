import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProductsByCategory } from "../store/productsData";
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

  useEffect(() => {
    setLoading(true);
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

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: selectedSize.price,
      image: product.image,
      size: selectedSize.name,
    });
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-20">
              {/* Left Column - Image and Price */}
              <div className="space-y-6">
                {/* Main Product Image */}
                <div className="rounded-3xl p-3 lg:p-5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl"
                  />
                </div>

                {/* Price and Add to Cart (All devices) */}
                <div className="rounded-3xl p-3 lg:p-5">
                  {/* Size Selection */}
                  <div className="mb-6">
                    <h3 className="font-display text-xl mb-4">Select Size</h3>
                    <div className="space-y-3">
                      {product.sizes.map((size, index) => (
                        <label
                          key={index}
                          className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedSizeIndex === index
                              ? "border-primary bg-cream"
                              : "border-gray-200 hover:border-primary"
                          }`}
                        >
                          <input
                            type="radio"
                            name="size"
                            checked={selectedSizeIndex === index}
                            onChange={() => setSelectedSizeIndex(index)}
                            className="hidden"
                          />
                          <div className="flex-1">
                            <p className="font-display text-lg text-dark">
                              {size.name}
                            </p>
                            <p className="text-dark-gray text-sm">
                              {size.description}
                            </p>
                          </div>
                          <p className="font-display text-xl text-primary">
                            ₹{size.price.toFixed(2)}
                          </p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                    <span className="text-dark-gray text-lg">Price</span>
                    <span className="font-display text-3xl text-primary">
                      ₹{selectedSize.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-full font-display text-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Right Column - Details */}
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

                {/* Nutrition Info */}
                {product.nutritionInfo && (
                  <div>
                    <h3 className="font-display text-2xl mb-4">
                      Nutrition Information
                    </h3>
                    <div className="bg-cream rounded-2xl p-1 lg:p-6 grid grid-cols-2 gap-4">
                      <div className="border-2 border-primary rounded-2xl p-4 text-center">
                        <p className="text-dark-gray font-bold text-md">
                          Calories
                        </p>
                        <p className="font-light text-lg text-dark">
                          {product.nutritionInfo.calories}
                        </p>
                      </div>
                      <div className="border-2 border-primary rounded-2xl p-4 text-center">
                        <p className="text-dark-gray font-bold text-md">
                          Protein
                        </p>
                        <p className="font-light text-lg text-dark">
                          {product.nutritionInfo.protein}
                        </p>
                      </div>
                      <div className="border-2 border-primary rounded-2xl p-4 text-center">
                        <p className="text-dark-gray font-bold text-md">
                          Carbs
                        </p>
                        <p className="font-light text-lg text-dark">
                          {product.nutritionInfo.carbs}
                        </p>
                      </div>
                      <div className="border-2 border-primary rounded-2xl p-4 text-center">
                        <p className="text-dark-gray font-bold text-md">Fat</p>
                        <p className="font-light text-lg text-dark">
                          {product.nutritionInfo.fat}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                            ₹{relatedProduct.basePrice.toFixed(2)}
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
