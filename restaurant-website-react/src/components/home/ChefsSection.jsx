import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const ChefsSection = () => {
  const chefs = [
    {
      name: 'Savannah Nayaan',
      image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=500&fit=crop',
    },
    {
      name: 'Esther Howard',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=500&fit=crop',
    },
    {
      name: 'Dancia Andrewsy',
      image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=500&fit=crop',
    },
    {
      name: 'Albert Flores',
      image: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=500&fit=crop',
    },
    {
      name: 'Esther Howard',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=500&fit=crop',
    },
    {
      name: 'Dancia Andrewsy',
      image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=500&fit=crop',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white" id="chefs">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-4xl lg:text-5xl">Meet Our Chefs</h2>
          <div className="flex gap-2">
            <button className="swiper-button-prev-chefs w-12 h-12 rounded-full bg-cream border-2 border-dark/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all">
              ←
            </button>
            <button className="swiper-button-next-chefs w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all">
              →
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: '.swiper-button-next-chefs',
            prevEl: '.swiper-button-prev-chefs',
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
          }}
          className="pb-8"
        >
          {chefs.map((chef, idx) => (
            <SwiperSlide key={idx}>
              <div className="text-center group">
                <div className="relative mb-6 overflow-hidden rounded-3xl">
                  <img
                    src={chef.image}
                    alt={chef.name}
                    className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-display text-2xl mb-2">{chef.name}</h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ChefsSection;
