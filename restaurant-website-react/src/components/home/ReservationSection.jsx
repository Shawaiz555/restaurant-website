import React from 'react';

const ReservationSection = () => {
  return (
    <section className="py-12 lg:py-24 bg-white">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6">
              Do You Have Any Dinner Plan Today? Reserve Your Table
            </h2>
            <p className="text-dark-gray text-lg mb-8">
              Make online reservations, read restaurant reviews from diners, and
              earn points towards free meals. Open Table is a real-time online
              reservation.
            </p>
            <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full border-primary border-2 font-medium transition-all shadow-lg hover:shadow-xl">
              Book a Table
            </button>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src="/assets/images/FoodSideImg.png"
                alt="Delicious Food"
                className="rounded-full w-full max-w-xl mx-auto shadow-2xl"
              />
            </div>

            {/* Decorative Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cream -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReservationSection;
