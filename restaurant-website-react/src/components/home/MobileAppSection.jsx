import React from 'react';

const MobileAppSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl lg:text-5xl mb-6">
              Never Feel Hungry! Download Our Mobile App Enjoy Delicious Foods
            </h2>
            <p className="text-dark-gray text-lg mb-8">
              Get your favourite food delivered right to your doorstep. Download
              our app and explore thousands of delicious dishes from the best
              restaurants.
            </p>
            <div className="flex flex-col lg:flex-row gap-5">
              <div className="flex justify-center lg:justify-start">
                <button className="bg-dark hover:bg-dark-gray text-white px-8 py-4 rounded-2xl font-medium transition-all flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </button>
              </div>
              <div className="flex justify-center lg:justify-start">
                <button className="bg-dark hover:bg-dark-gray text-white px-8 py-4 rounded-2xl font-medium transition-all flex items-center gap-3">
                  <span className="text-2xl">▶️</span>
                  <div className="text-left">
                    <div className="text-xs opacity-80">GET IT ON</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 flex justify-center">
              <div className="w-74 h-84 bg-white rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-cream rounded-[2.5rem] overflow-hidden">
                  <div className="bg-primary text-white p-6 text-center">
                    <h3 className="font-display text-2xl mb-2">
                      We Serve The Test You Love
                    </h3>
                    <p className="text-sm opacity-90">
                      Order your favorite food now!
                    </p>
                  </div>
                  <div className="p-2">
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
                      alt="Food"
                      className="w-full h-full max-w-md rounded-2xl mb-4"
                    />
                    <div className="flex gap-2 mb-4">
                      <button className="flex-1 bg-primary text-white py-3 rounded-full text-sm font-medium">
                        Order Now
                      </button>
                      <button className="flex-1 bg-cream text-dark py-3 rounded-full text-sm font-medium">
                        View Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;
