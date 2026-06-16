import HomeHeader from "@/components/layout/home/HomeHeader";
import Hero from "@/components/layout/home/Hero";
import AboutSection from "@/components/layout/home/About";
import HowItWorksSection from "@/components/layout/home/HowItWorksSection";
import LiveAuctionsSection from "@/components/layout/home/LiveAuctionsSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <HomeHeader />
      <Hero />
      <AboutSection />
      <HowItWorksSection />
      <LiveAuctionsSection />
      <Footer />
    </main>
  );
}