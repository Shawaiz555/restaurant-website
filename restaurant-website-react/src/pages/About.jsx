import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadCart } from "../store/slices/cartSlice";
import Navbar from "../components/layout/Navbar";
import CartDrawer from "../components/layout/CartDrawer";
import Footer from "../components/layout/Footer";

const About = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    dispatch(loadCart(currentUser?.id));
    window.scrollTo(0, 0);
  }, [dispatch, currentUser]);

  const stats = [
    { icon: "👥", number: "50,000+", label: "Happy Customers" },
    { icon: "⭐", number: "4.9/5", label: "Average Rating" },
    { icon: "🍽️", number: "200+", label: "Menu Items" },
    { icon: "🏆", number: "15+", label: "Years Experience" },
  ];

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

  const timeline = [
    {
      year: "2009",
      title: "The Beginning",
      description:
        "Started as a small family kitchen with a dream to serve authentic, delicious food to our community.",
    },
    {
      year: "2012",
      title: "First Restaurant",
      description:
        "Opened our first brick-and-mortar location, quickly becoming a neighborhood favorite.",
    },
    {
      year: "2016",
      title: "Menu Expansion",
      description:
        "Expanded our menu to include international cuisines, bringing global flavors to our customers.",
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description:
        "Launched online ordering and delivery service, making our food accessible to everyone, anywhere.",
    },
    {
      year: "2024",
      title: "Community Impact",
      description:
        "Proud to serve 50,000+ customers and support local farmers and sustainable practices.",
    },
  ];

  const team = [
    {
      name: "Michael Chen",
      role: "Head Chef",
      image:
        "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop",
      description: "20+ years crafting culinary masterpieces",
    },
    {
      name: "Sarah Martinez",
      role: "Pastry Chef",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
      description: "Award-winning dessert specialist",
    },
    {
      name: "James Anderson",
      role: "Executive Chef",
      image:
        "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop",
      description: "Innovative fusion cuisine expert",
    },
    {
      name: "Emily Wong",
      role: "Sous Chef",
      image:
        "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=400&fit=crop",
      description: "Japanese cuisine specialist",
    },
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
                <span className="text-2xl">📖</span>
                <span className="text-white font-medium text-sm">
                  Our Story
                </span>
              </div>

              <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl text-white mb-6 leading-tight">
                About Bites Restaurant
              </h1>
              <p className="text-white/95 text-xl lg:text-2xl leading-relaxed">
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

        {/* Stats Section */}
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

        {/* Our Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 sm:px-6 lg:px-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block bg-primary/10 px-4 py-2 rounded-full">
                  <span className="text-primary font-semibold">Est. 2009</span>
                </div>
                <h2 className="font-display text-5xl text-dark leading-tight">
                  A Journey of Flavor & Passion
                </h2>
                <div className="space-y-4 text-dark-gray text-lg leading-relaxed">
                  <p>
                    What started as a humble family kitchen has blossomed into a
                    beloved culinary destination. Our journey began with a
                    simple mission: to create memorable dining experiences
                    through exceptional food, warm hospitality, and genuine
                    care.
                  </p>
                  <p>
                    Over 15 years, we've grown from serving our neighborhood to
                    delighting customers across the region. Every dish we create
                    honors our roots while embracing innovation, ensuring each
                    bite is an adventure in taste.
                  </p>
                  <p>
                    Today, we're proud to be more than just a restaurant—we're a
                    community gathering place where families celebrate, friends
                    reconnect, and food lovers discover their new favorites.
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => navigate("/menu")}
                    className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  >
                    View Our Menu
                  </button>
                  <button
                    onClick={() => navigate("/services")}
                    className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-2xl font-semibold hover:bg-primary hover:text-white transition-all hover:scale-105"
                  >
                    Our Services
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-3xl transform rotate-3"></div>
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
                  alt="Restaurant interior"
                  className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
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

        {/* Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-6 sm:px-6 lg:px-16">
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl text-dark mb-4">
                Our Journey
              </h2>
              <p className="text-dark-gray text-xl">
                Milestones that shaped who we are today
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className="relative pl-8 pb-12 border-l-4 border-primary/20 last:pb-0"
                >
                  <div className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full transform -translate-x-[18px] flex items-center justify-center text-white font-bold shadow-lg">
                    ✓
                  </div>
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-primary/10 ml-8">
                    <div className="text-primary font-bold text-xl mb-2">
                      {item.year}
                    </div>
                    <h3 className="font-display text-2xl text-dark mb-3">
                      {item.title}
                    </h3>
                    <p className="text-dark-gray leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="py-20 bg-gradient-to-br from-white via-cream-light to-white">
          <div className="container mx-auto px-6 sm:px-6 lg:px-16">
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl text-dark mb-4">
                Meet Our Culinary Team
              </h2>
              <p className="text-dark-gray text-xl max-w-2xl mx-auto">
                Passionate chefs dedicated to creating extraordinary dining
                experiences
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-display text-2xl text-dark mb-2">
                      {member.name}
                    </h3>
                    <div className="text-primary font-semibold mb-3">
                      {member.role}
                    </div>
                    <p className="text-dark-gray text-sm">
                      {member.description}
                    </p>
                  </div>
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
      </main>

      <Footer />
    </>
  );
};

export default About;
