import Header from "@/components/layout/Header";
import Hero from "@/components/layout/home/Hero";
import AboutSection from "@/components/layout/home/About";
import HowItWorksSection from "@/components/layout/home/HowItWorksSection";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <AboutSection />
      <HowItWorksSection />
    </main>
  );
}