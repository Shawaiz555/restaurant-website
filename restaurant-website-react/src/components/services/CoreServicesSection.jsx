import React from "react";
import {
  Truck,
  Utensils,
  Package,
  PartyPopper,
  ChefHat,
  GraduationCap,
  Check,
} from "lucide-react";

const CoreServicesSection = () => {
  const mainServices = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Get your favorite meals delivered hot and fresh to your doorstep within 30-45 minutes.",
      features: [
        "Real-time order tracking",
        "GPS-enabled delivery",
        "Contactless delivery option",
        "Temperature-controlled packaging",
      ],
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Utensils,
      title: "Dine-In Experience",
      description:
        "Enjoy our warm ambiance and exceptional service in our beautifully designed restaurant space.",
      features: [
        "Comfortable seating arrangements",
        "Family-friendly atmosphere",
        "Free Wi-Fi access",
        "Live music on weekends",
      ],
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Package,
      title: "Takeaway Service",
      description:
        "Pre-order your meals and pick them up at your convenience—skip the wait, enjoy the taste.",
      features: [
        "Quick pickup service",
        "Pre-order scheduling",
        "Eco-friendly packaging",
        "Special discounts",
      ],
      color: "from-green-500 to-green-600",
    },
    {
      icon: PartyPopper,
      title: "Event Catering",
      description:
        "Make your special occasions unforgettable with our professional catering services.",
      features: [
        "Custom menu planning",
        "Professional staff",
        "Event setup & decoration",
        "Serving equipment provided",
      ],
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: ChefHat,
      title: "Private Chef",
      description:
        "Bring restaurant-quality dining to your home with our private chef service.",
      features: [
        "Personalized menu consultation",
        "Professional chef at your location",
        "Fresh ingredient sourcing",
        "Complete meal preparation",
      ],
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: GraduationCap,
      title: "Cooking Classes",
      description:
        "Learn from our expert chefs and master the art of cooking your favorite dishes.",
      features: [
        "Hands-on training",
        "Small group sessions",
        "Recipe booklets included",
        "Certificate of completion",
      ],
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 sm:px-6 lg:px-10 xl:px-16">
        <div className="text-center mb-16">
          <h2 className="font-sans font-bold text-4xl lg:text-5xl text-dark mb-4">
            Core Services
          </h2>
          <p className="text-dark-gray text-base lg:text-lg xl:text-xl max-w-2xl mx-auto">
            Comprehensive solutions tailored to your dining needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 xl:gap-8 items-stretch">
          {mainServices.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 flex flex-col"
            >
              <div
                className={`bg-gradient-to-r ${service.color} p-5 lg:p-6 xl:p-8 text-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <service.icon className="w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 mx-auto mb-3 text-white" />
                  <h3 className="font-sans font-bold text-xl lg:text-2xl xl:text-3xl text-white">
                    {service.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 lg:p-6 xl:p-8 flex flex-col flex-1">
                <p className="text-dark-gray text-sm lg:text-base xl:text-lg mb-4 lg:mb-5 xl:mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2 lg:space-y-3 flex-1">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 lg:gap-3">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
                      </div>
                      <span className="text-dark text-xs lg:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-5 lg:mt-6 bg-gradient-to-r from-primary to-primary-dark text-white py-2.5 lg:py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 text-sm lg:text-base">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreServicesSection;
