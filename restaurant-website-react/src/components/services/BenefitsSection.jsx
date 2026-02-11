import React from "react";

const BenefitsSection = () => {
  const benefits = [
    { icon: "⚡", title: "Quick Service", description: "Fast order processing and delivery" },
    { icon: "🏅", title: "Quality Assured", description: "100% satisfaction guaranteed" },
    { icon: "💳", title: "Secure Payment", description: "Multiple payment options available" },
    { icon: "🔄", title: "Easy Returns", description: "Hassle-free refund policy" },
    { icon: "📞", title: "24/7 Support", description: "Always here to help you" },
    { icon: "🎁", title: "Loyalty Rewards", description: "Earn points with every order" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-dark mb-4">Why Choose Us</h2>
          <p className="text-dark-gray text-xl">Benefits that make us stand out</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-cream-light to-cream rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-primary/10"
            >
              <div className="text-5xl mb-3">{benefit.icon}</div>
              <h3 className="font-semibold text-dark mb-2 text-sm">{benefit.title}</h3>
              <p className="text-dark-gray text-xs">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
