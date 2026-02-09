import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from '../common/ProductCard';
import { getProductsByCategory } from '../../store/productsData';

const PopularDishes = () => {
  const popularDishes = getProductsByCategory('Popular Dishes');

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-4xl lg:text-5xl">Popular Dishes</h2>
          <div className="flex gap-2">
            <button className="swiper-button-prev-custom w-12 h-12 rounded-full bg-white border-2 border-dark/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all">
              ←
            </button>
            <button className="swiper-button-next-custom w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all">
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
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
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
          {popularDishes.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PopularDishes;
