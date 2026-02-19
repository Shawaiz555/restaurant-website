import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MenuHeroSection from "../components/menu/MenuHeroSection";
import MenuCategoriesSection from "../components/menu/MenuCategoriesSection";
import {
  getAllProducts,
  getProductsByCategory,
  getCategories,
} from "../store/productsData";

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

  // Get all available categories from products
  const allCategories = getCategories();

  // Category icons mapping
  const categoryIcons = {
    all: "🍽️",
    "popular-dishes": "⭐",
    breakfast: "🥞",
    noodles: "🍜",
    salads: "🥗",
    japanese: "🍱",
    drinks: "🥤",
    lunch: "🍔",
  };

  // Create category buttons data
  const categories = [
    { id: "all", label: "All Items", count: getAllProducts().length },
    ...allCategories.map((cat) => ({
      id: cat.toLowerCase().replace(/\s+/g, "-"),
      label: cat,
      originalName: cat,
      count: getProductsByCategory(cat).length,
    })),
  ];

  // Get filtered products based on active category and search term
  const getFilteredProducts = () => {
    let products;

    if (activeCategory === "all") {
      products = getAllProducts();
    } else {
      const category = categories.find((cat) => cat.id === activeCategory);
      products = category
        ? getProductsByCategory(category.originalName || category.label)
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
          categoryIcons={categoryIcons}
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
