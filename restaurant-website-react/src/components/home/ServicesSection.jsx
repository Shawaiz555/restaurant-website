import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CalendarDays,
  Clock,
  Store,
  Sparkles,
  ChefHat,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    { icon: Package, title: "Online Order", desc: "Easy & fast ordering" },
    { icon: CalendarDays, title: "Pre-Reservation", desc: "Book your table" },
    { icon: Clock, title: "24/7 Service", desc: "Always here for you" },
    { icon: Store, title: "Organized Foodie Place", desc: "Premium ambiance" },
    {
      icon: Sparkles,
      title: "Clean Kitchen",
      desc: "Highest hygiene standards",
    },
    { icon: ChefHat, title: "Super Chefs", desc: "Culinary experts" },
  ];

  return (
    <section
      className="py-20 lg:py-32 bg-white relative overflow-hidden"
      id="services"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Chef Image Area */}
          <div className="w-full lg:w-1/2 relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-110 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 border-4 border-dashed border-primary/20 rounded-full animate-spin-slower"></div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 border-4 border-dashed border-primary/20 rounded-full animate-spin-slow"></div>

              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=800&fit=crop&q=80"
                alt="Professional chef preparing gourmet food"
                className="relative rounded-full w-full max-w-lg mx-auto shadow-2xl z-10 border-8 border-white group-hover:scale-105 transition-transform duration-500"
              />

              {/* Floating Stat Card */}
              <div className="absolute top-10 right-0 bg-white p-4 rounded-2xl shadow-xl z-20 animate-bounce-slow border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-dark">100%</div>
                    <div className="text-xs text-dark-gray font-semibold text-nowrap">
                      Hygiene Certified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold text-xs tracking-widest uppercase">
                  Our Services
                </span>
              </div>
              <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-dark leading-tight">
                We Are More Than Just <br className="hidden sm:block" />
                <span className="text-primary">Multiple Services</span>
              </h2>
              <p className="text-dark-gray text-lg leading-relaxed max-w-xl">
                Experience a new standard of dining where every detail is
                crafted for your delight. From our kitchen to your table, we
                ensure excellence in every bite and every service.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-cream-light/30 hover:bg-white hover:shadow-xl hover:border-primary/20 border-2 border-transparent transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                    <service.icon className="w-6 h-6 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-dark mb-1 group-hover:text-primary transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-dark-gray text-xs font-medium">
                      {service.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Link to="/about">
                <button className="group bg-primary text-white hover:bg-primary-dark px-10 py-5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-primary/30 hover:scale-105 flex items-center gap-2">
                  Learn About Us
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-slower {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
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
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 20s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;
