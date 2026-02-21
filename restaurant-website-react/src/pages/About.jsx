import AboutHeroSection from "../components/about/AboutHeroSection";
import OurStorySection from "../components/about/OurStorySection";
import ValuesSection from "../components/about/ValuesSection";
import TimelineSection from "../components/about/TimelineSection";
import TeamSection from "../components/about/TeamSection";
import AboutCTASection from "../components/about/AboutCTASection";

const About = () => {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-cream-light via-white to-cream-light pt-20">
        <AboutHeroSection />
        <OurStorySection />
        <ValuesSection />
        <TimelineSection />
        <TeamSection />
        <AboutCTASection />
      </main>
    </>
  );
};

export default About;
