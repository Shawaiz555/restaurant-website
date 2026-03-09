import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../common/ProductCard";
import productsService from "../../services/productsService";
import {
  Coffee,
  Soup,
  Salad,
  Fish,
  Wine,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  Utensils,
  Star,
  Sandwich,
  Pizza,
  Cake,
  Drumstick,
  IceCream,
  Cookie,
  Wheat,
  Beef,
  Leaf,
  Sprout,
} from "lucide-react";

// Default category icons
const defaultCategoryIcons = {
  breakfast: Coffee,
  noodles: Soup,
  salads: Salad,
  japanese: Fish,
  drinks: Wine,
  lunch: UtensilsCrossed,
  "popular-dishes": Star,
  burgers: Sandwich,
  pizza: Pizza,
  pasta: UtensilsCrossed,
  desserts: Cake,
  appetizers: UtensilsCrossed,
  seafood: Fish,
  chicken: Drumstick,
  beef: Beef,
  vegetarian: Leaf,
  vegan: Sprout,
};

// Fallback icon map
const fallbackIconMap = {
  soup: Soup,
  rice: Utensils,
  sandwich: Sandwich,
  steak: Beef,
  fish: Fish,
  meat: Beef,
  snacks: Cookie,
  coffee: Coffee,
  tea: Coffee,
  juice: Wine,
  smoothie: Wine,
  ice: IceCream,
  cake: Cake,
  cookie: Cookie,
  bread: Wheat,
  wrap: Sandwich,
};

// Get icon for category (moved outside component to avoid dependency issues)
const getCategoryIcon = (category) => {
  const categoryKey = category.toLowerCase().replace(/\s+/g, "-");
  if (defaultCategoryIcons[categoryKey]) {
    return defaultCategoryIcons[categoryKey];
  }
  for (const [key, icon] of Object.entries(fallbackIconMap)) {
    if (category.toLowerCase().includes(key)) {
      return icon;
    }
  }
  return Utensils; // Default icon
};

const MenuSection = () => {
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [menuItems, setMenuItems] = useState([]);

  // Load categories dynamically from products
  useEffect(() => {
    const loadCategories = async () => {
      const allProducts = (await productsService.fetchProducts()) || [];
      const uniqueCategories = [
        ...new Set(allProducts.map((p) => p.category)),
      ].sort();

      // Show all categories
      const categoriesToShow = uniqueCategories.map((cat) => ({
        id: cat.toLowerCase().replace(/\s+/g, "-"),
        label: cat,
        originalName: cat,
        icon: getCategoryIcon(cat),
      }));

      setAllCategories(categoriesToShow);

      // Set first category as active
      if (categoriesToShow.length > 0) {
        setActiveCategory(categoriesToShow[0].id);
      }
    };

    loadCategories();
  }, []);

  // Load menu items when active category changes
  useEffect(() => {
    if (!activeCategory) return;
    const category = allCategories.find((cat) => cat.id === activeCategory);
    if (!category) return;

    const loadItems = async () => {
      const items =
        (await productsService.fetchProductsByCategory(
          category.originalName,
        )) || [];
      setMenuItems(items);
    };

    loadItems();
  }, [activeCategory, allCategories]);

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
          <h2 className="font-sans font-bold text-5xl lg:text-6xl text-dark leading-tight">
            Our Regular <span className="text-primary italic">Menu Pack</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary/20 mx-auto rounded-full mt-4 flex overflow-hidden">
            <div className="w-1/3 h-full bg-primary animate-slide-right"></div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center gap-4 mb-5">
          {allCategories.map((category) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
