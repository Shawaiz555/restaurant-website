import React from 'react';

const HeroSection = () => {
  const scrollToMenu = () => {
    const element = document.getElementById('menu');
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="pt-20 pb-20 lg:pt-28 lg:pb-20 overflow-hidden">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-5 items-center">
          {/* Left Content */}
          <div className="relative">
            {/* Decorative Pattern */}
            <div className="absolute -top-10 -left-10 w-20 h-20 opacity-20">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary"></div>
                ))}
              </div>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6">
              We Serve The Taste You Love 😋
            </h1>

            <p className="text-dark-gray text-lg mb-8 max-w-lg">
              This is a type of restaurant which typically serves food and
              drinks, in addition to light refreshments such as baked goods or
              snacks. The term comes from the ranch word meaning food.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={scrollToMenu}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 lg:px-12 rounded-full font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Explore Food
              </button>
              <input
                type="text"
                placeholder="Search"
                className="bg-white hover:bg-gray-50 text-dark px-8 py-4 rounded-full font-medium transition-all border-2 border-dark/10 flex items-center gap-2"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center">
            {/* Decorative Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg md:max-w-xl lg:max-w-2xl rounded-full bg-cream border-4 border-gray-200 -z-10"></div>

            {/* Main Content Container */}
            <div className="relative w-full max-w-5xl mx-auto">
              {/* Food Image */}
              <div className="relative z-10 px-4 md:px-8 lg:px-12">
                <img
                  src="/assets/images/FoodPlateImg.png"
                  alt="Delicious biryani"
                  className="w-full max-w-md lg:max-w-2xl mx-auto rounded-full"
                  style={{ animation: 'floating 3s ease-in-out infinite' }}
                />
              </div>

              {/* Category Badges - Desktop */}
              <div className="hidden lg:flex absolute right-4 lg:right-0 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
                {[
                  { emoji: '🍽️', label: 'Dishes' },
                  { emoji: '🧁', label: 'Dessert' },
                  { emoji: '🥤', label: 'Drinks' },
                  { emoji: '🍱', label: 'Platter' },
                  { emoji: '🥗', label: 'Salads', active: true }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      item.active ? 'bg-primary text-white' : 'bg-white'
                    } rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2.5 hover:scale-105 transition-transform cursor-pointer whitespace-nowrap`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Category Badges - Mobile */}
              <div className="lg:hidden mt-8 flex flex-wrap justify-center gap-3">
                {[
                  { emoji: '🍽️', label: 'Dishes' },
                  { emoji: '🧁', label: 'Dessert' },
                  { emoji: '🥤', label: 'Drinks' },
                  { emoji: '🍱', label: 'Platter' },
                  { emoji: '🥗', label: 'Salads', active: true }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      item.active ? 'bg-primary text-white' : 'bg-white'
                    } rounded-full px-4 py-2 shadow-lg flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Decorative Dots */}
              <div className="hidden lg:block absolute -bottom-10 -right-10 w-20 h-20 opacity-20">
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floating {
          0%, 100% {
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
