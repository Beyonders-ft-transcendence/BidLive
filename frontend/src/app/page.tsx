
import Header from "@/components/layout/Header";
import HeroSection from "@/components/layout/Hero";

export default function Home() {
  return (
    <div className="bg-gray-50 flex-1">
      <Header />

      <main className="max-w-7xl mx-auto">
        <HeroSection />
        <div className="grid grid-cols-3 " >
          <div>

          </div>
          <div>

          </div>
          <div>

          </div>
        </div>
      </main>
    </div>
  );
}
