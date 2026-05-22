
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/layout/Hero";
import AuctionSection from "@/components/layout/Auction";
import FeaturesBar from "@/components/layout/FeaturesBar";
import NewAuctionsSection from "@/components/layout/NewAuctions";

export default function Home() {
  return (
    <div className="bg-white flex-1">
      <Header />

      <main className="">
        <HeroSection />
        <AuctionSection />
        <div className="bg-gray-100" >
          <AuctionSection />
        </div>
        <NewAuctionsSection />
        <FeaturesBar />
        <Footer />
      </main>
    </div>
  );
}
