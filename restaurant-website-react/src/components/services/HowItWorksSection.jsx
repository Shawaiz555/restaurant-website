import React from "react";

const HowItWorksSection = () => {
  const process = [
    { step: "1", title: "Browse Menu", description: "Explore our extensive menu and select your favorites", icon: "📋" },
    { step: "2", title: "Place Order", description: "Add items to cart and proceed to checkout", icon: "🛒" },
    { step: "3", title: "We Prepare", description: "Our chefs prepare your order with care", icon: "👨‍🍳" },
    { step: "4", title: "Delivery/Pickup", description: "Get it delivered or pick it up fresh", icon: "🚗" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-cream to-cream-light">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-dark mb-4">How It Works</h2>
          <p className="text-dark-gray text-xl">Simple steps to enjoy our delicious food</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {process.map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl text-center h-full border-2 border-primary/10 hover:border-primary/30 transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                  {item.step}
                </div>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-display text-2xl text-dark mb-3">{item.title}</h3>
                <p className="text-dark-gray">{item.description}</p>
              </div>

              {index < process.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="text-primary text-4xl">→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
