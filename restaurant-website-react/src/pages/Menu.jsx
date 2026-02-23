import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MenuHeroSection from "../components/menu/MenuHeroSection";
import MenuCategoriesSection from "../components/menu/MenuCategoriesSection";
import productsService from "../services/productsService";
import {
  Utensils,
  Star,
  Coffee,
  Salad,
  Fish,
  Sandwich,
  Pizza,
  UtensilsCrossed,
  Wine,
  Soup,
  Beef,
  Leaf,
  Sprout,
  Cake,
  Drumstick,
  IceCream,
  Cookie,
  Wheat,
} from "lucide-react";

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get category from URL or default to 'all'
  const categoryFromUrl = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  // Update URL when category changes
  useEffect(() => {
    if (activeCategory === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", activeCategory);
    }
    setSearchParams(searchParams, { replace: true });
  }, [activeCategory, searchParams, setSearchParams]);

  // Get all products dynamically
  const allProducts = productsService.getProducts();

  // Get unique categories from products
  const allCategories = [...new Set(allProducts.map((p) => p.category))].sort();

  // Default category icons mapped to Lucide components
  const defaultCategoryIcons = {
    all: Utensils,
    "popular-dishes": Star,
    breakfast: Coffee,
    noodles: Soup,
    salads: Salad,
    japanese: Fish,
    drinks: Wine,
    lunch: Sandwich,
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

  // Fallback icon map for unknown categories
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

  // Function to get icon component for category
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
    return Utensils; // Default icon for unknown categories
  };

  // Create category buttons data dynamically
  const categories = [
    {
      id: "all",
      label: "All Items",
      count: allProducts.length,
      icon: Utensils,
    },
    ...allCategories.map((cat) => ({
      id: cat.toLowerCase().replace(/\s+/g, "-"),
      label: cat,
      originalName: cat,
      count: allProducts.filter((p) => p.category === cat).length,
      icon: getCategoryIcon(cat),
    })),
  ];

  // Get filtered products based on active category and search term
  const getFilteredProducts = () => {
    let products;

    if (activeCategory === "all") {
      products = allProducts;
    } else {
      const category = categories.find((cat) => cat.id === activeCategory);
      products = category
        ? allProducts.filter(
            (p) => p.category === (category.originalName || category.label),
          )
        : [];
    }

    // Apply search filter
    if (searchTerm.trim()) {
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return products;
  };

  const filteredProducts = getFilteredProducts();

  // Get active category name for display
  const activeCategoryName =
    activeCategory === "all"
      ? "All Items"
      : categories.find((cat) => cat.id === activeCategory)?.label || "Menu";

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setShowMobileCategories(false);

    // Scroll to products section instead of top
    setTimeout(() => {
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        const offsetTop = productsSection.offsetTop - 100; // 100px offset for navbar
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-cream-light via-white to-cream-light pt-20">
        <MenuHeroSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setActiveCategory={setActiveCategory}
        />
        <MenuCategoriesSection
          categories={categories}
          activeCategory={activeCategory}
          handleCategoryChange={handleCategoryChange}
          showMobileCategories={showMobileCategories}
          setShowMobileCategories={setShowMobileCategories}
          filteredProducts={filteredProducts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeCategoryName={activeCategoryName}
        />
      </main>
    </>
  );
};

export default Menu;
