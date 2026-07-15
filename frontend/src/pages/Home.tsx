import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import AboutSection from "@/components/home/AboutSection";
import Footer from "@/components/layout/Footer";
import { useAuctionsQuery, useAuctionStreamsQuery } from "@/hooks/useAuction";
import {
    List, Grid2X2, Search, Clock, DollarSign, Activity,
    ArrowRight, PlayCircle, Shield, Zap, HeadphonesIcon,
    Trophy, ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/shared/utils/auction.utils";



const AuctionLiveBadge = ({ auctionId, status }: { auctionId: number; status: string }) => {
    const { t } = useTranslation();
    const { data: streams } = useAuctionStreamsQuery(auctionId, status === "LIVE");
    const isActuallyLive = status === "LIVE" && streams?.some((s: any) => s.status === "LIVE");

    if (isActuallyLive) {
        return (
            <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md border border-red-400/50 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {t("home.live_badge")}
            </div>
        );
    }
    return null;
};
const AuctionLiveText = ({ auctionId, status }: { auctionId: number; status: string }) => {
    const { t } = useTranslation();
    const { data: streams } = useAuctionStreamsQuery(auctionId, status === "LIVE");
    const isActuallyLive = status === "LIVE" && streams?.some((s: any) => s.status === "LIVE");

    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isActuallyLive ? "text-red-500" : "text-primary/70"}`}>
            <Activity className="w-3 h-3" />
            {isActuallyLive ? t("home.live_badge") : status === "LIVE" ? t("auctions.scheduled") : status === "SCHEDULED" ? t("auctions.scheduled") : t("auctions.ended")}
        </span>
    );
};
function AuctionCard({ auction, viewType }: { auction: any; viewType: "grid" | "list" }) {
    const { t } = useTranslation();
    const item = auction.item;
    const currentPrice = item.current_price || item.starting_price;

    return (
        <Link
            to={`/auction/${auction.id}`}
            className={`group bg-card border border-border/50 rounded-md overflow-hidden hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 dark:shadow-none transition-all duration-500 flex ${viewType === "list" ? "flex-col sm:flex-row" : "flex-col"}`}
        >
            {/* Image Container */}
            <div className={`${viewType === "list" ? "w-full sm:w-[240px] md:w-[280px] h-[200px] sm:h-auto flex-shrink-0 border-b sm:border-b-0 sm:border-r" : "w-full h-[220px] sm:h-[240px] border-b"} bg-muted relative flex items-center justify-center border-border/50 overflow-hidden`}>
                {item.images?.[0]?.image_url ? (
                    <img src={item.images[0].image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                ) : (
                    <div className="text-muted-foreground font-semibold text-sm p-4 text-center">{t("auctions.no_photo")}</div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 sm:opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

                <AuctionLiveBadge auctionId={auction.id} status={auction.status} />

                {viewType === "grid" && item.category?.name && (
                    <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md border border-border/50 text-[10px] font-bold px-2.5 py-1 rounded-full text-foreground uppercase tracking-wider shadow-sm z-10">
                        {item.category.name}
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <div className="w-14 h-14 bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-lg backdrop-blur-md">
                        {auction.status === "LIVE" ? <PlayCircle className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
                    </div>
                </div>
            </div>

          
                <div className="flex flex-col flex-1">
                    <div className="p-5 flex-1">
                        <h3 className="text-foreground font-black text-base line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug" title={item.title}>{item.title}</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <AuctionLiveText auctionId={auction.id} status={auction.status} />
                            {auction.end_time && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {new Date(auction.end_time).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="px-5 py-4 border-t border-border/50 bg-muted/5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{t("home.current_bid")}</p>
                            <div className="text-lg font-black text-primary tracking-tight">
                                {formatCurrency(currentPrice)}
                            </div>
                        </div>
                        <div className="bg-background border border-border text-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-sm group-hover:shadow-md">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            
        </Link>
    );
}


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
            
            <section className="w-full bg-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-20">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                        <div className="max-w-xl">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-primary-foreground mb-3">{t("home.cta_title")}</h2>
                            <p className="text-sm sm:text-base text-primary-foreground/80 font-medium">{t("home.cta_desc")}</p>
                        </div>
                        <Link
                            to="/signup"
                            className="bg-white hover:bg-white/90 text-primary px-8 py-3.5 rounded-md text-sm font-bold transition-all shadow-lg uppercase tracking-wider flex items-center gap-2 flex-shrink-0"
                        >
                            {t("home.cta_button")}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
