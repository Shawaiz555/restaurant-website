import React from "react";

const CoreServicesSection = () => {
  const mainServices = [
    {
      icon: "🚚",
      title: "Fast Delivery",
      description: "Get your favorite meals delivered hot and fresh to your doorstep within 30-45 minutes.",
      features: [
        "Real-time order tracking",
        "GPS-enabled delivery",
        "Contactless delivery option",
        "Temperature-controlled packaging"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "🍽️",
      title: "Dine-In Experience",
      description: "Enjoy our warm ambiance and exceptional service in our beautifully designed restaurant space.",
      features: [
        "Comfortable seating arrangements",
        "Family-friendly atmosphere",
        "Free Wi-Fi access",
        "Live music on weekends"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "📦",
      title: "Takeaway Service",
      description: "Pre-order your meals and pick them up at your convenience—skip the wait, enjoy the taste.",
      features: [
        "Quick pickup service",
        "Pre-order scheduling",
        "Eco-friendly packaging",
        "Special discounts"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: "🎉",
      title: "Event Catering",
      description: "Make your special occasions unforgettable with our professional catering services.",
      features: [
        "Custom menu planning",
        "Professional staff",
        "Event setup & decoration",
        "Serving equipment provided"
      ],
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: "👨‍🍳",
      title: "Private Chef",
      description: "Bring restaurant-quality dining to your home with our private chef service.",
      features: [
        "Personalized menu consultation",
        "Professional chef at your location",
        "Fresh ingredient sourcing",
        "Complete meal preparation"
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: "🎓",
      title: "Cooking Classes",
      description: "Learn from our expert chefs and master the art of cooking your favorite dishes.",
      features: [
        "Hands-on training",
        "Small group sessions",
        "Recipe booklets included",
        "Certificate of completion"
      ],
      color: "from-red-500 to-red-600"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-dark mb-4">Core Services</h2>
          <p className="text-dark-gray text-xl max-w-2xl mx-auto">
            Comprehensive solutions tailored to your dining needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainServices.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary/20"
            >
              <div className={`bg-gradient-to-r ${service.color} p-8 text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="text-7xl mb-4">{service.icon}</div>
                  <h3 className="font-display text-3xl text-white">{service.title}</h3>
                </div>
              </div>

              <div className="p-8">
                <p className="text-dark-gray text-lg mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm">✓</span>
                      </div>
                      <span className="text-dark text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105">
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
