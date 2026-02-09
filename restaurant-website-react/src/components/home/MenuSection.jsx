import React, { useState } from 'react';
import ProductCard from '../common/ProductCard';
import { getProductsByCategory } from '../../store/productsData';

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('breakfast');

  const categories = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'noodles', label: 'Noodles' },
    { id: 'salads', label: 'Salad' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'lunch', label: 'Lunch' },
  ];

  const categoryMap = {
    breakfast: 'Breakfast',
    noodles: 'Noodles',
    salads: 'Salads',
    japanese: 'Japanese',
    drinks: 'Drinks',
    lunch: 'Lunch',
  };

  const menuItems = getProductsByCategory(categoryMap[activeCategory]) || [];

  return (
    <section id="menu" className="py-16 lg:py-24">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <h2 className="font-display text-4xl lg:text-5xl text-center mb-4">
          Our Regular Menu Pack
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`${
                activeCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-cream hover:bg-primary hover:text-white'
              } px-6 py-3 rounded-full border-primary border-2 font-medium transition-all`}
            >
              {category.label}
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
      </div>

      <style jsx>{`
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
