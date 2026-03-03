import React from "react";
import {
  Sparkles,
  Utensils,
  Truck,
  PartyPopper,
  Smartphone,
  Zap,
  Target,
  Award,
  ArrowRight,
} from "lucide-react";

const ServicesHeroSection = () => {
  const services = [
    {
      icon: Utensils,
      label: "Dine-In",
      color: "from-orange-400 to-orange-500",
    },
    { icon: Truck, label: "Delivery", color: "from-blue-400 to-blue-500" },
    {
      icon: PartyPopper,
      label: "Catering",
      color: "from-purple-400 to-purple-500",
    },
    {
      icon: Smartphone,
      label: "Online Order",
      color: "from-green-400 to-green-500",
    },
  ];

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
        <div className="absolute bottom-28 right-1/4 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float-3"></div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary-light/20 backdrop-blur-md px-4 py-2 rounded-full border-2 border-primary/40 shadow-lg animate-fade-in mb-5">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-dark font-bold text-xs tracking-wide uppercase">
              What We Offer
            </span>
            <span className="flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
          </div>

          {/* Enhanced Heading */}
          <div className="space-y-3 mb-5">
            <h1 className="font-sans font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-primary drop-shadow-lg animate-slide-up leading-tight">
              Our Services
            </h1>

            {/* Decorative underline */}
            <div className="flex items-center justify-center gap-2 animate-slide-up-delay">
              <div className="h-1 w-16 bg-primary rounded-full"></div>
              <div className="h-1 w-10 bg-primary-light rounded-full"></div>
              <div className="h-1 w-5 bg-primary-dark rounded-full"></div>
            </div>
          </div>

          <p className="text-dark-gray text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto animate-slide-up-delay-2 mb-10">
            From dine-in excellence to doorstep delivery, we offer comprehensive
            services designed to make every meal memorable
          </p>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 max-w-4xl mx-auto animate-slide-up-delay-3">
            {services.map((service, idx) => (
              <div
                key={service.label}
                className="group relative"
                style={{
                  animation: `slide-up 0.8s ease-out ${0.8 + idx * 0.1}s backwards`,
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300`}
                ></div>
                <div className="relative bg-white rounded-2xl p-5 lg:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/20 hover:border-primary/40">
                  <div
                    className={`w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-3 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <service.icon className="w-8 h-8 lg:w-9 lg:h-9 text-white" />
                  </div>
                  <div className="text-dark font-bold text-sm lg:text-base">
                    {service.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Row */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-slide-up-delay-4">
            <div className="bg-white/70 backdrop-blur-sm px-5 py-3 rounded-xl border border-primary/20 shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-dark font-bold text-xs">Fast Service</div>
                <div className="text-dark-gray text-[10px]">
                  30 min delivery
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm px-5 py-3 rounded-xl border border-primary/20 shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
              <Target className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-dark font-bold text-xs">
                  24/7 Available
                </div>
                <div className="text-dark-gray text-[10px]">Always open</div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm px-5 py-3 rounded-xl border border-primary/20 shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-dark font-bold text-xs">Quality First</div>
                <div className="text-dark-gray text-[10px]">
                  Premium ingredients
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-10 animate-slide-up-delay-4">
            <p className="text-dark-gray text-sm mb-4">
              Ready to experience our services?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="group relative bg-gradient-to-r from-primary to-primary-light text-white hover:from-primary-dark hover:to-primary px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl hover:shadow-primary/50 hover:scale-105 flex items-center gap-2 overflow-hidden">
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative">Book a Table</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                View Menu
              </button>
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
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(10px);
          }
        }

        @keyframes float-2 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-12px) translateX(-8px);
          }
        }

        @keyframes float-3 {
          0%,
          100% {
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

export default ServicesHeroSection;
