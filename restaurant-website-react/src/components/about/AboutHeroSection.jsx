import React from "react";

const AboutHeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-cream-dark via-cream-hero to-cream-darker py-16 lg:py-20 overflow-hidden">
      {/* Enhanced Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-primary-dark rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-primary-light rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-16 w-16 h-16 bg-white/20 rounded-full blur-xl animate-float-1"></div>
        <div className="absolute top-36 right-24 w-12 h-12 bg-white/20 rounded-full blur-xl animate-float-2"></div>
        <div className="absolute bottom-28 left-1/3 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float-3"></div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary-light/20 backdrop-blur-md px-4 py-2 rounded-full border-2 border-primary/40 shadow-lg animate-fade-in mb-5">
            <span className="text-2xl animate-bounce-slow">📖</span>
            <span className="text-dark font-bold text-xs tracking-wide uppercase">
              Our Story
            </span>
            <span className="flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
          </div>

          {/* Enhanced Heading */}
          <div className="space-y-3 mb-5">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-primary drop-shadow-lg animate-slide-up leading-tight">
              About Bites Restaurant
            </h1>

            {/* Decorative underline */}
            <div className="flex items-center justify-center gap-2 animate-slide-up-delay">
              <div className="h-1 w-16 bg-primary rounded-full"></div>
              <div className="h-1 w-10 bg-primary-light rounded-full"></div>
              <div className="h-1 w-5 bg-primary-dark rounded-full"></div>
            </div>
          </div>

          <p className="text-dark-gray text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed animate-slide-up-delay-2 mb-10">
            Where passion meets flavor, and every meal tells a story of
            tradition, innovation, and love for great food.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto mb-10 animate-slide-up-delay-3">
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 lg:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/20 hover:border-primary/40">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
              <div className="text-primary font-display text-3xl lg:text-4xl font-bold mb-1">15+</div>
              <div className="text-dark-gray text-sm font-semibold">Years Experience</div>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 lg:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/20 hover:border-primary/40">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">👥</div>
              <div className="text-primary font-display text-3xl lg:text-4xl font-bold mb-1">50K+</div>
              <div className="text-dark-gray text-sm font-semibold">Happy Customers</div>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 lg:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/20 hover:border-primary/40">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">⭐</div>
              <div className="text-primary font-display text-3xl lg:text-4xl font-bold mb-1">4.9</div>
              <div className="text-dark-gray text-sm font-semibold">Average Rating</div>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 lg:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/20 hover:border-primary/40">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🍽️</div>
              <div className="text-primary font-display text-3xl lg:text-4xl font-bold mb-1">200+</div>
              <div className="text-dark-gray text-sm font-semibold">Menu Items</div>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 animate-slide-up-delay-4">
            <div className="group bg-gradient-to-r from-white to-cream-light hover:from-primary hover:to-primary-light px-6 py-3 rounded-full border-2 border-primary/30 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <span className="text-2xl group-hover:scale-125 transition-transform">🏆</span>
              <span className="text-primary group-hover:text-white text-sm font-bold transition-colors">Award Winning</span>
            </div>
            <div className="group bg-gradient-to-r from-white to-cream-light hover:from-primary hover:to-primary-light px-6 py-3 rounded-full border-2 border-primary/30 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <span className="text-2xl group-hover:scale-125 transition-transform">🌟</span>
              <span className="text-primary group-hover:text-white text-sm font-bold transition-colors">Since 2010</span>
            </div>
            <div className="group bg-gradient-to-r from-white to-cream-light hover:from-primary hover:to-primary-light px-6 py-3 rounded-full border-2 border-primary/30 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <span className="text-2xl group-hover:scale-125 transition-transform">❤️</span>
              <span className="text-primary group-hover:text-white text-sm font-bold transition-colors">Family Owned</span>
            </div>
            <div className="group bg-gradient-to-r from-white to-cream-light hover:from-primary hover:to-primary-light px-6 py-3 rounded-full border-2 border-primary/30 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <span className="text-2xl group-hover:scale-125 transition-transform">🌱</span>
              <span className="text-primary group-hover:text-white text-sm font-bold transition-colors">Fresh Ingredients</span>
            </div>
            <div className="group bg-gradient-to-r from-white to-cream-light hover:from-primary hover:to-primary-light px-6 py-3 rounded-full border-2 border-primary/30 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <span className="text-2xl group-hover:scale-125 transition-transform">👨‍🍳</span>
              <span className="text-primary group-hover:text-white text-sm font-bold transition-colors">Expert Chefs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          className="w-full h-16 lg:h-20 fill-current text-cream-light drop-shadow-lg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(10px);
          }
        }

        @keyframes float-2 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-12px) translateX(-8px);
          }
        }

        @keyframes float-3 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-18px) translateX(12px);
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.15;
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.12;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-float-1 {
          animation: float-1 5s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float-2 6s ease-in-out infinite;
        }

        .animate-float-3 {
          animation: float-3 7s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2.5s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s backwards;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.4s backwards;
        }

        .animate-slide-up-delay-3 {
          animation: slide-up 0.8s ease-out 0.6s backwards;
        }

        .animate-slide-up-delay-4 {
          animation: slide-up 0.8s ease-out 0.8s backwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </section>
  );
};

export default AboutHeroSection;
