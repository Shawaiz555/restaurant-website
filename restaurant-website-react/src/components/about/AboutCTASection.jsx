import React from "react";

const AboutCTASection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="bg-gradient-to-r from-primary via-primary to-primary-dark rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover why Bites
              is more than just a restaurant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                Order Now
              </button>
              <button className="bg-primary-dark text-white border-2 border-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-primary transition-all hover:scale-105">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTASection;
