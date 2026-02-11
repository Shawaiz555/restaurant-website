import React from "react";

const StatsSection = () => {
  const stats = [
    { icon: "👥", number: "50,000+", label: "Happy Customers" },
    { icon: "⭐", number: "4.9/5", label: "Average Rating" },
    { icon: "🍽️", number: "200+", label: "Menu Items" },
    { icon: "🏆", number: "15+", label: "Years Experience" },
  ];

  return (
    <section className="py-12 -mt-8">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-primary/10 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-3xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl md:text-5xl mb-4">{stat.icon}</div>
              <div className="text-xl md:text-4xl font-display bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-dark-gray font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
