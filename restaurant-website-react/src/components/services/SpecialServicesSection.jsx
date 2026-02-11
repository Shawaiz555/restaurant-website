import React from "react";

const SpecialServicesSection = () => {
  const specialServices = [
    {
      icon: "💼",
      title: "Corporate Catering",
      description: "Professional catering solutions for business meetings, conferences, and corporate events.",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop"
    },
    {
      icon: "💝",
      title: "Gift Vouchers",
      description: "Give the gift of great food with our customizable restaurant gift vouchers.",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&h=600&fit=crop"
    },
    {
      icon: "📱",
      title: "Mobile App",
      description: "Order seamlessly through our user-friendly mobile app with exclusive app-only deals.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl text-dark mb-4">Special Services</h2>
          <p className="text-dark-gray text-xl">Exclusive offerings for enhanced experiences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {specialServices.map((service, index) => (
            <div
              key={index}
              className="group relative rounded-3xl overflow-hidden shadow-2xl h-96 transform hover:scale-105 transition-all duration-500"
            >
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="text-6xl mb-4">{service.icon}</div>
                <h3 className="font-display text-3xl text-white mb-3">{service.title}</h3>
                <p className="text-white/90 text-lg mb-4">{service.description}</p>
                <button className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all w-fit">
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialServicesSection;
