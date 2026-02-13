import React from "react";

const AboutHeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-cream-dark via-cream-hero to-cream-darker py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary-dark rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-primary-dark rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 sm:px-6 lg:px-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-dark/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6 border border-primary-dark/30">
            <span className="text-2xl">📖</span>
            <span className="text-black font-medium text-sm">Our Story</span>
          </div>

          <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl text-primary mb-6 leading-tight">
            About Bites Restaurant
          </h1>
          <p className="text-primary-dark text-xl lg:text-2xl leading-relaxed">
            Where passion meets flavor, and every meal tells a story of
            tradition, innovation, and love for great food.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 fill-current text-cream-light"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default AboutHeroSection;
