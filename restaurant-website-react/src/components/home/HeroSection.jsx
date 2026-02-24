import React from "react";
import { Link } from "react-router-dom";
import {
  Utensils,
  ArrowRight,
  Users,
  Star,
  Trophy,
  Package,
  Cake,
  Wine,
  Salad,
  Check,
  Zap,
  ShoppingCart,
} from "lucide-react";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 overflow-hidden bg-gradient-to-br from-cream-dark via-cream-hero to-cream-darker"
    >
      {/* Enhanced Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-primary-dark rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-primary-light rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-40 right-1/3 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse-slower"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-12 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float-1"></div>
        <div className="absolute top-48 right-32 w-16 h-16 bg-white/20 rounded-full blur-xl animate-float-2"></div>
        <div className="absolute bottom-32 left-1/3 w-24 h-24 bg-white/20 rounded-full blur-xl animate-float-3"></div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-center">
          {/* Left Content */}
          <div className="relative space-y-5 lg:space-y-6">
            {/* Enhanced Decorative Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary-light/20 backdrop-blur-md px-4 py-2 rounded-full border-2 border-primary/40 shadow-lg animate-fade-in group">
              <Utensils className="w-5 h-5 text-primary" />
              <span className="text-dark font-bold text-xs tracking-wide uppercase">
                Welcome to Bites Restaurant
              </span>
              <span className="flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
            </div>

            {/* Enhanced Heading */}
            <div className="space-y-3">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] text-primary drop-shadow-lg animate-slide-up">
                We Serve The
                <span className="block text-primary-dark mt-1">
                  Taste You Love
                </span>
              </h1>

              {/* Decorative underline */}
              <div className="flex items-center gap-2 animate-slide-up-delay">
                <div className="h-1 w-16 bg-primary rounded-full"></div>
                <div className="h-1 w-10 bg-primary-light rounded-full"></div>
                <div className="h-1 w-5 bg-primary-dark rounded-full"></div>
              </div>
            </div>

            {/* Enhanced Description */}
            <p className="text-dark-gray text-lg lg:text-xl max-w-xl leading-relaxed animate-slide-up-delay-2">
              Experience authentic flavors crafted with passion and served with
              love. From traditional favorites to innovative dishes, every bite
              tells a story of culinary excellence.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2 animate-slide-up-delay-3">
              <Link to="/menu">
                <button className="group relative bg-gradient-to-r from-primary to-primary-light text-white hover:from-primary-dark hover:to-primary px-8 py-4 lg:px-10 lg:py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-2xl hover:shadow-primary/50 hover:scale-105 flex items-center gap-2 overflow-hidden">
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <span className="relative">Explore Menu</span>
                  <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
              <Link to="/menu">
                <button className="group bg-white text-primary border-3 border-primary hover:bg-primary hover:text-white px-8 py-4 lg:px-10 lg:py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Order Now</span>
                </button>
              </Link>
            </div>

            {/* Enhanced Stats with Icons */}
            <div className="mt-8 grid grid-cols-3 gap-4 lg:gap-6 max-w-xl animate-slide-up-delay-4">
              <div className="group text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-primary text-3xl lg:text-4xl font-display mb-1 group-hover:scale-110 transition-transform">
                  50K+
                </div>
                <div className="text-dark-gray text-xs font-semibold">
                  Happy Customers
                </div>
                <Users className="w-6 h-6 mx-auto mt-2 text-primary" />
              </div>
              <div className="group text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-primary text-3xl lg:text-4xl font-display mb-1 group-hover:scale-110 transition-transform flex items-center justify-center gap-1">
                  4.9
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
                <div className="text-dark-gray text-xs font-semibold">
                  Average Rating
                </div>
                <Trophy className="w-6 h-6 mx-auto mt-2 text-primary" />
              </div>
              <div className="group text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-primary text-3xl lg:text-4xl font-display mb-1 group-hover:scale-110 transition-transform">
                  200+
                </div>
                <div className="text-dark-gray text-xs font-semibold">
                  Menu Items
                </div>
                <Package className="w-6 h-6 mx-auto mt-2 text-primary" />
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Image Section */}
          <div className="relative min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
            {/* Decorative Circle Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[350px] h-[350px] lg:w-[500px] lg:h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 blur-3xl animate-pulse-slow"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative w-full max-w-5xl mx-auto">
              {/* Food Image with Enhanced Effects */}
              <div className="relative z-10 px-4 md:px-6 lg:px-8">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-light/30 rounded-full blur-2xl transform scale-105"></div>

                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop&q=80"
                  alt="Delicious gourmet food platter"
                  className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto rounded-full drop-shadow-[0_35px_35px_rgba(230,126,34,0.4)] hover:drop-shadow-[0_45px_45px_rgba(230,126,34,0.5)] transition-all duration-500 hover:scale-105"
                  style={{ animation: "floating 4s ease-in-out infinite" }}
                />

                {/* Decorative dots around image */}
                <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full animate-ping"></div>
                <div className="absolute bottom-10 left-10 w-3 h-3 bg-primary-light rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-0 w-5 h-5 bg-primary-dark rounded-full animate-bounce-slow"></div>
              </div>

              {/* Enhanced Category Badges - Desktop */}
              <div className="hidden lg:flex absolute right-0 xl:-right-4 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
                {[
                  {
                    icon: Utensils,
                    label: "Dishes",
                    color: "from-orange-400 to-orange-500",
                  },
                  {
                    icon: Cake,
                    label: "Dessert",
                    color: "from-pink-400 to-pink-500",
                  },
                  {
                    icon: Wine,
                    label: "Drinks",
                    color: "from-blue-400 to-blue-500",
                  },
                  {
                    icon: Package,
                    label: "Platter",
                    color: "from-green-400 to-green-500",
                  },
                  {
                    icon: Salad,
                    label: "Salads",
                    active: true,
                    color: "from-primary to-primary-light",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      item.active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-2xl scale-105 ring-2 ring-white`
                        : "bg-white/95 backdrop-blur-md text-primary hover:shadow-xl"
                    } rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap border-2 ${
                      item.active
                        ? "border-white"
                        : "border-primary/20 hover:border-primary/40"
                    } group`}
                    style={{
                      animation: `slide-in-right ${0.5 + idx * 0.1}s ease-out`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Enhanced Category Badges - Mobile */}
              <div className="lg:hidden mt-6 flex flex-wrap justify-center gap-2.5">
                {[
                  { icon: Utensils, label: "Dishes" },
                  { icon: Cake, label: "Dessert" },
                  { icon: Wine, label: "Drinks" },
                  { icon: Package, label: "Platter" },
                  { icon: Salad, label: "Salads", active: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      item.active
                        ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-xl ring-2 ring-primary/30"
                        : "bg-white/95 backdrop-blur-sm text-primary"
                    } rounded-xl px-5 py-3 shadow-lg flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer border-2 ${
                      item.active ? "border-primary-dark" : "border-primary/30"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Floating Badge - Quality Assured */}
              <div className="absolute top-4 left-2 lg:left-4 bg-white rounded-xl shadow-xl p-3 animate-float-1 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-dark font-bold text-xs">Quality</div>
                    <div className="text-dark-gray text-[10px]">Assured</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge - Fast Delivery */}
              <div className="absolute bottom-12 right-2 lg:right-4 bg-white rounded-xl shadow-xl p-3 animate-float-2 hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-dark font-bold text-xs">Fast</div>
                    <div className="text-dark-gray text-[10px]">Delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          className="w-full h-20 lg:h-28 fill-current text-cream-light drop-shadow-lg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes floating {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(2deg);
          }
        }

        @keyframes float-1 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes float-2 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(-10px);
          }
        }

        @keyframes float-3 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-25px) translateX(15px);
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
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
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.15;
          }
        }

        @keyframes pulse-slower {
          0%,
          100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.12;
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float-1 {
          animation: float-1 6s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float-2 7s ease-in-out infinite;
        }

        .animate-float-3 {
          animation: float-3 8s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
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

export default HeroSection;
