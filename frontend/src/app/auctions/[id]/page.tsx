"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Gavel,
  ArrowUpRight,
  CheckCircle2,
  Shield,
  AlertCircle,
  Tag,
  User,
  CalendarDays,
  TrendingUp,
  Video,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import auctionService from "@/services/auction.service";
import type { Auction, Bid } from "@/types/auction.types";
import { motion } from "framer-motion";

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeStream, setActiveStream] = useState<any | null>(null);
  const [isWatchingStream, setIsWatchingStream] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const hasToken = typeof window !== "undefined" && !!window.localStorage.getItem("bidlive.auth.access_token");
        
        const promises: Promise<any>[] = [
          auctionService.retrieve(id),
          auctionService.listBids(id),
        ];
        
        if (hasToken) {
          promises.push(auctionService.listStreams(id));
        }

        const results = await Promise.allSettled(promises);
        const auctionResult = results[0];
        const bidsResult = results[1];
        const streamResult = hasToken ? results[2] : null;

        if (
          auctionResult.status === "fulfilled" &&
          auctionResult.value?.success
        ) {
          setAuction(auctionResult.value.data || null);
        } else {
          setError("Não foi possível carregar os detalhes do leilão.");
        }

        if (bidsResult.status === "fulfilled" && bidsResult.value?.success) {
          setBids(bidsResult.value.data?.results || []);
        }

        if (streamResult && streamResult.status === "fulfilled" && streamResult.value?.success && streamResult.value.data) {
          const live = streamResult.value.data.find((s: any) => s.status === "LIVE");
          setActiveStream(live || null);
          if (live) {
            setIsWatchingStream(true);
            setViewerCount(live.viewer_count || 1);
          }
        }
      } catch (err) {
        setError("Erro de conexão ao carregar os detalhes do leilão.");
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const interval = setInterval(async () => {
      if (!id) return;
      try {
        const hasToken = typeof window !== "undefined" && !!window.localStorage.getItem("bidlive.auth.access_token");
        
        const promises: Promise<any>[] = [
          auctionService.retrieve(id),
          auctionService.listBids(id),
        ];
        
        if (hasToken) {
          promises.push(auctionService.listStreams(id));
        }

        const results = await Promise.allSettled(promises);
        const aRes = results[0];
        const bRes = results[1];
        const sRes = hasToken ? results[2] : null;

        if (aRes.status === "fulfilled" && aRes.value?.success && aRes.value.data)
          setAuction(aRes.value.data);
        if (bRes.status === "fulfilled" && bRes.value?.success && bRes.value.data)
          setBids(bRes.value.data.results);
        if (sRes && sRes.status === "fulfilled" && sRes.value?.success && sRes.value.data) {
          const live = sRes.value.data.find((s: any) => s.status === "LIVE");
          setActiveStream(live || null);
          if (live) {
            setViewerCount(live.viewer_count || 1);
          }
        }
      } catch (e) {}
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (auction) {
      const cPrice = Number(auction.item.current_price || auction.item.starting_price);
      const inc = Number(auction.item.minimum_increment || 1);
      const newMinBid = cPrice + inc;
      
      setBidAmount((prev) => {
        if (!prev || Number(prev) < newMinBid) {
          return String(newMinBid);
        }
        return prev;
      });
    }
  }, [auction?.item?.current_price, auction?.item?.starting_price, auction?.item?.minimum_increment]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !auction) return;

    // Redirecionamento instantâneo se não houver token (usuário offline/não logado)
    if (typeof window !== 'undefined' && !localStorage.getItem('bidlive.auth.access_token')) {
      router.push('/signin');
      return;
    }

    setSubmittingBid(true);
    setError(null);
    try {
      const res = await auctionService.placeBid(id, { amount: bidAmount });
      if (res.success && res.data) {
        setBidAmount("");
        const [aRes, bRes] = await Promise.all([
          auctionService.retrieve(id),
          auctionService.listBids(id),
        ]);
        if (aRes.success && aRes.data) setAuction(aRes.data);
        if (bRes.success && bRes.data) setBids(bRes.data.results);
      } else {
        if (res.errors) {
          setError(Object.values(res.errors).flat().join(" "));
        } else {
          setError(res.message || "Erro ao registrar lance.");
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Se a API retornar erro de autenticação, redireciona de imediato para a tela de login
        router.push('/signin');
      } else if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          setError(Object.values(errorData.errors).flat().join(" "));
        } else {
          setError(errorData.message || "Valor inválido. Verifique o seu lance.");
        }
      } else {
        setError("Erro de conexão. Não foi possível registrar o lance.");
      }
    } finally {
      setSubmittingBid(false);
    }
  };

  const formatCurrency = (value: string | number) =>
    new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(Number(value));

  const calculateTimeLeft = (endTime: string, status: string) => {
    if (status === "ENDED" || status === "SOLD") return "Encerrado";
    if (status === "CANCELLED") return "Cancelado";
    const end = new Date(endTime).getTime();
    const diff = end - Date.now();
    if (diff <= 0) return "Encerrado";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center gap-4">
        <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium tracking-wide">
          Carregando lote...
        </p>
      </div>
    );
  }

  /* ─── Not Found ─── */
  if (!auction) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <AlertCircle size={44} className="text-red-400" />
          <h2 className="text-xl font-bold text-[#0C1B33]">
            Lote não encontrado
          </h2>
          <p className="text-sm text-gray-400 text-center max-w-sm">
            O leilão que você está procurando não existe ou foi removido.
          </p>
          <button
            onClick={() => router.push("/explore")}
            className="mt-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-sm hover:bg-primary/90 transition-colors"
          >
            Voltar para Explorar
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = Number(
    auction.item.current_price || auction.item.starting_price
  );
  const minIncrement = Number(auction.item.minimum_increment || 1);
  const minBid = currentPrice + minIncrement;
  const isLive = auction.status === "LIVE";
  const images = auction.item.images || [];

  /* ─── Page ─── */
  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans antialiased flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link
            href="/explore"
            className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
          >
            <ChevronLeft size={14} />
            Explorar Lotes
          </Link>
          <span>/</span>
          <span className="text-[#0C1B33] font-semibold truncate max-w-xs">
            {auction.item.title}
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm flex items-start gap-3 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 lg:gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-6">

            {/* Image Gallery / Live Stream Player */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col"
            >
              {/* Tab Header if active stream exists */}
              {activeStream && (
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => setIsWatchingStream(false)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition duration-150 cursor-pointer ${
                      !isWatchingStream
                        ? "text-primary bg-white border-b-2 border-primary"
                        : "text-gray-400 hover:text-slate-700"
                    }`}
                  >
                    Galeria de Fotos
                  </button>
                  <button
                    onClick={() => setIsWatchingStream(true)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                      isWatchingStream
                        ? "text-red-500 bg-white border-b-2 border-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Transmissão Ao Vivo (LIVE)
                  </button>
                </div>
              )}

              {isWatchingStream && activeStream ? (
                /* LIVE STREAM PLAYER */
                <div className="relative aspect-video bg-slate-950 flex flex-col justify-between p-4 text-white">
                  {/* Top bar info */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm animate-pulse flex items-center gap-1">
                        <span className="w-1 h-1 bg-white rounded-full" />
                        AO VIVO
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 truncate max-w-[200px]">
                        {activeStream.title}
                      </span>
                    </div>

                    <div className="bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[9px] font-bold flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                      {viewerCount} assistindo
                    </div>
                  </div>

                  {/* Simulated Livestream Video Area */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/20 via-slate-900 to-slate-950">
                    {/* Visual stream capture animation / mock video */}
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 animate-pulse mb-3">
                      <Video size={24} className="text-white" />
                    </div>
                    <p className="text-xs font-bold text-slate-100 uppercase tracking-widest leading-none">
                      Transmitindo via LiveKit Ingress
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-2 bg-black/30 px-3 py-1 rounded-sm border border-slate-800">
                      ROOM: {activeStream.stream_meta?.livekit?.room_name || `room_auction_${id}`}
                    </p>
                  </div>

                  {/* Bottom bar controls */}
                  <div className="flex items-center justify-between z-10 w-full pt-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      Streamer: @{activeStream.streamer?.username || "Vendedor"}
                    </span>
                    
                    <span className="text-[9px] text-slate-500 font-mono">
                      Protocol: WebRTC | Codec: H264
                    </span>
                  </div>
                </div>
              ) : (
                /* STANDARD IMAGE GALLERY */
                <>
                  <div className="relative aspect-video bg-gray-100">
                    {images.length > 0 ? (
                      <img
                        src={images[activeImage]?.file?.url}
                        alt={auction.item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <Gavel size={44} className="mb-2" />
                        <span className="text-sm">Sem imagem</span>
                      </div>
                    )}

                    {/* Status badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-sm text-[#0C1B33] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
                        Lote #{auction.id}
                      </span>
                      {isLive && (
                        <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Ao Vivo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3 border-t border-gray-100 bg-gray-50 overflow-x-auto">
                      {images.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveImage(i)}
                          className={`w-16 h-16 shrink-0 rounded-sm overflow-hidden border-2 transition-colors cursor-pointer ${
                            activeImage === i
                              ? "border-primary"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={img.file.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="bg-white border border-gray-200 rounded-sm shadow-sm"
            >
              {/* Section: Description */}
              <div className="p-6 lg:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Descrição
                </p>
                <h2 className="text-base font-bold text-[#0C1B33] mb-3">
                  Visão Geral do Lote
                </h2>
                {auction.item.description ? (
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                    {auction.item.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-300">
                    O vendedor não forneceu uma descrição detalhada.
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Section: Specs grid — same layout as "Key Features" in reference */}
              <div className="p-6 lg:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Informações do Lote
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                  {[
                    {
                      icon: <Shield size={13} className="text-primary" />,
                      label: "Condição",
                      value: auction.item.condition_type?.toLowerCase() || "—",
                    },
                    {
                      icon: <User size={13} className="text-primary" />,
                      label: "Vendedor",
                      value: `ID #${auction.item.seller}`,
                    },
                    {
                      icon: <Tag size={13} className="text-primary" />,
                      label: "Preço Inicial",
                      value: formatCurrency(auction.item.starting_price),
                    },
                    {
                      icon: <TrendingUp size={13} className="text-primary" />,
                      label: "Incremento Mín.",
                      value: formatCurrency(auction.item.minimum_increment),
                    },
                    {
                      icon: <CalendarDays size={13} className="text-primary" />,
                      label: "Abertura",
                      value: new Date(auction.start_time).toLocaleString(
                        "pt-BR",
                        { dateStyle: "short", timeStyle: "short" }
                      ),
                    },
                    {
                      icon: <CalendarDays size={13} className="text-primary" />,
                      label: "Encerramento",
                      value: new Date(auction.end_time).toLocaleString(
                        "pt-BR",
                        { dateStyle: "short", timeStyle: "short" }
                      ),
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-[#0C1B33] flex items-center gap-1.5">
                        {item.icon}
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Buy Now / Reserve */}
              {(auction.item.buy_now_price ||
                auction.item.reserve_price ||
                auction.rules) && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="p-6 lg:p-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                      Valores Adicionais
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {auction.item.buy_now_price && (
                        <div className="border border-gray-100 rounded-sm p-4 bg-gray-50">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                            Comprar Agora
                          </p>
                          <p className="text-lg font-black text-primary">
                            {formatCurrency(auction.item.buy_now_price)}
                          </p>
                        </div>
                      )}
                      {auction.item.reserve_price && (
                        <div className="border border-gray-100 rounded-sm p-4 bg-gray-50">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                            Preço de Reserva
                          </p>
                          <p className="text-sm font-semibold text-[#0C1B33] flex items-center gap-1">
                            {auction.reserve_met ? (
                              <>
                                <CheckCircle2 size={13} className="text-green-500" />
                                <span className="text-green-600">Atingido</span>
                              </>
                            ) : (
                              "Não Atingido"
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    {auction.rules && (
                      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-sm p-4 text-xs text-amber-700">
                        <strong>Regras Específicas:</strong>{" "}
                        {JSON.stringify(auction.rules)}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-5">

            {/* Bidding Card — mirrors the price/action panel in the reference */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/8 px-2 py-0.5 rounded-sm mb-3">
                  {auction.item.category_label || "Leilão"}
                </span>
                <h1 className="text-xl font-extrabold text-[#0C1B33] leading-snug">
                  {auction.item.title}
                </h1>
              </div>

              {/* Price row — analogous to the "$848,000" block in the reference */}
              <div className="px-6 py-5 flex items-end justify-between border-b border-gray-100 bg-gray-50/60">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Lance Atual
                  </p>
                  <p
                    className={`text-3xl font-black tracking-tight ${
                      isLive ? "text-primary" : "text-[#0C1B33]"
                    }`}
                  >
                    {formatCurrency(currentPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Tempo Restante
                  </p>
                  <p
                    className={`text-sm font-bold flex items-center justify-end gap-1 ${
                      isLive ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    <Clock size={13} />
                    {calculateTimeLeft(auction.end_time, auction.status)}
                  </p>
                </div>
              </div>

              {/* Bid form or closed state */}
              <div className="px-6 py-5">
                {isLive ? (
                  <form onSubmit={handlePlaceBid} className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Valor do Lance
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 select-none">
                        R$
                      </span>
                      <input
                        type="number"
                        min={minBid}
                        step={minIncrement}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={formatCurrency(minBid)
                          .replace("Kz", "")
                          .trim()}
                        className="w-full border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none rounded-sm pl-10 pr-4 py-3 text-sm font-semibold text-[#0C1B33] bg-white transition-colors"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Lance mínimo:{" "}
                      <span className="font-semibold text-[#0C1B33]">
                        {formatCurrency(minBid)}
                      </span>
                    </p>
                    <button
                      type="submit"
                      disabled={submittingBid}
                      className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-widest py-3.5 rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {submittingBid ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Confirmar Lance
                          <ArrowUpRight size={15} />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-300 text-center leading-relaxed">
                      Ao dar um lance, você concorda com nossos termos de
                      compromisso de compra.
                    </p>
                  </form>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-sm text-center py-5">
                    <p className="text-sm font-semibold text-gray-400">
                      Este leilão está{" "}
                      {auction.status === "SOLD"
                        ? "Vendido"
                        : auction.status === "ENDED"
                        ? "Encerrado"
                        : "Inativo"}
                      .
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Bids History Card */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden"
            >
              {/* Header row */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gavel size={15} className="text-primary" />
                  <h3 className="text-sm font-bold text-[#0C1B33]">
                    Histórico de Lances
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2.5 py-1 rounded-sm">
                  {auction.bids_count || 0} lances
                </span>
              </div>

              {/* List */}
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {bids.length > 0 ? (
                  bids.map((bid, i) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar initial */}
                        <div
                          className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold shrink-0 ${
                            i === 0
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {bid.bidder
                            ? bid.bidder.username.charAt(0).toUpperCase()
                            : "A"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0C1B33] leading-tight">
                            {bid.bidder ? bid.bidder.username : "Anônimo"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(bid.timestamp).toLocaleTimeString(
                              "pt-BR",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-black ${
                          i === 0 ? "text-primary" : "text-[#0C1B33]"
                        }`}
                      >
                        {formatCurrency(bid.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center">
                    <Gavel size={28} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">
                      Nenhum lance ainda.
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Seja o primeiro a dar um lance!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}