import React from "react";

const ValuesSection = () => {
  const values = [
    {
      icon: "🌱",
      title: "Fresh Ingredients",
      description:
        "We source the finest, freshest ingredients locally and internationally to ensure every dish exceeds expectations.",
    },
    {
      icon: "👨‍🍳",
      title: "Expert Chefs",
      description:
        "Our culinary team brings decades of experience and passion, crafting each dish with precision and creativity.",
    },
    {
      icon: "❤️",
      title: "Customer First",
      description:
        "Your satisfaction is our priority. We listen, adapt, and consistently deliver exceptional dining experiences.",
    },
    {
      icon: "♻️",
      title: "Sustainability",
      description:
        "Committed to eco-friendly practices, from sourcing to packaging, because we care about our planet's future.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-cream-light to-cream">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-dark mb-4">
            Our Core Values
          </h2>
          <p className="text-dark-gray text-xl max-w-2xl mx-auto">
            The principles that guide everything we do, from sourcing
            ingredients to serving our guests
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary/20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-5xl mb-6 transform group-hover:scale-110 transition-transform">
                {value.icon}
              </div>
              <h3 className="font-display text-2xl text-dark mb-3">
                {value.title}
              </h3>
              <p className="text-dark-gray leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
