import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCart } from "../store/slices/cartSlice";
import Navbar from "../components/layout/Navbar";
import CartDrawer from "../components/layout/CartDrawer";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/home/HeroSection";
import PopularDishes from "../components/home/PopularDishes";
import ServicesSection from "../components/home/ServicesSection";
import MenuSection from "../components/home/MenuSection";
import ReviewsSection from "../components/home/ReviewsSection";
import ChefsSection from "../components/home/ChefsSection";
import MobileAppSection from "../components/home/MobileAppSection";
import FAQSection from "../components/home/FAQSection";

const Home = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    // Load cart when component mounts
    dispatch(loadCart(currentUser?.id));
  }, [dispatch, currentUser]);

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="pt-10">
        <HeroSection />
        <PopularDishes />
        <ServicesSection />
        <MenuSection />
        <ReviewsSection />
        <ChefsSection />
        <FAQSection />
        <MobileAppSection />
      </main>

      <Footer />
    </>
  );
};

export default Home;
