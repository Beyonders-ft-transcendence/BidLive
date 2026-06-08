import Header from "@/components/layout/Header";
import Hero from "@/components/layout/home/Hero";
import AboutSection from "@/components/layout/home/About";
import HowItWorksSection from "@/components/layout/home/HowItWorksSection";
import LiveAuctionsSection from "@/components/layout/home/LiveAuctionsSection";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <AboutSection />
      <HowItWorksSection />
      <LiveAuctionsSection />
    </main>
  );
}