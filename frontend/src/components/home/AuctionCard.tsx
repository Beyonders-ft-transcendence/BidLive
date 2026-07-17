import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, DollarSign, Activity, ArrowRight, PlayCircle } from "lucide-react";
import { formatCurrency } from "@/shared/utils/auction.utils";
import { useAuctionStreamsQuery } from "@/hooks/useAuction";

const AuctionLiveBadge = ({ auctionId, status }: { auctionId: number; status: string }) => {
    const { t } = useTranslation();
    const { data: streams } = useAuctionStreamsQuery(auctionId, status === "LIVE");
    const isActuallyLive = status === "LIVE" && streams?.some((s: any) => s.status === "LIVE");

    if (isActuallyLive) {
        return (
            <div className="absolute top-4 left-4 bg-red-500/95 backdrop-blur-md border border-red-400/50 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-sm" />
                {t("home.live_badge", "Ao Vivo")}
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
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${isActuallyLive ? "text-red-500" : "text-primary/80"}`}>
            <Activity className="w-3.5 h-3.5" />
            {isActuallyLive ? t("home.live_badge", "Ao Vivo") : status === "LIVE" ? t("auctions.scheduled", "Agendado") : status === "SCHEDULED" ? t("auctions.scheduled", "Agendado") : t("auctions.ended", "Encerrado")}
        </span>
    );
};

export default function AuctionCard({ auction, viewType }: { auction: any; viewType: "grid" | "list" }) {
    const { t } = useTranslation();
    const item = auction.item;
    const currentPrice = item.current_price || item.starting_price;

    return (
        <Link
            to={`/auction/${auction.id}`}
            className={`group bg-card border border-border/40 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 flex ${viewType === "list" ? "flex-col sm:flex-row" : "flex-col"}`}
        >
            {/* Image Container */}
            <div className={`${viewType === "list" ? "w-full sm:w-[260px] md:w-[300px] h-[220px] sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r" : "w-full h-[240px] sm:h-[260px] border-b"} border-border/40 bg-muted/30 relative flex items-center justify-center overflow-hidden`}>
                {item.images?.[0]?.image_url ? (
                    <img src={item.images[0].image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                ) : (
                    <div className="text-muted-foreground/60 font-semibold text-sm p-4 text-center">{t("auctions.no_photo", "Sem Fotografia")}</div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 sm:opacity-40 group-hover:opacity-70 transition-opacity duration-500" />

                <AuctionLiveBadge auctionId={auction.id} status={auction.status} />

                {viewType === "grid" && item.category?.name && (
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md border border-border/40 text-[10px] font-bold px-3 py-1.5 rounded-full text-foreground uppercase tracking-widest shadow-md z-10">
                        {item.category.name}
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
                    <div className="w-16 h-16 bg-primary/95 text-primary-foreground rounded-full flex items-center justify-center shadow-xl shadow-primary/30 backdrop-blur-md">
                        {auction.status === "LIVE" ? <PlayCircle className="w-7 h-7" strokeWidth={2.5} /> : <ArrowRight className="w-7 h-7" strokeWidth={2.5} />}
                    </div>
                </div>
            </div>

            {viewType === "list" ? (
                <>
                    <div className="flex-1 min-w-0 p-6 sm:p-7 flex flex-col justify-between bg-card">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <h3 className="text-foreground font-black text-xl line-clamp-2 group-hover:text-primary transition-colors leading-tight" title={item.title}>{item.title}</h3>
                                {item.category?.name && (
                                    <span className="hidden sm:inline-flex shrink-0 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">{item.category.name}</span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4 max-w-2xl">
                                {item.description || t("auctions.no_description", "Sem descrição disponível.")}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-5 sm:gap-6 pt-5 border-t border-border/40">
                            <AuctionLiveText auctionId={auction.id} status={auction.status} />
                            {auction.end_time && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    {new Date(auction.end_time).toLocaleDateString()}
                                </span>
                            )}
                            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                <DollarSign className="w-4 h-4" />
                                {t("home.min_bid", "Lance Mínimo:")} {formatCurrency(item.starting_price)}
                            </span>
                        </div>
                    </div>
                    <div className="shrink-0 p-6 sm:p-7 sm:border-l border-t sm:border-t-0 border-border/40 flex flex-col justify-center items-center bg-muted/10 w-full sm:w-[220px] xl:w-[260px] group-hover:bg-primary/5 transition-colors duration-500">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("home.current_bid", "Lance Atual")}</p>
                        <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-1 group-hover:text-primary transition-colors">
                            {formatCurrency(currentPrice)}
                        </div>
                        <div className="mt-5 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-primary/20 flex items-center justify-center gap-2">
                            {t("home.enter_auction", "Ver Leilão")} <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col flex-1 bg-card">
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-foreground font-black text-lg line-clamp-2 mb-4 group-hover:text-primary transition-colors leading-tight" title={item.title}>{item.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-auto">
                            <AuctionLiveText auctionId={auction.id} status={auction.status} />
                            {auction.end_time && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(auction.end_time).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="px-6 py-5 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-4 group-hover:bg-primary/5 transition-colors duration-500">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t("home.current_bid", "Lance Atual")}</p>
                            <div className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                                {formatCurrency(currentPrice)}
                            </div>
                        </div>
                        <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 shadow-sm group-hover:shadow-md group-hover:shadow-primary/20">
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            )}
        </Link>
    );
}
