import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import HeroSection from "../components/home/HeroSection";
import PopularDishes from "../components/home/PopularDishes";
import ServicesSection from "../components/home/ServicesSection";
import MenuSection from "../components/home/MenuSection";
import ReviewsSection from "../components/home/ReviewsSection";
import ChefsSection from "../components/home/ChefsSection";
import MobileAppSection from "../components/home/MobileAppSection";
import FAQSection from "../components/home/FAQSection";

const Home = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Redirect admin users to admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, navigate]);

  return (
    <>
      <main className="pt-10">
        <HeroSection />
        <PopularDishes />
        <ServicesSection />
        <MenuSection />
        <ReviewsSection />
        <ChefsSection />
        <MobileAppSection />
        <FAQSection />
      </main>
    </>
  );
};

export default Home;
