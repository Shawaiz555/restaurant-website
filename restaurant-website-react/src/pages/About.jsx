import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCart } from "../store/slices/cartSlice";
import Navbar from "../components/layout/Navbar";
import CartDrawer from "../components/layout/CartDrawer";
import Footer from "../components/layout/Footer";
import AboutHeroSection from "../components/about/AboutHeroSection";
import StatsSection from "../components/about/StatsSection";
import OurStorySection from "../components/about/OurStorySection";
import ValuesSection from "../components/about/ValuesSection";
import TimelineSection from "../components/about/TimelineSection";
import TeamSection from "../components/about/TeamSection";
import AboutCTASection from "../components/about/AboutCTASection";

const About = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    dispatch(loadCart(currentUser?.id));
    window.scrollTo(0, 0);
  }, [dispatch, currentUser]);

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-gradient-to-br from-cream-light via-white to-cream-light pt-20">
        <AboutHeroSection />
        <StatsSection />
        <OurStorySection />
        <ValuesSection />
        <TimelineSection />
        <TeamSection />
        <AboutCTASection />
      </main>

      <Footer />
    </>
  );
};

export default About;
