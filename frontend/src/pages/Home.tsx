import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FAQSection from "@/components/home/FAQSection";
import AboutSection from "@/components/home/AboutSection";
import Footer from "@/components/layout/Footer";
import { useAuctionsQuery } from "@/hooks/useAuction";
import {
    List, Grid2X2, Search, ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";


import AuctionCard from "@/components/home/AuctionCard";


export default function HomePage() {
    const { t } = useTranslation();
    useDocumentTitle(t("home.title"));

    const [viewType, setViewType] = useState<"grid" | "list">("grid");

    const { data: liveAuctionsData, isLoading: isLoadingLive } = useAuctionsQuery({
        status: "LIVE",
        page_size: 6,
        ordering: "-created_at",
    });

    const { data: featuredData, isLoading: isLoadingFeatured } = useAuctionsQuery({
        is_featured: true,
        page_size: 6,
    });

    const liveAuctions = liveAuctionsData?.results || [];
    const featuredAuctions = featuredData?.results || [];
    const displayAuctions = liveAuctions.length > 0 ? liveAuctions : featuredAuctions;
    const isLoading = isLoadingLive || isLoadingFeatured;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
            <Header />
            <Hero />
            <AboutSection />
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{t("home.active_auctions_title")}</h2>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{t("home.active_auctions_desc")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 border border-border/80 rounded-md p-1 bg-muted/30">
                            <button onClick={() => setViewType("list")} className={`p-1.5 rounded-md transition-all ${viewType === "list" ? "text-primary bg-background shadow-sm" : "text-muted-foreground hover:bg-muted/80"}`} title={t("auctions.view_list")}>
                                <List className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewType("grid")} className={`p-1.5 rounded-md transition-all ${viewType === "grid" ? "text-primary bg-background shadow-sm" : "text-muted-foreground hover:bg-muted/80"}`} title={t("auctions.view_grid")}>
                                <Grid2X2 className="w-4 h-4" />
                            </button>
                        </div>
                        <Link
                            to="/leiloes"
                            className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            {t("home.view_all_auctions")}
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="font-bold tracking-wider uppercase text-xs">{t("auctions.fetching")}</span>
                    </div>
                ) : displayAuctions.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-card border border-dashed border-border/80 rounded-md px-6">
                        <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-bold text-foreground mb-1">{t("home.no_auctions_live")}</h3>
                        <Link to="/leiloes" className="mt-4 px-6 py-2.5 bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/20 transition-colors">
                            {t("home.explore_auctions")}
                        </Link>
                    </div>
                ) : (
                    <div className={viewType === "list" ? "space-y-4 sm:space-y-5" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"}>
                        {displayAuctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} viewType={viewType} />
                        ))}
                    </div>
                )}
            </section>
            <HowItWorksSection />
            <FAQSection />
            
            <Footer />
        </div>
    );
}
