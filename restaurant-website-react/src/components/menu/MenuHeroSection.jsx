import React from "react";

const MenuHeroSection = ({ searchTerm, setSearchTerm, setActiveCategory }) => {
  return (
    <section className="relative bg-gradient-to-r from-primary via-primary to-primary-dark py-16 lg:py-20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 sm:px-6 lg:px-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6 border border-white/30">
            <span className="text-2xl">✨</span>
            <span className="text-white font-medium text-sm">
              Discover Amazing Flavors
            </span>
          </div>

          <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl text-white mb-4 leading-tight">
            Our Complete Menu
          </h1>
          <p className="text-white/95 text-lg lg:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore our delicious selection of carefully crafted dishes,
            made with fresh ingredients and passion
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center">
                  <span className="pl-6 text-3xl">🔍</span>
                  <input
                    type="text"
                    placeholder="Search for dishes, ingredients, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-5 text-base lg:text-lg border-0 focus:ring-0 focus:outline-none bg-transparent placeholder-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mr-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <span className="text-gray-600">✕</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Search Tags */}
            <div className="my-6 flex flex-wrap items-center justify-center gap-3">
              <span className="text-white/80 text-sm">Popular:</span>
              {["Breakfast", "Noodles", "Salads", "Japanese"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveCategory(tag.toLowerCase())}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm rounded-full border border-white/30 transition-all hover:scale-105"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 fill-current text-cream-light"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default MenuHeroSection;
