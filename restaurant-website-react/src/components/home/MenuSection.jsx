import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../common/ProductCard";
import { getProductsByCategory } from "../../store/productsData";
import {
  Coffee,
  Soup,
  Salad,
  Fish,
  Wine,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const MenuSection = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("breakfast");

  const categories = [
    { id: "breakfast", label: "Breakfast", icon: Coffee },
    { id: "noodles", label: "Noodles", icon: Soup },
    { id: "salads", label: "Salad", icon: Salad },
    { id: "japanese", label: "Japanese", icon: Fish },
    { id: "drinks", label: "Drinks", icon: Wine },
    { id: "lunch", label: "Lunch", icon: UtensilsCrossed },
  ];

  const categoryMap = {
    breakfast: "Breakfast",
    noodles: "Noodles",
    salads: "Salads",
    japanese: "Japanese",
    drinks: "Drinks",
    lunch: "Lunch",
  };

  const menuItems = getProductsByCategory(categoryMap[activeCategory]) || [];

  return (
    <section
      id="menu"
      className="py-20 lg:py-32 bg-cream-light/20 relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-40 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 animate-fade-in translate-y-[-10px]">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-xs tracking-widest uppercase">
              Special Selection
            </span>
          </div>
          <h2 className="font-display text-5xl lg:text-6xl text-dark leading-tight">
            Our Regular <span className="text-primary italic">Menu Pack</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary/20 mx-auto rounded-full mt-4 flex overflow-hidden">
            <div className="w-1/3 h-full bg-primary animate-slide-right"></div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all duration-300 transform
                ${
                  activeCategory === category.id
                    ? "bg-primary border-primary text-white shadow-xl scale-105"
                    : "bg-white border-primary/10 text-dark-gray hover:border-primary/40 hover:bg-cream-light/50"
                }
              `}
            >
              <category.icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  activeCategory === category.id ? "text-white" : "text-primary"
                }`}
              />
              <span className="font-bold tracking-wide">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {menuItems.map((product) => (
            <div
              key={product.id}
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${menuItems.indexOf(product) * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View Full Menu Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/menu")}
            className="group relative bg-primary text-white hover:bg-primary-dark px-12 py-5 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-primary/40 hover:scale-105 flex items-center gap-3 mx-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <UtensilsCrossed className="w-6 h-6" />
            <span className="relative">View Complete Menu</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        .animate-slide-right {
          animation: slide-right 2s ease-in-out infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default MenuSection;
