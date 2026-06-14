"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Clock,
  Users,
  Eye,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Bell,
  Heart,
  ArrowLeft,
  Lock,
  Info,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  DollarSign,
  Gavel
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import auctionService from "@/services/auction.service";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, auctionStatusColor, getAuctionStatusLabel } from "@/utils/auction";
import { AuctionStatus, type Auction, type Bid } from "@/types/auction.types";
import ENV from "@/utils/env.utils";

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  // States
  const { user, isAuthenticated, accessToken } = useAuthStore();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [activeConnections, setActiveConnections] = useState<number>(0);
  const [watcherCount, setWatcherCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [submittingBid, setSubmittingBid] = useState<boolean>(false);
  const [buyingNow, setBuyingNow] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);

  // Helper function to format image URLs
  const getImageUrl = (url?: string): string => {
    if (!url) return "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const backendBase = (ENV.API_URL || "http://localhost:8000/api").replace("/api", "");
    return `${backendBase}${url}`;
  };

  // 1. Fetch initial auction details and bid history
  const fetchInitialData = async () => {
    if (isNaN(id)) return;
    try {
      setLoading(true);
      const [auctionRes, bidsRes] = await Promise.all([
        auctionService.retrieve(id),
        auctionService.listBids(id, { page_size: 20 })
      ]);

      if (auctionRes.success && auctionRes.data) {
        setAuction(auctionRes.data);
      } else {
        toast.error("Não foi possível carregar os detalhes do leilão.");
      }

      if (bidsRes.success && bidsRes.data) {
        setBids(bidsRes.data.results || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  // 2. Real-time WebSocket connection
  useEffect(() => {
    if (!id || !isAuthenticated || !accessToken || loading || !auction) return;

    // Build the WebSocket URL
    const apiUrL = ENV.API_URL || "http://localhost:8000/api";
    const wsBase = apiUrL.replace("http://", "ws://").replace("https://", "wss://").replace("/api", "");
    const wsUrl = `${wsBase}/ws/auctions/${id}/?token=${accessToken}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`Connected to WebSocket for auction ${id}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventType = data.event;
        const payload = data.payload;

        console.log("WS Event Received:", eventType, payload);

        if (eventType === "auction_snapshot") {
          setActiveConnections(payload.active_connections || 0);
          setWatcherCount(payload.watcher_count || 0);
          if (payload.item?.current_price) {
            setAuction((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                item: {
                  ...prev.item,
                  current_price: payload.item.current_price
                }
              };
            });
          }
        } else if (eventType === "user_joined" || eventType === "user_left") {
          setActiveConnections(payload.active_connections || 0);
          setWatcherCount(payload.watcher_count || 0);
        } else if (eventType === "bid_accepted") {
          // Trigger a bid update
          fetchInitialData();
          toast.success("Novo lance registrado em tempo real!");
        } else if (eventType === "bid_error") {
          const errors = payload.errors || [];
          const errorMsg = typeof errors[0] === "string" ? errors[0] : JSON.stringify(errors[0]);
          toast.error(`Erro no lance: ${errorMsg || "Erro desconhecido"}`);
        }
      } catch (err) {
        console.error("Error parsing WS event", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };

    ws.onclose = () => {
      console.log(`Closed WebSocket for auction ${id}`);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id, isAuthenticated, accessToken, loading, !!auction]);

  // 3. Countdown timer logic
  useEffect(() => {
    if (!auction) return;

    const calculateTimeLeft = () => {
      const targetTime = new Date(auction.end_time).getTime();
      const diff = targetTime - Date.now();

      if (diff <= 0) {
        setTimeLeft("Encerrado");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let formatted = "";
      if (days > 0) formatted += `${days}d `;
      if (hours > 0 || days > 0) formatted += `${hours.toString().padStart(2, "0")}h `;
      formatted += `${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;

      setTimeLeft(formatted);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  // Handle Quick Bids Increment
  const handleQuickBid = (increment: number) => {
    if (!auction) return;
    const basePrice = parseFloat(auction.item.current_price || auction.item.starting_price);
    const minIncrement = parseFloat(auction.item.minimum_increment);
    const targetAmount = basePrice + Math.max(increment, minIncrement);
    setBidAmount(targetAmount.toFixed(2));
  };

  // Submit a Bid
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Por favor, faça login para dar um lance.");
      router.push("/signin");
      return;
    }

    if (!auction || !bidAmount) return;

    const amountNum = parseFloat(bidAmount);
    const currentPriceNum = parseFloat(auction.item.current_price);
    const minIncrementNum = parseFloat(auction.item.minimum_increment);

    if (amountNum < currentPriceNum + minIncrementNum) {
      toast.error(`O lance mínimo deve ser de ${formatCurrency(currentPriceNum + minIncrementNum)}`);
      return;
    }

    setSubmittingBid(true);
    try {
      const res = await auctionService.placeBid(auction.id, { amount: amountNum });
      if (res.success) {
        toast.success("Lance realizado com sucesso!");
        setBidAmount("");
        fetchInitialData(); // Reload data
      } else {
        const errorMsg = res.errors ? Object.values(res.errors).flat().join(" ") : "Ocorreu um erro ao dar o lance.";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro de conexão ao dar o lance.");
    } finally {
      setSubmittingBid(false);
    }
  };

  // Buy Now
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Por favor, faça login para comprar.");
      router.push("/signin");
      return;
    }

    if (!auction || !auction.item.buy_now_price) return;

    if (!confirm(`Deseja mesmo efetuar a compra imediata deste lote por ${formatCurrency(auction.item.buy_now_price)}?`)) {
      return;
    }

    setBuyingNow(true);
    try {
      const res = await auctionService.buyNow(auction.id);
      if (res.success) {
        toast.success("Lote arrematado com sucesso!");
        fetchInitialData();
      } else {
        toast.error(res.message || "Erro ao efetuar compra imediata.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro de conexão ao efetuar a compra imediata.");
    } finally {
      setBuyingNow(false);
    }
  };

  // Watch / Unwatch
  const handleToggleWatch = async () => {
    if (!isAuthenticated) {
      toast.error("Por favor, faça login para favoritar leilões.");
      router.push("/signin");
      return;
    }

    if (!auction) return;

    try {
      if (isWatching) {
        const res = await auctionService.unwatch(auction.id);
        if (res.success) {
          setIsWatching(false);
          toast.success("Removido dos favoritos.");
        }
      } else {
        const res = await auctionService.watch(auction.id);
        if (res.success) {
          setIsWatching(true);
          toast.success("Adicionado aos favoritos!");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar favoritos.");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0B1F3B] min-h-screen text-white font-sans">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Carregando detalhes do leilão...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="bg-[#0B1F3B] min-h-screen text-white font-sans">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[60vh]">
          <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Leilão não encontrado</h2>
          <p className="text-gray-400 mb-6 text-center max-w-md">O leilão que você procura não existe ou foi cancelado.</p>
          <Link href="/explore" className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-sm transition-all flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar para Exploração
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = auction.item.images || [];
  const primaryImage = images[currentImageIndex]?.file?.url || "";
  const startingPrice = parseFloat(auction.item.starting_price);
  const currentPrice = parseFloat(auction.item.current_price);
  const minIncrement = parseFloat(auction.item.minimum_increment);
  const buyNowPrice = auction.item.buy_now_price ? parseFloat(auction.item.buy_now_price) : null;

  return (
    <div className="bg-[#0B1F3B] min-h-screen text-white font-sans flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/explore" className="hover:text-white transition-colors">Leilões</Link>
          <ChevronRight size={12} />
          <span className="text-gray-400 uppercase tracking-wider">{auction.item.category_label || "Geral"}</span>
          <ChevronRight size={12} />
          <span className="text-white font-semibold truncate max-w-[200px]">{auction.item.title}</span>
        </div>

        {/* Action Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/explore" className="p-2.5 rounded-sm bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${auctionStatusColor(auction.status)}`}>
                  {auction.status === AuctionStatus.LIVE && (
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                  {getAuctionStatusLabel(auction.status)}
                </span>
                <span className="text-xs text-gray-400">ID Lote: #{auction.id}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{auction.item.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleWatch}
              className={`p-3 rounded-sm border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                isWatching 
                  ? "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20" 
                  : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <Heart size={16} className={isWatching ? "fill-red-500" : ""} />
              {isWatching ? "Salvo" : "Favoritar"}
            </button>
            <button className="p-3 rounded-sm bg-slate-900 border border-slate-800 text-gray-400 hover:text-white hover:border-slate-700 transition-all">
              <Bell size={16} />
            </button>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* LEFT COLUMN: Gallery & Product Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Gallery Card */}
            <div className="bg-[#0C1B33] rounded-xl border border-slate-800 overflow-hidden shadow-xl p-4">
              
              {/* Primary Image View */}
              <div className="relative aspect-16/10 rounded-sm bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-900 mb-4">
                <img
                  src={getImageUrl(primaryImage)}
                  alt={auction.item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Live indicators */}
                <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                  {auction.status === AuctionStatus.LIVE && (
                    <div className="bg-red-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-sm shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      AO VIVO
                    </div>
                  )}

                  {watcherCount > 0 && (
                    <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-sm flex items-center gap-1.5">
                      <Eye size={12} className="opacity-70" /> {watcherCount} assistindo
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails list */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative aspect-4/3 rounded-sm overflow-hidden border transition-all ${
                        idx === currentImageIndex ? "border-primary scale-102 shadow-md shadow-primary/20" : "border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <img
                        src={getImageUrl(img.file?.url)}
                        alt={`thumbnail-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Details Card */}
            <div className="bg-[#0C1B33] rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3">Informações do Lote</h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {auction.item.description || "Nenhuma descrição detalhada fornecida para este lote."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Estado de Conservação</h4>
                  <span className="inline-flex px-3 py-1 rounded-sm bg-slate-900 border border-slate-800 text-xs font-semibold">
                    {auction.item.condition_type}
                  </span>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Categoria</h4>
                  <span className="inline-flex px-3 py-1 rounded-sm bg-slate-900 border border-slate-800 text-xs font-semibold">
                    {auction.item.category_label || "Geral"}
                  </span>
                </div>
              </div>

              {/* Rules / Smart contract */}
              {auction.rules && Object.keys(auction.rules).length > 0 && (
                <div className="pt-6 border-t border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                    <Info size={14} className="text-primary" /> Regras Especiais do Lote
                  </h3>
                  <div className="bg-slate-900/50 rounded-sm border border-slate-800 p-4">
                    <pre className="text-xs text-gray-400 font-mono overflow-auto max-h-[150px]">
                      {JSON.stringify(auction.rules, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Bidding Box & Activity History (5 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Live Bidding Box */}
            <div className="bg-[#0C1B33] rounded-xl border border-slate-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary-light"></div>
              
              <div className="p-6 space-y-6">
                
                {/* Timer Header */}
                <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-sm border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-red-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tempo Restante</span>
                  </div>
                  <span className="text-base font-black text-red-400 bg-red-500/10 px-3 py-1 rounded-sm border border-red-500/20 font-mono">
                    {timeLeft || "Calculando..."}
                  </span>
                </div>

                {/* Price indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/30 rounded-sm border border-slate-800">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Preço Inicial</span>
                    <span className="text-sm font-bold text-slate-300 font-mono">{formatCurrency(startingPrice)}</span>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-sm border border-primary/20">
                    <span className="text-[9px] text-primary-light font-bold uppercase tracking-wider block mb-1">Lance Atual</span>
                    <span className="text-lg font-black text-green-400 font-mono">{formatCurrency(currentPrice)}</span>
                  </div>
                </div>

                {/* Main Bidding Actions */}
                {auction.status === AuctionStatus.LIVE ? (
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label htmlFor="bid-amount" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Seu Lance (Mínimo: {formatCurrency(currentPrice + minIncrement)})
                      </label>
                      
                      <div className="relative rounded-sm shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign size={16} className="text-gray-500" />
                        </div>
                        <input
                          id="bid-amount"
                          type="number"
                          step="0.01"
                          placeholder={(currentPrice + minIncrement).toFixed(2)}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          disabled={submittingBid}
                          className="block w-full pl-9 pr-12 py-3 bg-slate-900 border border-slate-800 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-semibold font-mono text-white placeholder-gray-600"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-xs font-bold uppercase">AOA</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick increment buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {[1000, 5000, 10000].map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => handleQuickBid(inc)}
                          className="py-2 px-1 text-center bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-[10px] font-black rounded-sm transition-all text-slate-300 hover:text-white"
                        >
                          +{inc.toLocaleString()} Kz
                        </button>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={submittingBid}
                        className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3.5 rounded-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      >
                        {submittingBid ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Gavel size={16} /> Enviar Lance Oficial
                          </>
                        )}
                      </button>

                      {buyNowPrice && (
                        <button
                          type="button"
                          onClick={handleBuyNow}
                          disabled={buyingNow}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                        >
                          {buyingNow ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Sparkles size={16} /> Comprar Agora por {formatCurrency(buyNowPrice)}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="p-6 rounded-sm bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center">
                    <Lock className="text-gray-500 w-8 h-8 mb-2" />
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Lances Indisponíveis</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                      {auction.status === AuctionStatus.SCHEDULED 
                        ? "Este leilão ainda está agendado e aceitará lances assim que iniciar." 
                        : "Este leilão já encerrou ou foi cancelado."}
                    </p>
                  </div>
                )}

                {/* Interactive websocket/info widget */}
                <div className="flex items-center gap-3 p-4 bg-slate-900/20 rounded-sm border border-slate-800/60 text-xs text-gray-400">
                  {isAuthenticated ? (
                    <>
                      <div className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </div>
                      <span>Conectado em tempo real com {activeConnections} outros disputadores.</span>
                    </>
                  ) : (
                    <>
                      <Info size={16} className="text-primary" />
                      <span>Faça login para habilitar lances em tempo real instantâneos via WebSocket.</span>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Bids History Panel */}
            <div className="bg-[#0C1B33] rounded-xl border border-slate-800 shadow-xl p-6 flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Histórico de Disputa
                </h3>
                <span className="text-[10px] font-bold text-gray-500 font-mono">{bids.length} lances totais</span>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {bids.length > 0 ? (
                  bids.map((bid, index) => {
                    const isWinner = index === 0 && auction.status === AuctionStatus.ENDED;
                    const isWinningNow = index === 0 && auction.status === AuctionStatus.LIVE;

                    return (
                      <div 
                        key={bid.id} 
                        className={`flex justify-between items-center p-3 rounded-sm border transition-all ${
                          isWinner 
                            ? "bg-green-500/10 border-green-500/30" 
                            : isWinningNow
                            ? "bg-primary/10 border-primary/20 shadow-sm"
                            : "bg-slate-900/40 border-slate-900 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isWinningNow ? "bg-primary text-white" : "bg-slate-800 text-slate-400"
                          }`}>
                            {(bid.bidder?.username || "US")?.substring(0, 2).toUpperCase()}
                          </div>
                          
                          <div>
                            <p className="text-xs font-bold text-white">
                              {bid.bidder?.full_name || bid.bidder?.username || "Disputador Anônimo"}
                            </p>
                            <p className="text-[9px] text-gray-500">
                              {new Date(bid.created_at).toLocaleTimeString("pt-AO", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-xs font-black font-mono ${
                            isWinningNow ? "text-green-400" : isWinner ? "text-green-500" : "text-gray-300"
                          }`}>
                            {formatCurrency(bid.amount)}
                          </p>
                          {isWinningNow && (
                            <span className="inline-flex text-[8px] font-black uppercase text-green-400 tracking-wider">
                              Vencendo
                            </span>
                          )}
                          {isWinner && (
                            <span className="inline-flex text-[8px] font-black uppercase text-green-500 tracking-wider">
                              Arrematou!
                            </span>
                          )}
                          {bid.is_buy_now && (
                            <span className="inline-flex text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1 rounded-sm tracking-wider">
                              Compra Imediata
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <TrendingUp className="text-gray-600 w-8 h-8 mb-2" />
                    <p className="text-xs text-gray-500">Nenhum lance registrado ainda.</p>
                    <p className="text-[10px] text-gray-600 mt-1">Seja o primeiro a dar um lance para este lote!</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
