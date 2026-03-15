import React, { useEffect } from "react";
import ServicesHeroSection from "../../components/services/ServicesHeroSection";
import CoreServicesSection from "../../components/services/CoreServicesSection";
import HowItWorksSection from "../../components/services/HowItWorksSection";
import SpecialServicesSection from "../../components/services/SpecialServicesSection";
import BenefitsSection from "../../components/services/BenefitsSection";
import ServicesCTASection from "../../components/services/ServicesCTASection";

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-cream-light via-white to-cream-light pt-20">
        <ServicesHeroSection />
        <CoreServicesSection />
        <HowItWorksSection />
        <SpecialServicesSection />
        <BenefitsSection />
        <ServicesCTASection />
      </main>
    </>
  );
};

export default Services;
