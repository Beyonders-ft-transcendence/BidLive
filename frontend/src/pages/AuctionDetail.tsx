import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useAuctionMessagesQuery, useAuctionChatRealtime, useSendAuctionMessageMutation } from "@/hooks/useChat";
import {
    ChevronLeft, Clock, Gavel, CheckCircle2, Shield, AlertCircle,
    Tag, User, CalendarDays, TrendingUp, Video, ShoppingBag, MessageSquare,
    Send, Heart
} from "lucide-react";
import auctionService from "@/services/auction.service";
import { toast } from "sonner";

// Condition label map
const conditionLabels: Record<string, string> = {
    NEW: "Novo",
    USED: "Usado",
    REFURBISHED: "Recondicionado",
    DAMAGED: "Com Defeito",
};

function formatCurrency(val: string | number | null | undefined) {
    if (!val) return "—";
    const n = Number(val);
    return isNaN(n) ? String(val) : new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(n);
}

// Countdown hook
function useCountdown(endTime: string | null | undefined, status: string) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!endTime || status === "ENDED" || status === "SOLD" || status === "CANCELLED") return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [endTime, status]);

    if (status === "ENDED" || status === "SOLD") return "Encerrado";
    if (status === "CANCELLED") return "Cancelado";
    if (!endTime) return null;

    const end = new Date(endTime).getTime();
    const diff = end - now;
    if (diff <= 0) return "Encerrado";

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
}

export default function AuctionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const auctionId = Number(id);
    const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);
    const currentUser = useAuthStore((s: any) => s.user);

    const {
        auction,
        bids,
        loading,
        auctionError,
        bidError,
        activeStream,
        isWatchingStream,
        setIsWatchingStream,
        viewerCount,
        bidAmount,
        setBidAmount,
        submittingBid,
        placeBid: handlePlaceBid,
        buyNow,
        submittingBuyNow,
    } = useAuctionRealtime(auctionId);

    const countdown = useCountdown(auction?.end_time, auction?.status || "");

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("bidlive_watched_auctions");
            if (stored) {
                const ids = JSON.parse(stored) as number[];
                setIsFavorite(ids.includes(auctionId));
            }
        } catch (e) {
            console.error(e);
        }
    }, [auctionId]);

    const handleToggleFavorite = async () => {
        try {
            if (isFavorite) {
                const res = await auctionService.unwatch(auctionId);
                if (res.success) {
                    const stored = localStorage.getItem("bidlive_watched_auctions");
                    const ids = stored ? JSON.parse(stored) as number[] : [];
                    const updated = ids.filter((id) => id !== auctionId);
                    localStorage.setItem("bidlive_watched_auctions", JSON.stringify(updated));
                    setIsFavorite(false);
                    window.dispatchEvent(new Event("storage"));
                    toast.success("Removido dos favoritos.");
                }
            } else {
                const res = await auctionService.watch(auctionId);
                if (res.success) {
                    const stored = localStorage.getItem("bidlive_watched_auctions");
                    const ids = stored ? JSON.parse(stored) as number[] : [];
                    if (!ids.includes(auctionId)) {
                        ids.push(auctionId);
                    }
                    localStorage.setItem("bidlive_watched_auctions", JSON.stringify(ids));
                    setIsFavorite(true);
                    window.dispatchEvent(new Event("storage"));
                    toast.success("Adicionado aos favoritos.");
                }
            }
        } catch (err) {
            console.error("Erro ao favoritar:", err);
            toast.error("Erro ao processar ação.");
        }
    };

    const [activeImage, setActiveImage] = useState(0);
    const [chatInput, setChatInput] = useState("");
    const [showChat, setShowChat] = useState(true);
    
    // Chat integration
    const { data: messagesData } = useAuctionMessagesQuery(auctionId);
    const chatMessages = messagesData || [];
    const { sendWsMessage } = useAuctionChatRealtime(auctionId);
    const sendMsgMutation = useSendAuctionMessageMutation();
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !isAuthenticated) return;
        const msg = chatInput.trim();
        setChatInput("");
        const sent = sendWsMessage(msg);
        if (!sent) {
            try {
                await sendMsgMutation.mutateAsync({ auctionId, message: msg });
            } catch (err) {
                console.error("Falha ao enviar mensagem de chat", err);
            }
        }
    };

    const handlePresetBid = (inc: number) => {
        if (!auction) return;
        const cPrice = Number(auction.item.current_price || auction.item.starting_price || 0);
        setBidAmount(String(cPrice + inc));
    };

    const handleBuyNowSubmit = async () => {
        await buyNow();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium tracking-wide mt-4">Carregando lote...</p>
                </div>
            </div>
        );
    }

    if (auctionError || !auction) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                    <AlertCircle size={44} className="text-red-400" />
                    <h2 className="text-xl font-bold text-foreground">Lote não encontrado</h2>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                        {auctionError || "O leilão que você está procurando não existe ou foi removido."}
                    </p>
                    <Link to="/leiloes" className="mt-2 bg-primary text-foreground text-sm font-semibold px-6 py-2.5 rounded-sm hover:bg-primary/90 transition-colors">
                        Voltar para Leilões
                    </Link>
                </div>
            </div>
        );
    }

    const currentPrice = Number(auction.item.current_price || auction.item.starting_price);
    const minIncrement = Number(auction.item.minimum_increment || 1);
    const hasBids = bids && bids.length > 0;
    const minBid = hasBids ? currentPrice + minIncrement : Number(auction.item.starting_price);
    const isLive = auction.status === "LIVE";
    const images = auction.item.images || [];


    // --- RENDER HELPERS --- //

    const renderMedia = () => (
        <>
            {activeStream && (
                <div className="flex border-b border-border bg-muted">
                    <button
                        onClick={() => setIsWatchingStream(false)}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition duration-150 cursor-pointer ${!isWatchingStream ? "text-primary bg-card border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Galeria de Fotos
                    </button>
                    <button
                        onClick={() => setIsWatchingStream(true)}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${isWatchingStream ? "text-red-500 bg-card border-b-2 border-red-500" : "text-muted-foreground hover:text-red-500"}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Transmissão Ao Vivo (LIVE)
                    </button>
                </div>
            )}

            {isWatchingStream && activeStream ? (
                <div className="relative h-[300px] sm:h-[400px] xl:h-[480px] bg-slate-950 flex flex-col justify-between p-4 text-white">
                    <div className="flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm animate-pulse flex items-center gap-1">
                                <span className="w-1 h-1 bg-[#111827] rounded-full" /> AO VIVO
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 truncate max-w-[200px]">{activeStream.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[9px] font-bold flex items-center gap-1 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500/100 animate-ping" /> {viewerCount} assistindo
                            </div>
                            <button onClick={() => setShowChat(!showChat)} className="bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[9px] font-bold flex items-center gap-1.5 text-white hover:bg-black/60 transition-colors cursor-pointer">
                                <MessageSquare size={12} /> {showChat ? "Ocultar Chat" : "Chat"}
                            </button>
                        </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/20 via-slate-900 to-slate-950">
                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 animate-pulse mb-3">
                            <Video size={24} className="text-white" />
                        </div>
                        <p className="text-xs font-bold text-slate-100 uppercase tracking-widest leading-none">Transmissão em Andamento</p>
                    </div>

                    <div className="flex items-center justify-between z-10 w-full pt-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Streamer: @{activeStream.streamer?.username || "Vendedor"}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="relative flex-1 min-h-[300px] xl:min-h-[400px] bg-muted flex items-center justify-center">
                        {images.length > 0 ? (
                            <img src={images[activeImage]?.image_url} alt={auction.item.title} className="max-w-full max-h-full object-contain p-2 absolute inset-0 m-auto" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Gavel size={44} className="mb-2" />
                                <span className="text-sm">Sem imagem</span>
                            </div>
                        )}

                        <div className="absolute top-3 left-3 flex gap-2">
                            <span className="bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-md shadow-black/20">
                                Lote #{auction.id}
                            </span>
                            {isLive && (
                                <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-md shadow-black/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#111827] animate-pulse" /> Ao Vivo
                                </span>
                            )}
                        </div>

                        <div className="absolute top-3 right-3 flex gap-2">
                            <button onClick={() => setShowChat(!showChat)} className="bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-sm shadow-md shadow-black/20 flex items-center gap-1.5 hover:bg-muted transition-colors cursor-pointer">
                                <MessageSquare size={12} /> {showChat ? "Ocultar Chat" : "Mostrar Chat"}
                            </button>
                        </div>
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-2 p-3 border-t border-border bg-muted overflow-x-auto h-[90px] shrink-0">
                            {images.map((img, i) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-16 shrink-0 rounded-sm overflow-hidden border-2 transition-colors cursor-pointer ${activeImage === i ? "border-primary" : "border-transparent hover:border-slate-600"}`}
                                >
                                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );

    const renderChat = () => (
        <>
            <div className="px-4 py-3 border-b border-border bg-muted flex items-center gap-2 shrink-0">
                <MessageSquare size={16} className="text-primary" /> 
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Chat Público</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted">
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <MessageSquare size={24} className="text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground font-medium">Chat vazio.</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Mande a primeira mensagem!</p>
                    </div>
                ) : (
                    chatMessages.map((msg) => {
                        const isMine = msg.sender.id === currentUser?.id;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                <span className="text-[9px] text-muted-foreground mb-0.5 ml-1 mr-1">{msg.sender.username}</span>
                                <div className={`px-3 py-2 rounded-md text-sm max-w-[85%] break-words ${isMine ? 'bg-primary text-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                                    {msg.message}
                                </div>
                                <span className="text-[8px] text-muted-foreground mt-0.5 mx-1">
                                    {new Date(msg.created_at).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        )
                    })
                )}
                <div ref={chatEndRef} />
            </div>
            
            <div className="p-3 bg-card border-t border-border shrink-0">
                {isAuthenticated ? (
                    <form onSubmit={handleSendMessage} className="relative flex items-center">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Digite..."
                            className="w-full bg-muted border border-border rounded-full pl-4 pr-10 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground"
                        />
                        <button 
                            type="submit" 
                            disabled={!chatInput.trim()}
                            className="absolute right-1.5 p-1.5 bg-primary text-foreground rounded-full hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={12} />
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-1">
                        <p className="text-[10px] text-muted-foreground">Faça <Link to="/signin" className="text-primary hover:underline font-medium">login</Link> para conversar</p>
                    </div>
                )}
            </div>
        </>
    );

    const renderBidding = () => (
        <>
            <div className="px-6 pt-6 pb-4 border-b border-border">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-sm mb-3">
                    {auction.item.category?.name || "Leilão"}
                </span>
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-xl font-extrabold text-foreground leading-snug">{auction.item.title}</h1>
                    {isAuthenticated && (
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-2 border rounded-sm transition cursor-pointer shrink-0 ${
                                isFavorite
                                    ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                            }`}
                            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        >
                            <Heart size={18} className={isFavorite ? "fill-current" : ""} />
                        </button>
                    )}
                </div>
            </div>

            <div className="px-6 py-5 flex items-end justify-between border-b border-border bg-muted">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Lance Atual</p>
                    <p className={`text-3xl font-black tracking-tight ${isLive ? "text-primary" : "text-foreground"}`}>
                        {formatCurrency(currentPrice)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Tempo Restante</p>
                    <p className={`text-sm font-bold flex items-center justify-end gap-1 ${isLive ? "text-red-500" : "text-muted-foreground"}`}>
                        <Clock size={13} /> {countdown}
                    </p>
                </div>
            </div>

            <div className="px-6 py-5">
                {isLive ? (
                    isAuthenticated ? (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-1.5">
                                <span className="text-[9px] text-muted-foreground font-mono font-medium block">Incremento rápido (+ sob lance atual):</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {[minIncrement, minIncrement * 2, minIncrement * 4].map((inc) => (
                                        <button
                                            type="button"
                                            key={inc}
                                            onClick={() => handlePresetBid(inc)}
                                            className="py-2.5 text-xs font-bold bg-muted hover:bg-muted text-primary rounded-sm transition-all border border-border flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            +{formatCurrency(inc).replace("AOA", "").trim()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handlePlaceBid} className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Valor do Lance Customizado</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3.5 text-xs font-bold text-muted-foreground select-none">Kz</span>
                                    <input
                                        type="number"
                                        min={minBid}
                                        step={minIncrement}
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        placeholder={formatCurrency(minBid).replace("AOA", "").trim()}
                                        className="w-full border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none rounded-sm pl-10 pr-24 py-3.5 text-sm font-semibold text-foreground bg-card transition-colors"
                                        required
                                    />
                                    <div className="absolute right-1.5 top-1.5 flex gap-1.5">
                                        <button type="submit" disabled={submittingBid} className="h-8 px-4 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:text-muted-foreground text-foreground rounded-sm text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-black/20 cursor-pointer">
                                            {submittingBid ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Gavel className="h-3.5 w-3.5" /> Ofertar</>}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-[10px] text-muted-foreground">Lance mínimo: <span className="font-semibold text-foreground">{formatCurrency(minBid)}</span></p>
                                    {bidError && <p className="text-[10px] text-red-500 font-bold">{bidError}</p>}
                                </div>
                            </form>

                            {auction.item.buy_now_price && (
                                <div className="pt-4 border-t border-border flex items-center justify-between gap-4 mt-2">
                                    <div className="text-left">
                                        <span className="text-[10px] text-muted-foreground font-mono block">Arremate Imediato:</span>
                                        <span className="text-foreground text-xs font-bold leading-normal block">Adquira agora sem disputas</span>
                                    </div>
                                    <button type="button" onClick={handleBuyNowSubmit} disabled={submittingBuyNow} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-foreground rounded-sm text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-black/20 disabled:opacity-50 shrink-0">
                                        <ShoppingBag className="h-4 w-4" />
                                        {submittingBuyNow ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : `Comprar por ${formatCurrency(auction.item.buy_now_price)}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-muted border border-border rounded-sm text-center py-6 flex flex-col items-center gap-3">
                            <User size={28} className="text-muted-foreground" />
                            <p className="text-sm font-semibold text-foreground">Faça login para participar</p>
                            <p className="text-xs text-muted-foreground max-w-[240px]">Você precisa estar autenticado para dar lances ou arrematar este lote.</p>
                            <Link to="/signin" className="mt-2 bg-primary text-foreground text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-primary/90 transition-colors">
                                Fazer Login
                            </Link>
                        </div>
                    )
                ) : (
                    <div className="bg-muted border border-border rounded-sm text-center py-5 flex flex-col items-center gap-3">
                        <p className="text-sm font-semibold text-muted-foreground">Este leilão está {auction.status === "SOLD" ? "Vendido" : auction.status === "ENDED" ? "Encerrado" : "Inativo"}.</p>
                        {isAuthenticated && currentUser && auction.winner === currentUser.id && (
                            <div className="mt-1 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 text-sm rounded-sm font-semibold flex items-center gap-2">
                                <CheckCircle2 size={16} /> Você venceu este leilão!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );

    const renderBidsHistory = () => (
        <>
            <div className="px-6 py-3 border-b border-border flex items-center gap-2 bg-muted">
                <Gavel size={14} className="text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Histórico de Lances ({auction.bids_count || bids.length})
                </span>
            </div>
            <div className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto bg-muted">
                {bids.length > 0 ? (
                    bids.map((bid, i) => (
                        <div key={bid.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                    {bid.bidder ? bid.bidder.username.charAt(0).toUpperCase() : "A"}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground leading-tight">{bid.bidder ? bid.bidder.username : "Anônimo"}</p>
                                    <p className="text-[10px] text-muted-foreground">{new Date(bid.timestamp || bid.created_at).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-sm font-black ${i === 0 ? "text-primary" : "text-foreground"}`}>{formatCurrency(bid.amount)}</span>
                                {bid.is_buy_now && <span className="block text-[9px] text-green-500 font-bold uppercase">Compra Direta</span>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-6 py-8 text-center">
                        <Gavel size={24} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">Nenhum lance ainda.</p>
                    </div>
                )}
            </div>
        </>
    );

    const renderDetails = () => (
        <>
            <div className="p-6 lg:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Descrição</p>
                <h2 className="text-base font-bold text-foreground mb-3">Visão Geral do Lote</h2>
                {auction.item.description ? (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{auction.item.description}</p>
                ) : (
                    <p className="text-sm italic text-muted-foreground">O vendedor não forneceu uma descrição detalhada.</p>
                )}
            </div>

            <div className="border-t border-border" />

            <div className="p-6 lg:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Informações do Lote</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                    {[
                        { icon: <Shield size={13} className="text-primary" />, label: "Condição", value: conditionLabels[auction.item.condition_type] || auction.item.condition_type || "—" },
                        { icon: <User size={13} className="text-primary" />, label: "Vendedor", value: `ID #${auction.item.seller}` },
                        { icon: <Tag size={13} className="text-primary" />, label: "Preço Inicial", value: formatCurrency(auction.item.starting_price) },
                        { icon: <TrendingUp size={13} className="text-primary" />, label: "Incremento Mín.", value: formatCurrency(auction.item.minimum_increment) },
                        { icon: <CalendarDays size={13} className="text-primary" />, label: "Abertura", value: new Date(auction.start_time).toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" }) },
                        { icon: <CalendarDays size={13} className="text-primary" />, label: "Encerramento", value: new Date(auction.end_time).toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" }) },
                    ].map((item) => (
                        <div key={item.label} className="flex flex-col gap-1">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">{item.icon} {item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {(auction.item.buy_now_price || auction.item.reserve_price) && (
                <>
                    <div className="border-t border-border" />
                    <div className="p-6 lg:p-8">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Valores Adicionais</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {auction.item.buy_now_price && (
                                <div className="border border-border rounded-sm p-4 bg-muted">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Comprar Agora</p>
                                    <p className="text-lg font-black text-primary">{formatCurrency(auction.item.buy_now_price)}</p>
                                </div>
                            )}
                            {auction.item.reserve_price && (
                                <div className="border border-border rounded-sm p-4 bg-muted">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Preço de Reserva</p>
                                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                                        {auction.reserve_met ? (
                                            <><CheckCircle2 size={13} className="text-green-500" /><span className="text-green-400">Atingido</span></>
                                        ) : ("Não Atingido")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                    <Link to="/leiloes" className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
                        <ChevronLeft size={14} /> Explorar Lotes
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-semibold truncate max-w-xs">{auction.item.title}</span>
                </div>

                {/* MOBILE VIEW (< 1024px) */}
                <div className="flex flex-col lg:hidden gap-6">
                    <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20 overflow-hidden flex flex-col">
                        {renderMedia()}
                    </div>
                    
                    <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20 overflow-hidden">
                        {renderBidding()}
                    </div>
                    
                    {showChat && (
                        <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20 flex flex-col h-[400px]">
                            {renderChat()}
                        </div>
                    )}
                    
                    <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20 overflow-hidden">
                        {renderBidsHistory()}
                    </div>
                    
                    <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20">
                        {renderDetails()}
                    </div>
                </div>

                {/* DESKTOP VIEW (>= 1024px) */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_380px] gap-8">
                    
                    {/* ── LEFT COLUMN ── */}
                    <div className="flex flex-col gap-6">
                        
                        {/* Top Section: Media + Chat side by side on large screens */}
                        <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20 overflow-hidden flex flex-col xl:flex-row">
                            
                            {/* Media Section */}
                            <div className="flex-1 flex flex-col">
                                {renderMedia()}
                            </div>

                            {/* Chat Card */}
                            {showChat && (
                                <div className="w-full xl:w-[320px] shrink-0 border-t xl:border-t-0 xl:border-l border-border flex flex-col h-[400px] xl:h-auto bg-background/20">
                                    {renderChat()}
                                </div>
                            )}

                        </div>

                        {/* Details Card */}
                        <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20">
                            {renderDetails()}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="flex flex-col gap-5">
                        
                        {/* Bidding Card */}
                        <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20 overflow-hidden sticky top-20">
                            {renderBidding()}
                        </div>

                        {/* Bids History Card */}
                        <div className="bg-card border border-border rounded-sm shadow-md shadow-black/20 overflow-hidden">
                            {renderBidsHistory()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
