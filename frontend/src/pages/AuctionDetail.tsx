import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import {
    ChevronRight, Clock, Calendar, Activity, DollarSign,
    Users, Tag, ChevronLeft, ChevronRight as ChevronRightIcon,
    Gavel, ShoppingCart, AlertCircle, CheckCircle2, Eye
} from "lucide-react";
import type { Auction, Bid } from "@/shared/types/auction.types";

// Condition label map
const conditionLabels: Record<string, string> = {
    NEW: "Novo",
    USED: "Usado",
    REFURBISHED: "Recondicionado",
    DAMAGED: "Com Defeito",
};

// Status config
function getStatusConfig(status: string) {
    switch (status) {
        case "LIVE": return { label: "Ao Vivo", color: "bg-red-500 text-white", pulse: true };
        case "SCHEDULED": return { label: "Agendado", color: "bg-blue-500 text-white", pulse: false };
        case "ENDED": return { label: "Encerrado", color: "bg-muted text-muted-foreground", pulse: false };
        case "SOLD": return { label: "Vendido", color: "bg-green-500 text-white", pulse: false };
        case "CANCELLED": return { label: "Cancelado", color: "bg-destructive text-destructive-foreground", pulse: false };
        default: return { label: status, color: "bg-muted text-muted-foreground", pulse: false };
    }
}

function formatDate(iso: string | null | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-AO", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function formatPrice(val: string | number | null | undefined) {
    if (!val) return "—";
    const n = Number(val);
    return isNaN(n) ? String(val) : n.toLocaleString("pt-AO");
}

// Countdown hook
function useCountdown(endTime: string | null | undefined) {
    const [now, setNow] = useState(() => Date.now());
    if (!endTime) return null;
    const end = new Date(endTime).getTime();
    const diff = end - now;
    if (diff <= 0) return null;

    const totalSeconds = Math.floor(diff / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    // Update every second
    setTimeout(() => setNow(Date.now()), 1000);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function AuctionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const auctionId = Number(id);

    const {
        auction,
        bids,
        loading,
        error,
        bidAmount,
        setBidAmount,
        submittingBid,
        placeBid,
        buyNow,
        submittingBuyNow,
        viewerCount,
    } = useAuctionRealtime(auctionId);

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [bidError, setBidError] = useState<string | null>(null);
    const [bidSuccess, setBidSuccess] = useState(false);

    const countdown = useCountdown(auction?.end_time);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
                            <Gavel className="w-6 h-6 text-primary opacity-50" />
                        </div>
                        <p className="text-muted-foreground">A carregar leilão...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !auction) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center space-y-4 max-w-sm">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                        <h2 className="text-xl font-semibold">Leilão não encontrado</h2>
                        <p className="text-muted-foreground text-sm">{error || "Este leilão não existe ou foi removido."}</p>
                        <Link to="/leiloes" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
                            Ver todos os Leilões
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const item = auction.item;
    const images = item.images || [];
    const statusConfig = getStatusConfig(auction.status);
    const currentPrice = item.current_price || item.starting_price;
    const isLive = auction.status === "LIVE";
    const isEnded = auction.status === "ENDED" || auction.status === "SOLD" || auction.status === "CANCELLED";

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault();
        setBidError(null);
        setBidSuccess(false);
        try {
            await placeBid();
            setBidSuccess(true);
            setTimeout(() => setBidSuccess(false), 3000);
        } catch (err: any) {
            setBidError(err?.message || "Erro ao registrar lance.");
        }
    };

    const handleBuyNow = async () => {
        setBidError(null);
        const result = await buyNow();
        if (!result?.success) {
            setBidError(result?.message || "Erro ao realizar compra imediata.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <Header />

            {/* Breadcrumb */}
            <div className="w-full bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-1 text-sm text-muted-foreground">
                    <Link to="/" className="text-primary hover:underline">Início</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link to="/leiloes" className="text-primary hover:underline">Leilões</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-foreground font-medium truncate max-w-[200px]">{item.title}</span>
                </div>
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* === LEFT: Images + Info === */}
                    <div className="flex-1 min-w-0 space-y-5">

                        {/* Image Gallery */}
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm dark:shadow-none">
                            {/* Main Image */}
                            <div className="relative bg-muted/30 flex items-center justify-center h-[260px] sm:h-[360px] md:h-[420px]">
                                {images.length > 0 ? (
                                    <img
                                        src={images[activeImageIndex]?.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-contain p-4"
                                    />
                                ) : (
                                    <div className="text-muted-foreground text-sm">Sem imagem disponível</div>
                                )}
                                {/* Status badge */}
                                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusConfig.color}`}>
                                    {statusConfig.pulse && <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />}
                                    {statusConfig.label}
                                </div>
                                {/* Viewer count */}
                                {viewerCount > 0 && (
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md">
                                        <Eye className="w-3.5 h-3.5" /> {viewerCount}
                                    </div>
                                )}
                                {/* Prev/Next arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImageIndex(i => Math.max(0, i - 1))}
                                            disabled={activeImageIndex === 0}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border border-border rounded-full p-1.5 transition-colors disabled:opacity-30"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setActiveImageIndex(i => Math.min(images.length - 1, i + 1))}
                                            disabled={activeImageIndex === images.length - 1}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border border-border rounded-full p-1.5 transition-colors disabled:opacity-30"
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto bg-muted/10 border-t border-border">
                                    {images.map((img, i) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImageIndex(i)}
                                            className={`flex-shrink-0 w-14 h-14 rounded border-2 overflow-hidden transition-all ${activeImageIndex === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                                        >
                                            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Item Info */}
                        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm dark:shadow-none space-y-4">
                            <div>
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{item.title}</h1>
                                    {item.category?.name && (
                                        <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                                            <Tag className="w-3 h-3" /> {item.category.name}
                                        </span>
                                    )}
                                </div>
                                {item.condition_type && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Condição: <span className="font-medium text-foreground">{conditionLabels[item.condition_type] || item.condition_type}</span>
                                    </p>
                                )}
                            </div>

                            {item.description && (
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-2">Descrição</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            )}

                            {/* Details grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border pt-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><Calendar className="w-3 h-3" /> Início</span>
                                    <span className="text-sm font-medium text-foreground">{formatDate(auction.start_time)}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Término</span>
                                    <span className="text-sm font-medium text-foreground">{formatDate(auction.end_time)}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><Activity className="w-3 h-3" /> Status</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block w-fit ${statusConfig.color}`}>{statusConfig.label}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><DollarSign className="w-3 h-3" /> Lance Mínimo</span>
                                    <span className="text-sm font-medium text-foreground">{formatPrice(item.starting_price)} Kz</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><Gavel className="w-3 h-3" /> Incremento</span>
                                    <span className="text-sm font-medium text-foreground">{formatPrice(item.minimum_increment)} Kz</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><Users className="w-3 h-3" /> Lances</span>
                                    <span className="text-sm font-medium text-foreground">{auction.bids_count ?? bids.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bid History */}
                        <div className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                <h2 className="font-semibold text-base flex items-center gap-2">
                                    <Gavel className="w-4 h-4 text-primary" /> Histórico de Lances
                                </h2>
                                <span className="text-xs text-muted-foreground">{bids.length} lance{bids.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
                                {bids.length === 0 ? (
                                    <div className="py-10 text-center text-sm text-muted-foreground">Nenhum lance registrado ainda.</div>
                                ) : bids.map((bid: Bid, idx: number) => (
                                    <div key={bid.id} className={`flex items-center justify-between px-5 py-3 ${idx === 0 ? "bg-primary/5" : ""}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                                {bid.bidder?.username?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{bid.bidder?.full_name || bid.bidder?.username || "Anónimo"}</p>
                                                <p className="text-[11px] text-muted-foreground">{new Date(bid.timestamp || bid.created_at).toLocaleString("pt-AO")}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${idx === 0 ? "text-primary" : "text-foreground"}`}>{formatPrice(bid.amount)} Kz</p>
                                            {idx === 0 && <p className="text-[10px] text-primary font-semibold">Maior lance</p>}
                                            {bid.is_buy_now && <p className="text-[10px] text-green-500 font-semibold">Compra imediata</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT: Bid Panel === */}
                    <div className="w-full lg:w-[340px] flex-shrink-0 space-y-4">

                        {/* Price Card */}
                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm dark:shadow-none sticky top-20 space-y-4">
                            {/* Countdown */}
                            {isLive && countdown && (
                                <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                                        Ao Vivo
                                    </span>
                                    <span className="font-mono text-base font-bold text-red-500">{countdown}</span>
                                </div>
                            )}
                            {!isLive && auction.end_time && (
                                <div className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-4 py-2.5">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Termina em</span>
                                    <span className="font-mono text-sm font-bold text-foreground">{countdown || formatDate(auction.end_time)}</span>
                                </div>
                            )}

                            {/* Current Price */}
                            <div className="text-center py-2">
                                <p className="text-xs text-muted-foreground mb-1">Lance Atual</p>
                                <div className="text-4xl font-extrabold text-primary leading-tight">
                                    {formatPrice(currentPrice)}
                                    <span className="text-lg font-semibold text-muted-foreground ml-1">Kz</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Mínimo inicial: {formatPrice(item.starting_price)} Kz
                                </p>
                            </div>

                            {/* Buy Now price */}
                            {item.buy_now_price && !isEnded && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">Comprar Já</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">{formatPrice(item.buy_now_price)} Kz</span>
                                </div>
                            )}

                            {/* Bid Form */}
                            {!isEnded && (
                                <form onSubmit={handlePlaceBid} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Valor do Lance (Kz)</label>
                                        <input
                                            type="number"
                                            value={bidAmount}
                                            onChange={e => setBidAmount(e.target.value)}
                                            min={Number(currentPrice) + Number(item.minimum_increment || 1)}
                                            step={Number(item.minimum_increment || 1)}
                                            placeholder={`Mín. ${formatPrice(Number(currentPrice) + Number(item.minimum_increment || 1))} Kz`}
                                            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Incremento mínimo: {formatPrice(item.minimum_increment)} Kz
                                        </p>
                                    </div>

                                    {/* Feedback */}
                                    {(error || bidError) && (
                                        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-destructive">{error || bidError}</p>
                                        </div>
                                    )}
                                    {bidSuccess && (
                                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Lance registrado com sucesso!</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submittingBid || !bidAmount}
                                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground py-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Gavel className="w-4 h-4" />
                                        {submittingBid ? "A processar..." : "Fazer Lance"}
                                    </button>

                                    {item.buy_now_price && (
                                        <button
                                            type="button"
                                            onClick={handleBuyNow}
                                            disabled={submittingBuyNow}
                                            className="w-full border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-500/10 disabled:opacity-60 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            {submittingBuyNow ? "A processar..." : `Comprar Já — ${formatPrice(item.buy_now_price)} Kz`}
                                        </button>
                                    )}
                                </form>
                            )}

                            {/* Ended state */}
                            {isEnded && (
                                <div className="text-center py-3 space-y-2">
                                    <p className="text-sm text-muted-foreground">Este leilão foi encerrado.</p>
                                    {auction.status === "SOLD" && (
                                        <p className="text-sm font-semibold text-green-500">Vendido por {formatPrice(currentPrice)} Kz</p>
                                    )}
                                    <Link to="/leiloes" className="block w-full border border-border hover:bg-muted text-foreground py-2.5 rounded-lg text-sm font-semibold transition-colors text-center">
                                        Ver outros leilões
                                    </Link>
                                </div>
                            )}

                            {/* Reserve met */}
                            {auction.reserve_met && (
                                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="w-4 h-4" /> Preço de reserva atingido
                                </div>
                            )}
                        </div>

                        {/* Stats Card */}
                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm dark:shadow-none space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Estatísticas</h3>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total de Lances</span>
                                    <span className="font-semibold">{auction.bids_count ?? bids.length}</span>
                                </div>
                                {viewerCount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> A visualizar agora</span>
                                        <span className="font-semibold">{viewerCount}</span>
                                    </div>
                                )}
                                {bids.length > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Maior lance</span>
                                        <span className="font-semibold text-primary">{formatPrice(bids[0]?.amount)} Kz</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
