import HeroSection from "../components/home/HeroSection";
import PopularDishes from "../components/home/PopularDishes";
import ServicesSection from "../components/home/ServicesSection";
import MenuSection from "../components/home/MenuSection";
import ReviewsSection from "../components/home/ReviewsSection";
import ChefsSection from "../components/home/ChefsSection";
import MobileAppSection from "../components/home/MobileAppSection";
import FAQSection from "../components/home/FAQSection";

const Home = () => {
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
