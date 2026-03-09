import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import productsService from "../../services/productsService";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.basePrice,
      image: productsService.getImageUrl(product),
      size: product.sizes[0]?.name || "Regular",
    });
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id || product._id}`)}
      className="bg-white rounded-3xl p-6 mb-10 hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="mb-4 overflow-hidden rounded-2xl">
        <img
          src={productsService.getImageUrl(product)}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
          }}
        />
      </div>
      <h3 className="font-sans font-bold text-xl mb-2 text-center">
        {product.name}
      </h3>
      <div className="flex justify-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < product.rating ? "text-primary" : "text-gray-300"}
          >
            ⭐
          </span>
        ))}
      </div>
      <p className="text-dark-gray text-sm text-center mb-4 line-clamp-2">
        {product.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-sans text-2xl font-semibold text-dark">
          Rs.{product.basePrice.toFixed(2)}
        </span>
        <button
          onClick={handleAddToCart}
          className="bg-primary text-white hover:bg-primary-dark px-6 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
