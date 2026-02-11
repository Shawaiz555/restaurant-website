import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadCart } from "../store/slices/cartSlice";
import Navbar from "../components/layout/Navbar";
import CartDrawer from "../components/layout/CartDrawer";
import Footer from "../components/layout/Footer";

const Services = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    dispatch(loadCart(currentUser?.id));
    window.scrollTo(0, 0);
  }, [dispatch, currentUser]);

  const mainServices = [
    {
      icon: "🚚",
      title: "Fast Delivery",
      description: "Get your favorite meals delivered hot and fresh to your doorstep within 30-45 minutes.",
      features: [
        "Real-time order tracking",
        "GPS-enabled delivery",
        "Contactless delivery option",
        "Temperature-controlled packaging"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "🍽️",
      title: "Dine-In Experience",
      description: "Enjoy our warm ambiance and exceptional service in our beautifully designed restaurant space.",
      features: [
        "Comfortable seating arrangements",
        "Family-friendly atmosphere",
        "Free Wi-Fi access",
        "Live music on weekends"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "📦",
      title: "Takeaway Service",
      description: "Pre-order your meals and pick them up at your convenience—skip the wait, enjoy the taste.",
      features: [
        "Quick pickup service",
        "Pre-order scheduling",
        "Eco-friendly packaging",
        "Special discounts"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: "🎉",
      title: "Event Catering",
      description: "Make your special occasions unforgettable with our professional catering services.",
      features: [
        "Custom menu planning",
        "Professional staff",
        "Event setup & decoration",
        "Serving equipment provided"
      ],
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: "👨‍🍳",
      title: "Private Chef",
      description: "Bring restaurant-quality dining to your home with our private chef service.",
      features: [
        "Personalized menu consultation",
        "Professional chef at your location",
        "Fresh ingredient sourcing",
        "Complete meal preparation"
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: "🎓",
      title: "Cooking Classes",
      description: "Learn from our expert chefs and master the art of cooking your favorite dishes.",
      features: [
        "Hands-on training",
        "Small group sessions",
        "Recipe booklets included",
        "Certificate of completion"
      ],
      color: "from-red-500 to-red-600"
    }
  ];

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

  const benefits = [
    { icon: "⚡", title: "Quick Service", description: "Fast order processing and delivery" },
    { icon: "🏅", title: "Quality Assured", description: "100% satisfaction guaranteed" },
    { icon: "💳", title: "Secure Payment", description: "Multiple payment options available" },
    { icon: "🔄", title: "Easy Returns", description: "Hassle-free refund policy" },
    { icon: "📞", title: "24/7 Support", description: "Always here to help you" },
    { icon: "🎁", title: "Loyalty Rewards", description: "Earn points with every order" }
  ];

  const process = [
    { step: "1", title: "Browse Menu", description: "Explore our extensive menu and select your favorites", icon: "📋" },
    { step: "2", title: "Place Order", description: "Add items to cart and proceed to checkout", icon: "🛒" },
    { step: "3", title: "We Prepare", description: "Our chefs prepare your order with care", icon: "👨‍🍳" },
    { step: "4", title: "Delivery/Pickup", description: "Get it delivered or pick it up fresh", icon: "🚗" }
  ];

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-gradient-to-br from-cream-light via-white to-cream-light pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary via-primary to-primary-dark py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 sm:px-6 lg:px-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6 border border-white/30">
                <span className="text-2xl">✨</span>
                <span className="text-white font-medium text-sm">What We Offer</span>
              </div>

              <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl text-white mb-6 leading-tight">
                Our Services
              </h1>
              <p className="text-white/95 text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
                From dine-in excellence to doorstep delivery, we offer comprehensive services designed to make every meal memorable
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-16 fill-current text-cream-light" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </section>

        {/* Main Services */}
        <section className="py-20">
          <div className="container mx-auto px-6 sm:px-6 lg:px-16">
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl text-dark mb-4">Core Services</h2>
              <p className="text-dark-gray text-xl max-w-2xl mx-auto">
                Comprehensive solutions tailored to your dining needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainServices.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary/20"
                >
                  <div className={`bg-gradient-to-r ${service.color} p-8 text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="text-7xl mb-4">{service.icon}</div>
                      <h3 className="font-display text-3xl text-white">{service.title}</h3>
                    </div>
                  </div>

                  <div className="p-8">
                    <p className="text-dark-gray text-lg mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-sm">✓</span>
                          </div>
                          <span className="text-dark text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full mt-6 bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
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

        {/* Special Services */}
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

        {/* Benefits */}
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

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 sm:px-6 lg:px-16">
            <div className="bg-gradient-to-r from-primary via-primary to-primary-dark rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
                  Experience the convenience and quality of our services today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/menu')}
                    className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  >
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
      </main>

      <Footer />
    </>
  );
};

export default Services;
