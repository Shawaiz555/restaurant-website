import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const ReviewsSection = () => {
  const reviews = [
    {
      text: "This place is great! Atmosphere and staff are great. I had a great meal here. I recommend the chicken gyro with french fries and the greek salad. Seriously, what they're doing with food is really amazing and what's even more amazing is they're doing all of this with only plant-based ingredients.",
      name: 'Shawoawn Nayaan',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    {
      text: "This place is great! Atmosphere and staff are great. I had a great meal here. I recommend the chicken gyro with french fries and the greek salad. Seriously, what they're doing with food is really amazing and what's even more amazing is they're doing all of this with only plant-based ingredients.",
      name: 'Shawoawn Nayaan',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    {
      text: "This place is great! Atmosphere and staff are great. I had a great meal here. I recommend the chicken gyro with french fries and the greek salad. Seriously, what they're doing with food is really amazing and what's even more amazing is they're doing all of this with only plant-based ingredients.",
      name: 'Shawoawn Nayaan',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    {
      text: "This place is great! Atmosphere and staff are great. I had a great meal here. I recommend the chicken gyro with french fries and the greek salad. Seriously, what they're doing with food is really amazing and what's even more amazing is they're doing all of this with only plant-based ingredients.",
      name: 'Shawoawn Nayaan',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
  ];

  return (
    <section id="reviews" className="py-16 lg:py-24">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-4xl lg:text-5xl">
            What Our Customer Says?
          </h2>
          <div className="flex gap-2">
            <button className="swiper-button-prev-reviews w-12 h-12 rounded-full bg-white border-2 border-dark/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all">
              ←
            </button>
            <button className="swiper-button-next-reviews w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all">
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
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: '.swiper-button-next-reviews',
            prevEl: '.swiper-button-prev-reviews',
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="pb-8"
        >
          {reviews.map((review, idx) => (
            <SwiperSlide key={idx}>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <p className="text-dark-gray text-lg mb-6 leading-relaxed">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{review.name}</h4>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-primary text-sm">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ReviewsSection;
