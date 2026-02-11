import React from "react";

const HeroSection = () => {
  const scrollToMenu = () => {
    const element = document.getElementById("menu");
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="home"
      className="relative pt-20 pb-24 lg:pt-28 lg:pb-32 overflow-hidden bg-gradient-to-r from-primary via-primary to-primary-dark"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-white rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-1/3 w-48 h-48 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 sm:px-6 lg:px-16 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="relative">
            {/* Decorative Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6 border border-white/30">
              <span className="text-2xl">🍽️</span>
              <span className="text-white font-medium text-sm">
                Welcome to Bites
              </span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6 text-white">
              We Serve The Taste You Love
            </h1>

            <p className="text-white/90 text-lg lg:text-xl mb-8 max-w-lg leading-relaxed">
              Experience authentic flavors crafted with passion. From
              traditional favorites to innovative dishes, every bite tells a
              story of culinary excellence.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={scrollToMenu}
                className="bg-white text-primary hover:bg-cream px-8 py-4 lg:px-12 rounded-2xl font-bold transition-all shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center gap-2"
              >
                <span>Explore Menu</span>
                <span className="text-xl">→</span>
              </button>
              <button
                onClick={scrollToMenu}
                className="bg-primary-dark/50 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white hover:text-primary px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"
              >
                Order Now
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              <div className="text-center">
                <div className="text-white text-3xl lg:text-4xl font-display mb-1">
                  50K+
                </div>
                <div className="text-white/80 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-white text-3xl lg:text-4xl font-display mb-1">
                  4.9
                </div>
                <div className="text-white/80 text-sm">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-white text-3xl lg:text-4xl font-display mb-1">
                  200+
                </div>
                <div className="text-white/80 text-sm">Menu Items</div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center">
            {/* Main Content Container */}
            <div className="relative w-full max-w-5xl mx-auto">
              {/* Food Image */}
              <div className="relative z-10 md:px-8 lg:px-12">
                <img
                  src="/assets/images/FoodPlateImg.png"
                  alt="Delicious biryani"
                  className="w-full lg:max-w-2xl mx-auto rounded-full drop-shadow-2xl"
                  style={{ animation: "floating 3s ease-in-out infinite" }}
                />
              </div>

              {/* Category Badges - Desktop */}
              <div className="hidden lg:flex absolute right-4 lg:right-0 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
                {[
                  { emoji: "🍽️", label: "Dishes" },
                  { emoji: "🧁", label: "Dessert" },
                  { emoji: "🥤", label: "Drinks" },
                  { emoji: "🍱", label: "Platter" },
                  { emoji: "🥗", label: "Salads", active: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      item.active
                        ? "bg-white text-primary shadow-2xl scale-105"
                        : "bg-white/90 backdrop-blur-sm text-dark"
                    } rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2.5 hover:scale-105 transition-all cursor-pointer whitespace-nowrap border-2 ${
                      item.active ? "border-white" : "border-white/50"
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Category Badges - Mobile */}
              <div className="lg:hidden mt-8 flex flex-wrap justify-center gap-3">
                {[
                  { emoji: "🍽️", label: "Dishes" },
                  { emoji: "🧁", label: "Dessert" },
                  { emoji: "🥤", label: "Drinks" },
                  { emoji: "🍱", label: "Platter" },
                  { emoji: "🥗", label: "Salads", active: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      item.active
                        ? "bg-white text-primary"
                        : "bg-white/90 backdrop-blur-sm text-dark"
                    } rounded-full px-4 py-2 shadow-xl flex items-center gap-2 hover:scale-105 transition-all cursor-pointer border-2 border-white/50`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 lg:h-24 fill-current text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <style jsx>{`
        @keyframes floating {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
