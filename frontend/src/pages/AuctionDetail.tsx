import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useAuctionMessagesQuery, useAuctionChatRealtime, useSendAuctionMessageMutation } from "@/hooks/useChat";
import {
    ChevronLeft, Gavel, CheckCircle2, Shield, AlertCircle,
    Tag, User, CalendarDays, TrendingUp, ShoppingBag, MessageSquare,
    Send, Heart, AlertOctagon, CheckCheck, XCircle, X
} from "lucide-react";
import auctionService from "@/services/auction.service";
import { toast } from "sonner";
import ReportModal from "@/components/common/ReportModal";
import PublicProfileModal from "@/components/user/PublicProfileModal";
import { ReportTargetType } from "@/shared/types/report.types";
import LiveStreamViewerPlayer from "@/components/livestream/LiveStreamViewerPlayer";
import { useStreamViewersQuery } from "@/hooks/useLiveKit";
import { useCancelAuctionMutation } from "@/hooks/useAuction";
import { usePermissions } from "@/hooks/usePermissions";

function formatCurrency(val: string | number | null | undefined, compact: boolean = false, locale: string = "pt-AO") {
    if (!val) return "—";
    const n = Number(val);
    if (isNaN(n)) return String(val);
    
    const options: Intl.NumberFormatOptions = { 
        style: "currency", 
        currency: "AOA" 
    };
    
    if (compact && n >= 1000000) {
        options.notation = "compact";
        options.maximumFractionDigits = 2;
    } else if (n % 1 === 0) {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
    }
    
    return new Intl.NumberFormat(locale, options).format(n);
}

// Countdown hook
function useCountdown(startTime: string | null | undefined, endTime: string | null | undefined, status: string) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!endTime || status === "ENDED" || status === "SOLD" || status === "CANCELLED") return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [endTime, status]);

    if (status === "ENDED" || status === "SOLD") return { state: "ended" };
    if (status === "CANCELLED") return { state: "cancelled" };
    if (!startTime || !endTime) return null;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    if (now < start) {
        const diff = start - now;
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return { state: "scheduled", time: { days, hours, minutes, seconds } };
    }
    
    const diff = end - now;
    if (diff <= 0) return { state: "ended" };

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return { state: "active", time: { days, hours, minutes, seconds } };
}

export default function AuctionDetailPage() {
    const { t, i18n } = useTranslation();
    const localeMap: Record<string, string> = { pt: "pt-AO", en: "en-US", ar: "ar-SA" };
    const currentLocale = localeMap[i18n.language] || "pt-AO";
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

    const countdownRaw: any = useCountdown(auction?.start_time, auction?.end_time, auction?.status || "");
    
    let countdownDisplay = null;
    let countdownLabel = t('auction_detail.time_left');

    if (countdownRaw) {
        if (countdownRaw.state === "ended") {
            countdownDisplay = t('auction_detail.status.ended');
        } else if (countdownRaw.state === "cancelled") {
            countdownDisplay = t('auction_detail.status.cancelled');
        } else {
            if (countdownRaw.state === "scheduled") {
                countdownLabel = t('auction_detail.starts_in', 'Início em');
            }
            const { days, hours, minutes, seconds } = countdownRaw.time;
            if (days > 0) countdownDisplay = `${days}${t('auction_detail.days', 'd')} ${hours}${t('auction_detail.hours', 'h')}`;
            else if (hours > 0) countdownDisplay = `${hours}${t('auction_detail.hours', 'h')} ${minutes}${t('auction_detail.minutes', 'm')}`;
            else countdownDisplay = `${minutes}${t('auction_detail.minutes', 'm')} ${seconds}${t('auction_detail.seconds', 's')}`;
        }
    }

    // Contagem de espectadores via GET /auctions/:id/streams/:pk/viewers/
    // (fallback para as conexões do WebSocket enquanto o polling não responde)
    const { data: streamViewersData } = useStreamViewersQuery(
        auctionId,
        activeStream?.id,
        !!activeStream,
        10000
    );
    const liveViewerCount = streamViewersData?.count ?? viewerCount;

    const [isFavorite, setIsFavorite] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<{ id: number, username: string } | null>(null);

    // Tempo atual contínuo para atualizações otimistas de estado
    const [nowTime, setNowTime] = useState(Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNowTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Atualiza o título da página com base no leilão
    useDocumentTitle(auction ? `${auction.item.title}` : t('auction_detail.title'));

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
            const stored = localStorage.getItem("bidlive_watched_auctions");
            let ids = stored ? (JSON.parse(stored) as number[]) : [];
            
            if (isFavorite) {
                // Atualização Otimista (UI e LocalStorage)
                ids = ids.filter((id) => id !== auctionId);
                localStorage.setItem("bidlive_watched_auctions", JSON.stringify(ids));
                setIsFavorite(false);
                window.dispatchEvent(new Event("storage"));
                toast.success(t('auction_detail.fav_removed'));
                
                // Tenta sincronizar com o backend se autenticado
                if (isAuthenticated) {
                    auctionService.unwatch(auctionId).catch(console.error);
                }
            } else {
                // Atualização Otimista (UI e LocalStorage)
                if (!ids.includes(auctionId)) {
                    ids.push(auctionId);
                }
                localStorage.setItem("bidlive_watched_auctions", JSON.stringify(ids));
                setIsFavorite(true);
                window.dispatchEvent(new Event("storage"));
                toast.success(t('auction_detail.fav_added'));
                
                // Tenta sincronizar com o backend se autenticado
                if (isAuthenticated) {
                    auctionService.watch(auctionId).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Erro ao favoritar localmente:", err);
            toast.error(t('auction_detail.fav_error'));
        }
    };

    const [activeImage, setActiveImage] = useState(0);
    const [chatInput, setChatInput] = useState("");
    const [showChat, setShowChat] = useState(true);
    
    // Cancellation state & permissions
    const permissions = usePermissions();
    const cancelAuctionMutation = useCancelAuctionMutation();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const handleCancelAuction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auctionId) return;
        try {
            await cancelAuctionMutation.mutateAsync({
                id: auctionId,
                payload: { reason: cancelReason },
            });
            toast.success(t("auction_detail.toast_cancel_success", "Leilão cancelado com sucesso."));
            setShowCancelModal(false);
            setCancelReason("");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || t("auction_detail.toast_cancel_error", "Erro ao cancelar o leilão."));
        }
    };
    
    // Chat integration
    const { data: messagesData } = useAuctionMessagesQuery(auctionId);
    const chatMessages = messagesData || [];
    const { sendWsMessage } = useAuctionChatRealtime(auctionId);
    const sendMsgMutation = useSendAuctionMessageMutation();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const prevLengthRef = useRef(0);

    useEffect(() => {
        if (!chatEndRef.current) return;
        const lastMsg = chatMessages[chatMessages.length - 1];
        const isMyMessage = lastMsg?.sender?.id === currentUser?.id;
        
        if (chatMessages.length > prevLengthRef.current) {
            if (isMyMessage) {
                chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                const container = chatEndRef.current.parentElement;
                if (container) {
                    const threshold = 150;
                    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
                    if (isNearBottom) {
                        chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    }
                }
            }
        }
        prevLengthRef.current = chatMessages.length;
    }, [chatMessages, currentUser?.id]);

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
                console.error(t('auction_detail.chat_fail'), err);
            }
        }
    };

    const handlePresetBid = (inc: number) => {
        if (!auction) return;
        const cPrice = Number(auction.item.current_price || auction.item.starting_price || 0);
        setBidAmount(String(cPrice + inc));
    };

    const handleBuyNowSubmit = async () => {
        const res = await buyNow();
        if (res && res.success) {
            toast.success(t('auction_detail.buy_now_success'));
        } else if (res) {
            toast.error(res.message || t('auction_detail.buy_now_error'));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium tracking-wide mt-4">{t('auction_detail.loading')}</p>
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
                    <h2 className="text-xl font-bold text-foreground">{t('auction_detail.not_found_title')}</h2>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                        {auctionError || t('auction_detail.not_found_desc')}
                    </p>
                    <Link to="/leiloes" className="mt-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-sm hover:bg-primary/90 transition-colors">
                        {t('auction_detail.back_to_auctions')}
                    </Link>
                </div>
            </div>
        );
    }

    const currentPrice = Number(auction.item.current_price || auction.item.starting_price);
    const minIncrement = Number(auction.item.minimum_increment || 1);
    const hasBids = bids && bids.length > 0;
    const minBid = hasBids ? currentPrice + minIncrement : Number(auction.item.starting_price);
    
    // Verificações de tempo para mudanças de estado otimistas
    const isTimeStarted = nowTime >= new Date(auction.start_time).getTime();
    const isTimeEnded = nowTime >= new Date(auction.end_time).getTime();

    // Um leilão está com lances abertos se for ACTIVE, LIVE, ou SCHEDULED mas já chegou na hora.
    const isBiddingOpen = auction.status === "ACTIVE" || auction.status === "LIVE" || (auction.status === "SCHEDULED" && isTimeStarted && !isTimeEnded);
    const isStreamingLive = auction.status === "LIVE" && !!activeStream;
    
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
                        {t('auction_detail.gallery')}
                    </button>
                    <button
                        onClick={() => setIsWatchingStream(true)}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${isWatchingStream ? "text-red-500 bg-card border-b-2 border-red-500" : "text-muted-foreground hover:text-red-500"}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {t('auction_detail.live_stream')}
                    </button>
                </div>
            )}

            {isWatchingStream && activeStream ? (
                <div className="relative h-[300px] sm:h-[400px] xl:h-[480px] bg-slate-950 flex flex-col justify-between p-4 text-white">
                    <div className="flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm animate-pulse flex items-center gap-1">
                                <span className="w-1 h-1 bg-[#111827] rounded-full" /> {t('auction_detail.status.live')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 truncate max-w-[200px]">{activeStream.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[9px] font-bold flex items-center gap-1 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500/100 animate-ping" /> {liveViewerCount} {t('auction_detail.watching')}
                            </div>
                            <button onClick={() => setShowChat(!showChat)} className="bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[9px] font-bold flex items-center gap-1.5 text-white hover:bg-black/60 transition-colors cursor-pointer">
                                <MessageSquare size={12} /> {showChat ? t('auction_detail.hide_chat') : t('auction_detail.chat')}
                            </button>
                        </div>
                    </div>

                    {/* Player LiveKit do participante */}
                    <div className="absolute inset-0">
                        <LiveStreamViewerPlayer auctionId={auctionId} stream={activeStream} />
                    </div>

                    <div className="flex items-center justify-between z-10 w-full pt-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            {t('auction_detail.streamer')} @{activeStream.streamer?.username || t('auction_detail.seller')}
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
                                <span className="text-sm">{t('auction_detail.no_image')}</span>
                            </div>
                        )}

                        <div className="absolute top-3 left-3 flex gap-2">
                            <span className="bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-md shadow-black/20">
                                {t('auction_detail.lot')}{auction.id}
                            </span>
                            {isStreamingLive && (
                                <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-md shadow-black/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#111827] animate-pulse" /> {t('auctions.live')}
                                </span>
                            )}
                            {auction.status === 'ACTIVE' && (
                                <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-md shadow-black/20">
                                    {t('auctions.active', 'Active')}
                                </span>
                            )}
                            {auction.status === 'SCHEDULED' && (
                                <span className="bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-md shadow-black/20">
                                    {t('auctions.scheduled', 'Agendado')}
                                </span>
                            )}
                        </div>

                        <div className="absolute top-3 right-3 flex gap-2">
                            <button onClick={() => setShowChat(!showChat)} className="bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-sm shadow-md shadow-black/20 flex items-center gap-1.5 hover:bg-muted transition-colors cursor-pointer">
                                <MessageSquare size={12} /> {showChat ? t('auction_detail.hide_chat') : t('auction_detail.show_chat')}
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

    const getInitials = (name?: string | null) => {
        if (!name) return "?";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const getAvatarColor = (id: number) => {
        const colors = [
            "bg-[#00a884] text-white",
            "bg-[#34b7f1] text-white",
            "bg-[#a5b4fc] text-slate-900",
            "bg-[#f59e0b] text-slate-900",
            "bg-[#ec4899] text-white",
            "bg-[#8b5cf6] text-white",
            "bg-[#14b8a6] text-white",
        ];
        return colors[id % colors.length];
    };

    const renderChat = () => (
        <div className="flex flex-col h-full bg-card text-card-foreground rounded-xl overflow-hidden shadow-md border border-border">
            {/* Header */}
            <div className="px-4 py-3 bg-muted/60 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <MessageSquare size={16} />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                            {t('auction_detail.public_chat')}
                        </h3>
                        <p className="text-[10px] text-primary font-semibold">
                            {chatMessages.length} {t('chat_tab.tab_conversations', 'mensagens')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-full text-foreground font-mono text-[10px] border border-border shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live
                </div>
            </div>

            {/* Chat Messages Body - Platform theme tokens */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-muted/30">
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 text-primary border border-border">
                            <MessageSquare size={24} />
                        </div>
                        <p className="text-sm font-semibold text-foreground">{t('auction_detail.empty_chat')}</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">{t('auction_detail.empty_chat_desc')}</p>
                    </div>
                ) : (
                    chatMessages.map((msg) => {
                        const isMine = msg.sender.id === currentUser?.id;
                        const senderName = msg.sender.full_name || msg.sender.username || "Usuário";
                        const initials = getInitials(senderName);
                        const avatarBg = getAvatarColor(msg.sender.id || 0);

                        return (
                            <div 
                                key={msg.id} 
                                className={`flex gap-2.5 group items-end ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* User Avatar */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedProfile({ id: msg.sender.id, username: msg.sender.username })}
                                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[11px] shadow-sm transition-transform hover:scale-105 overflow-hidden border border-border cursor-pointer ${
                                        msg.sender.avatar_url ? 'bg-muted' : avatarBg
                                    }`}
                                    title={senderName}
                                >
                                    {msg.sender.avatar_url ? (
                                        <img src={msg.sender.avatar_url} alt={senderName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{initials}</span>
                                    )}
                                </button>

                                {/* Message Bubble (Platform tokens) */}
                                <div 
                                    className={`relative max-w-[82%] sm:max-w-[78%] px-3.5 py-2.5 shadow-sm text-xs leading-relaxed transition-all ${
                                        isMine 
                                            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-xs border border-primary/20' 
                                            : 'bg-card text-card-foreground rounded-2xl rounded-bl-xs border border-border'
                                    }`}
                                >
                                    {/* Sender Header */}
                                    <div className="flex items-center justify-between gap-3 mb-1">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProfile({ id: msg.sender.id, username: msg.sender.username })}
                                            className={`font-bold text-[11px] hover:underline cursor-pointer truncate max-w-[150px] text-left ${
                                                isMine ? 'text-primary-foreground/90' : 'text-primary'
                                            }`}
                                        >
                                            {isMine ? t('user_drawer.my_account', 'Você') : senderName}
                                        </button>
                                        <span className={`text-[9px] font-mono shrink-0 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            @{msg.sender.username}
                                        </span>
                                    </div>

                                    {/* Message Text */}
                                    <p className={`break-words text-[13px] whitespace-pre-wrap font-normal ${isMine ? 'text-primary-foreground' : 'text-foreground'}`}>
                                        {msg.message}
                                    </p>

                                    {/* Time Footer & Status */}
                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[9.5px] font-mono ${
                                        isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                    }`}>
                                        <span>
                                            {new Date(msg.created_at).toLocaleTimeString(currentLocale, { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {isMine && <CheckCheck size={13} className="text-primary-foreground ml-0.5" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>
            
            {/* Input Bar (Platform tokens) */}
            <div className="p-3 bg-muted/40 border-t border-border shrink-0">
                {isAuthenticated ? (
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder={t('auction_detail.chat_placeholder')}
                            className="flex-1 bg-background border border-border rounded-full pl-4 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                        />
                        <button 
                            type="submit" 
                            disabled={!chatInput.trim()}
                            className="w-9 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:bg-muted disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 border-none"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-2 bg-card rounded-lg px-3 border border-border">
                        <p className="text-[11px] text-muted-foreground">
                            {t('auction_detail.login_to_chat').split('<1>')[0]}
                            <Link to="/signin" className="text-primary hover:underline font-bold mx-1">
                                {t('auction_detail.login_to_chat').split('<1>')[1].split('</1>')[0]}
                            </Link>
                            {t('auction_detail.login_to_chat').split('</1>')[1]}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );


    const renderDetails = () => (
        <>
            <div className="p-6 lg:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('auction_detail.description_label')}</p>
                <h2 className="text-base font-bold text-foreground mb-3">{t('auction_detail.overview_title')}</h2>
                {auction.item.description ? (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{auction.item.description}</p>
                ) : (
                    <p className="text-sm italic text-muted-foreground">{t('auction_detail.no_description')}</p>
                )}
            </div>

            <div className="border-t border-border" />

            <div className="p-6 lg:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{t('auction_detail.lot_info')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                    {[
                        { icon: <Shield size={13} className="text-primary" />, label: t('auction_detail.condition_label'), value: t(`auction_detail.condition.${auction.item.condition_type?.toLowerCase()}`) || auction.item.condition_type || "—" },
                        { 
                          icon: <User size={13} className="text-primary" />, 
                          label: t('auction_detail.seller_label'), 
                          value: (
                              <button 
                                  onClick={() => setSelectedProfile({ id: auction.item.seller, username: t('auction_detail.seller_label') })}
                                  className="hover:text-primary transition-colors cursor-pointer font-bold underline underline-offset-2"
                              >
                                  {t('auction_detail.view_profile')}
                              </button>
                          ) 
                        },
                        { icon: <Tag size={13} className="text-primary" />, label: t('auction_detail.starting_price'), value: formatCurrency(auction.item.starting_price) },
                        { icon: <TrendingUp size={13} className="text-primary" />, label: t('auction_detail.min_increment'), value: formatCurrency(auction.item.minimum_increment) },
                        { icon: <CalendarDays size={13} className="text-primary" />, label: t('auction_detail.opening'), value: new Date(auction.start_time).toLocaleString(currentLocale, { dateStyle: "short", timeStyle: "short" }) },
                        { icon: <CalendarDays size={13} className="text-primary" />, label: t('auction_detail.closing'), value: new Date(auction.end_time).toLocaleString(currentLocale, { dateStyle: "short", timeStyle: "short" }) },
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
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{t('auction_detail.additional_values')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {auction.item.buy_now_price && (
                                <div className="border border-border rounded-sm p-4 bg-muted">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{t('auction_detail.buy_now')}</p>
                                    <p className="text-lg font-black text-primary">{formatCurrency(auction.item.buy_now_price, true)}</p>
                                </div>
                            )}
                            {auction.item.reserve_price && (
                                <div className="border border-border rounded-sm p-4 bg-muted">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{t('auction_detail.reserve_price')}</p>
                                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                                        {auction.reserve_met ? (
                                            <><CheckCircle2 size={13} className="text-green-500" /><span className="text-green-400">{t('auction_detail.reached')}</span></>
                                        ) : t('auction_detail.not_reached')}
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

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between">
                    <Link to="/leiloes" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-semibold px-3.5 py-2 hover:bg-muted border border-border rounded-lg transition-all">
                        <ChevronLeft className="h-4 w-4" />
                        {t('auction_detail.explore_lots')}
                    </Link>
                    {isAuthenticated && (
                        <div className="flex items-center gap-2">
                            {((currentUser?.id && (auction?.item?.seller === currentUser.id || (typeof auction?.item?.seller === 'object' && (auction?.item?.seller as any)?.id === currentUser.id))) || permissions.isAdminOrMonitor || permissions.isSuperAdmin) && 
                             auction.status !== "CANCELLED" && auction.status !== "ENDED" && auction.status !== "SOLD" && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent shadow-xs"
                                >
                                    <XCircle className="h-4 w-4" />
                                    {t("auction_detail.cancel_auction", "Cancelar Leilão")}
                                </button>
                            )}
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all cursor-pointer bg-transparent"
                                title={t('auction_detail.report_auction')}
                            >
                                <AlertOctagon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleToggleFavorite}
                                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                                    isFavorite
                                        ? 'bg-red-500/10 border-red-500/40 text-red-500'
                                        : 'bg-card border-border text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                                {isFavorite ? t('auction_detail.remove_favorite') : t('auction_detail.add_favorite')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Live Stream + Chat (when active) */}
                {activeStream && isWatchingStream && (
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
                            {renderMedia()}
                        </div>
                        {showChat && (
                            <div className="lg:col-span-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[400px] lg:h-auto">
                                {renderChat()}
                            </div>
                        )}
                    </section>
                )}

                {/* MAIN GRID: 12-col — 5 for gallery, 7 for content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ── LEFT: Image Gallery (5 cols) ── */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-card border border-border shadow-md">
                            {images.length > 0 ? (
                                <img
                                    src={images[activeImage]?.image_url}
                                    alt={auction.item.title}
                                    className="h-full w-full object-cover transition-all"
                                />
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
                                    <Gavel size={44} className="mb-2" />
                                    <span className="text-sm">{t('auction_detail.no_image')}</span>
                                </div>
                            )}
                            {/* Status Badges */}
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">{t('auction_detail.lot')}{auction.id}</span>
                                {isStreamingLive && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" /> {t('auctions.live')}
                                    </span>
                                )}
                                {auction.status === 'ACTIVE' && (
                                    <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">{t('auctions.active', 'Active')}</span>
                                )}
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-2.5 overflow-x-auto pb-1">
                                {images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative aspect-square w-18 shrink-0 rounded-lg overflow-hidden bg-card transition-all border cursor-pointer ${
                                            activeImage === idx ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground'
                                        }`}
                                    >
                                        <img src={img.image_url} alt="Thumbnail" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Chat (below gallery on desktop when not in stream mode) */}
                        {showChat && !(activeStream && isWatchingStream) && (
                            <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[400px] shadow-md">
                                {renderChat()}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Auction Info + Bidding (7 cols) ── */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Title & Meta */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground font-mono">
                                <span className="px-2 py-0.5 rounded-md bg-muted border border-border">{auction.item.category?.name || t('auction_detail.auction_category_default')}</span>
                                <span>•</span>
                                <button onClick={() => setSelectedProfile({ id: auction.item.seller, username: t('auction_detail.seller_label') })} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 font-mono text-xs text-muted-foreground">
                                    {t('auction_detail.seller_label')}
                                </button>
                                <span>•</span>
                                <span>{t('auction_detail.lot')} #{auction.id}</span>
                            </div>
                            <h1 className="text-foreground text-2xl sm:text-3xl font-extrabold tracking-tight">{auction.item.title}</h1>
                        </div>

                        {/* Description */}
                        {auction.item.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed p-4 bg-muted/30 border border-border rounded-xl">
                                {auction.item.description}
                            </p>
                        )}

                        {/* Info Cards: Time Left + Current Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-card border border-border p-4 rounded-xl space-y-1.5">
                                <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground font-bold block">{countdownLabel}</span>
                                <span className={`text-lg font-mono font-bold block ${isBiddingOpen && countdownDisplay?.includes('0m') ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                                    {countdownDisplay || '—'}
                                </span>
                            </div>
                            <div className="bg-card border border-border p-4 rounded-xl space-y-1.5">
                                <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground font-bold block">{t('auction_detail.current_bid')}</span>
                                <span className="text-lg font-mono font-bold text-primary block">{formatCurrency(currentPrice, true)}</span>
                            </div>
                        </div>

                        {/* Bid Panel */}
                        {isBiddingOpen ? (
                            isAuthenticated ? (
                                <div className="p-5 rounded-xl border border-border bg-card space-y-5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-foreground font-bold text-sm">{t('auction_detail.custom_bid_label')}</span>
                                        <span className="text-xs font-mono text-muted-foreground">{t('auction_detail.min_increment')}: {formatCurrency(minIncrement)}</span>
                                    </div>

                                    {bidError && (
                                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed">{bidError}</div>
                                    )}

                                    {/* Quick Increment Buttons */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-muted-foreground font-mono font-medium block">{t('auction_detail.fast_increment')}</span>
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {[minIncrement, minIncrement * 2, minIncrement * 4].map((inc) => (
                                                <button
                                                    key={inc}
                                                    type="button"
                                                    onClick={() => handlePresetBid(inc)}
                                                    className="py-2.5 text-xs font-bold bg-muted hover:bg-muted/80 text-primary rounded-lg transition-all border border-border hover:border-primary/30 flex items-center justify-center gap-1 cursor-pointer"
                                                >
                                                    +{formatCurrency(inc).replace("AOA", "").trim()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bid Input */}
                                    <form onSubmit={handlePlaceBid} className="space-y-3.5">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-muted-foreground text-xs font-mono">Kz</div>
                                            <input
                                                type="number"
                                                min={minBid}
                                                step={minIncrement}
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                placeholder={formatCurrency(minBid).replace("AOA", "").trim()}
                                                className="w-full h-11 pl-9 pr-24 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
                                                required
                                            />
                                            <div className="absolute right-1.5 top-1.5 flex gap-1.5">
                                                <button
                                                    type="submit"
                                                    disabled={submittingBid}
                                                    className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                                                >
                                                    {submittingBid ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Gavel className="h-3.5 w-3.5" /> {t('auction_detail.place_bid')}</>}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{t('auction_detail.min_bid_label')} <span className="font-semibold text-foreground">{formatCurrency(minBid)}</span></p>
                                    </form>

                                    {/* Buy Now */}
                                    {auction.item.buy_now_price && (
                                        <div className="pt-4 border-t border-border flex items-center justify-between">
                                            <div className="text-left">
                                                <span className="text-[10px] text-muted-foreground font-mono block">{t('auction_detail.buy_now_label')}</span>
                                                <span className="text-foreground text-xs font-bold leading-normal block">{t('auction_detail.buy_now_desc')}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleBuyNowSubmit}
                                                disabled={submittingBuyNow}
                                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-500/30 cursor-pointer disabled:opacity-50 shrink-0"
                                            >
                                                <ShoppingBag className="h-4 w-4" />
                                                {submittingBuyNow ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : `${t('auction_detail.buy_now_btn')}${formatCurrency(auction.item.buy_now_price, true)}`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-muted border border-border rounded-xl text-center py-6 flex flex-col items-center gap-3">
                                    <User size={28} className="text-muted-foreground" />
                                    <p className="text-sm font-semibold text-foreground">{t('auction_detail.login_required')}</p>
                                    <p className="text-xs text-muted-foreground max-w-[240px]">{t('auction_detail.login_required_desc')}</p>
                                    <Link to="/signin" className="mt-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">{t('auction_detail.login_btn')}</Link>
                                </div>
                            )
                        ) : (
                            <div className="p-5 rounded-xl border border-border bg-card text-center text-muted-foreground text-xs leading-relaxed">
                                {(auction.status === "ENDED" || auction.status === "SOLD") ? (
                                    <div className="space-y-2">
                                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <p className="font-semibold text-foreground">{t('auction_detail.status_msg_start')} {t('auction_detail.status_msg_ended')}.</p>
                                        {isAuthenticated && currentUser && auction.winner === currentUser.id && (
                                            <div className="mt-1 bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 text-sm rounded-lg font-semibold flex items-center justify-center gap-2">
                                                <CheckCircle2 size={16} /> {t('auction_detail.you_won')}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span>{t('auction_detail.status_msg_start')} {auction.status === "SCHEDULED" ? t('auction_detail.status_msg_scheduled') : t('auction_detail.status_msg_inactive')}.</span>
                                )}
                            </div>
                        )}

                        {/* Bid History Table */}
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-md">
                            <div className="px-5 py-3 border-b border-border flex items-center gap-2 bg-muted">
                                <Gavel size={14} className="text-muted-foreground" />
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">{t('auction_detail.bids_history')} ({auction.bids_count || bids.length})</span>
                            </div>
                            {bids.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-xs">{t('auction_detail.no_bids')}</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-muted text-muted-foreground font-mono font-bold uppercase tracking-wider border-b border-border">
                                                <th className="px-5 py-3">{t('auction_detail.bidder', 'Ofertante')}</th>
                                                <th className="px-5 py-3 text-right">{t('auction_detail.bid_value', 'Valor')}</th>
                                                <th className="px-5 py-3">{t('auction_detail.bid_time', 'Data')}</th>
                                                <th className="px-5 py-3 text-right">{t('auction_detail.bid_status', 'Status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border text-foreground">
                                            {bids.map((bid, i) => (
                                                <tr key={bid.id} className="hover:bg-muted/40 transition-colors">
                                                    <td className="px-5 py-3.5 flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                            {bid.bidder ? bid.bidder.username.charAt(0).toUpperCase() : "A"}
                                                        </div>
                                                        {bid.bidder ? (
                                                            <button onClick={() => setSelectedProfile({ id: bid.bidder!.id, username: bid.bidder!.username })} className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left bg-transparent border-none p-0 text-xs">{bid.bidder.username}</button>
                                                        ) : (
                                                            <span className="font-semibold">{t('auction_detail.anonymous')}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-mono font-bold">{formatCurrency(bid.amount, true)}</td>
                                                    <td className="px-5 py-3.5 font-mono text-muted-foreground">{new Date(bid.timestamp || bid.created_at).toLocaleString(currentLocale, { dateStyle: 'short', timeStyle: 'medium' })}</td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {i === 0 ? (
                                                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">{t('auction_detail.leader', 'Líder')}</span>
                                                        ) : bid.is_buy_now ? (
                                                            <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[10px] font-semibold">{t('auction_detail.direct_buy')}</span>
                                                        ) : (
                                                            <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[10px]">{t('auction_detail.outbid', 'Superado')}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Lot Details */}
                        <div className="bg-card border border-border rounded-xl shadow-md">
                            {renderDetails()}
                        </div>
                    </div>
                </div>
            </main>

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetType={ReportTargetType.AUCTION}
                targetId={auctionId}
            />

            {selectedProfile && (
                <PublicProfileModal
                    isOpen={true}
                    onClose={() => setSelectedProfile(null)}
                    userId={selectedProfile.id}
                    username={selectedProfile.username}
                />
            )}

            {/* Modal de Cancelamento de Leilão */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
                        onClick={() => setShowCancelModal(false)} 
                    />
                    <div className="relative bg-card border border-border w-full max-w-md rounded-xl shadow-2xl flex flex-col z-10 overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                                    <XCircle size={18} />
                                </div>
                                <h2 className="text-base font-bold text-foreground">
                                    {t("auction_detail.cancel_modal_title", "Cancelar Leilão")}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                type="button"
                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleCancelAuction} className="p-6 space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {t(
                                    "auction_detail.cancel_modal_desc",
                                    "Tem certeza de que deseja cancelar este leilão? Esta ação não pode ser desfeita e os participantes serão notificados."
                                )}
                            </p>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">
                                    {t("auction_detail.cancel_reason_label", "Motivo do Cancelamento (opcional)")}
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder={t("auction_detail.cancel_reason_placeholder", "Descreva o motivo do cancelamento...")}
                                    rows={3}
                                    className="w-full p-3 bg-muted/50 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer border-none"
                                >
                                    {t("modals.cancel", "Cancelar")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={cancelAuctionMutation.isPending}
                                    className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-all cursor-pointer border-none disabled:opacity-50"
                                >
                                    {cancelAuctionMutation.isPending
                                        ? t("modals.sending", "Cancelando...")
                                        : t("auction_detail.confirm_cancel", "Confirmar Cancelamento")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
