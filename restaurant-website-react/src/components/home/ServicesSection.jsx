import React from "react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
  const services = [
    { emoji: "📦", title: "Online Order" },
    { emoji: "📅", title: "Pre-Reservation" },
    { emoji: "⏰", title: "24/7 Service" },
    { emoji: "🏢", title: "Organized Foodie Place" },
    { emoji: "🧹", title: "Clean Kitchen" },
    { emoji: "👨‍🍳", title: "Super Chefs" },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white" id="services">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Chef Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=600&fit=crop"
                alt="Chef"
                className="rounded-full w-full max-w-xl mx-auto shadow-2xl"
              />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="font-display text-4xl lg:text-5xl mb-6">
              We Are More Than Multiple Service
            </h2>
            <p className="text-dark-gray text-lg mb-8">
              This is a type of restaurant which typically serves food and
              drinks, in addition to light refreshments such as baked goods or
              snacks. The term comes from the ranch word meaning food.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {services.map((service, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-primary text-2xl mt-1">
                    {service.emoji}
                  </span>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      {service.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/about">
              <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
                About Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
