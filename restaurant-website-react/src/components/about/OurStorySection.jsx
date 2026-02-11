import React from "react";
import { useNavigate } from "react-router-dom";

const OurStorySection = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default OurStorySection;
