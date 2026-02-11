import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCart } from "../store/slices/cartSlice";
import Navbar from "../components/layout/Navbar";
import CartDrawer from "../components/layout/CartDrawer";
import Footer from "../components/layout/Footer";
import ServicesHeroSection from "../components/services/ServicesHeroSection";
import CoreServicesSection from "../components/services/CoreServicesSection";
import HowItWorksSection from "../components/services/HowItWorksSection";
import SpecialServicesSection from "../components/services/SpecialServicesSection";
import BenefitsSection from "../components/services/BenefitsSection";
import ServicesCTASection from "../components/services/ServicesCTASection";

const Services = () => {
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
        <ServicesHeroSection />
        <CoreServicesSection />
        <HowItWorksSection />
        <SpecialServicesSection />
        <BenefitsSection />
        <ServicesCTASection />
      </main>

      <Footer />
    </>
  );
};

export default Services;
