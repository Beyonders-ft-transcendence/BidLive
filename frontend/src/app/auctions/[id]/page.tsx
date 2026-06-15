"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Clock, 
  Gavel, 
  ArrowUpRight, 
  Shield, 
  AlertCircle,
  Phone,
  Mail,
  Share2
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
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    async function loadData() {
      try {
        const [auctionResult, bidsResult] = await Promise.allSettled([
          auctionService.retrieve(id),
          auctionService.listBids(id)
        ]);
        
        if (auctionResult.status === 'fulfilled' && auctionResult.value?.success) {
          const data = auctionResult.value.data || null;
          setAuction(data);
          if (data?.item?.images && data.item.images.length > 0) {
            setActiveImage(data.item.images[0].file.url);
          }
        } else {
          console.error("Auction retrieve failed", auctionResult);
          setError("Não foi possível carregar os detalhes do leilão principal.");
        }

        if (bidsResult.status === 'fulfilled' && bidsResult.value?.success) {
          setBids(bidsResult.value.data?.results || []);
        } else {
          console.error("Bids retrieve failed", bidsResult);
        }
      } catch (err) {
        console.error("Error loading auction data", err);
        setError("Erro de conexão ao carregar os detalhes do leilão.");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    
    // Polling for new bids every 5 seconds
    const interval = setInterval(async () => {
      if (!id) return;
      try {
        const [aRes, bRes] = await Promise.allSettled([
          auctionService.retrieve(id),
          auctionService.listBids(id)
        ]);
        if (aRes.status === 'fulfilled' && aRes.value?.success && aRes.value.data) {
          const data = aRes.value.data;
          setAuction(data);
          setActiveImage(prev => prev || data.item.images?.[0]?.file.url || null);
        }
        if (bRes.status === 'fulfilled' && bRes.value?.success && bRes.value.data) {
          setBids(bRes.value.data.results);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [id]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !auction) return;
    
    setSubmittingBid(true);
    setError(null);
    try {
      const res = await auctionService.placeBid(id, { amount: bidAmount });
      if (res.success && res.data) {
        setBidAmount("");
        // Immediately fetch to update list and current price
        const [aRes, bRes] = await Promise.all([
          auctionService.retrieve(id),
          auctionService.listBids(id)
        ]);
        if (aRes.success && aRes.data) {
          const auctionData = aRes.data;
          setAuction(auctionData);
          setActiveImage(prev => prev || auctionData.item.images?.[0]?.file.url || null);
        }
        if (bRes.success && bRes.data) setBids(bRes.data.results);
      } else {
        if (res.errors) {
            setError(Object.values(res.errors).flat().join(" "));
        } else {
            setError(res.message || "Erro ao registrar lance.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao registrar lance. Verifique se você está logado.");
    } finally {
      setSubmittingBid(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  const calculateTimeLeft = (endTime: string, status: string) => {
    if (status === "ENDED" || status === "SOLD") return "Encerrado";
    if (status === "CANCELLED") return "Cancelado";
    
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return "Encerrado";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] font-sans flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-sm animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Carregando detalhes do lote...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] font-sans flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-[#0C1B33] mb-2">Lote não encontrado</h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">O leilão que você está procurando não existe ou foi removido.</p>
          <button onClick={() => router.push('/explore')} className="bg-primary text-white px-6 py-3 rounded-sm font-bold shadow-sm transition-all hover:bg-primary/95">
            Voltar para Explore
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = Number(auction.item.current_price || auction.item.starting_price);
  const minIncrement = Number(auction.item.minimum_increment || 1);
  const minBid = currentPrice + minIncrement;
  const isLive = auction.status === "LIVE";

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans antialiased flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/explore" className="flex items-center hover:text-primary transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Voltar para Lotes
          </Link>
          <span>/</span>
          <span className="text-[#0C1B33] font-medium truncate max-w-xs">{auction.item.title}</span>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Image Gallery & Seller Card */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Main Image and Thumbnails Container */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm"
            >
              {/* Main Large Image */}
              <div className="aspect-video w-full bg-gray-50 relative flex items-center justify-center overflow-hidden rounded-sm border border-gray-100">
                {activeImage ? (
                  <img 
                    src={activeImage} 
                    alt={auction.item.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Gavel size={48} className="mb-2 opacity-50" />
                    <span>Sem imagem disponível</span>
                  </div>
                )}
                
                {isLive && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-sm text-xs font-bold flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-sm bg-white animate-pulse" /> AO VIVO
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-sm text-xs font-bold shadow-sm">
                  Lote #{auction.id}
                </div>
              </div>
              
              {/* Thumbnails Row */}
              {auction.item.images && auction.item.images.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {auction.item.images.map((img) => {
                    const isSelected = activeImage === img.file.url;
                    return (
                      <button 
                        key={img.id} 
                        onClick={() => setActiveImage(img.file.url)}
                        className={`w-20 h-16 shrink-0 rounded-sm overflow-hidden border-2 transition-all ${
                          isSelected ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img.file.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Description Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-extrabold text-[#0C1B33] uppercase tracking-wider mb-3">Descrição</h3>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {auction.item.description || (
                  <span className="italic text-gray-400 font-medium">O vendedor não forneceu uma descrição detalhada para este item.</span>
                )}
              </div>
            </motion.div>

            {/* Seller/Agency Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* Square Profile Badge */}
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary rounded-sm flex items-center justify-center font-bold text-lg shrink-0">
                  {auction.item.seller ? `V${auction.item.seller}` : "BL"}
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0C1B33] text-lg">Vendedor Verificado #{auction.item.seller}</h4>
                  <Link href={`/seller/${auction.item.seller}`} className="text-sm text-primary hover:underline font-semibold flex items-center gap-1">
                    Ver Perfil do Vendedor <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Este lote é oferecido por um vendedor verificado da BidLive. A plataforma assegura a autenticidade e conformidade de todos os lances de acordo com nossos Termos de Parceria. Nossa central de suporte acompanha ativamente a logística de entrega do lote após o encerramento do leilão.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => window.open(`mailto:suporte@bidlive.com.br?subject=Dúvida sobre o Lote #${auction.id}`)}
                  className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-sm text-sm transition-colors"
                >
                  <Mail size={16} /> Enviar Mensagem
                </button>
                <button 
                  onClick={() => alert(`Central de Atendimento BidLive: suporte@bidlive.com.br`)}
                  className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-sm text-sm transition-colors"
                >
                  <Phone size={16} /> Contatar Suporte
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Details, Place Bid, Bids List, Specs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Primary Details Card */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-200 rounded-sm p-6 lg:p-8 shadow-sm"
            >
              {/* Category & Action row */}
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold tracking-wider uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-sm">
                  {auction.item.category_label || "Geral"}
                </span>
                
                {/* Share Icon Button in Square Outline */}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copiado para a área de transferência!");
                  }}
                  className="border border-primary/20 hover:bg-primary/5 p-2 rounded-sm text-primary transition-colors"
                  title="Compartilhar Lote"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Title & Price Column / Flex */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0C1B33] leading-tight">
                    {auction.item.title}
                  </h1>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Lance Atual</p>
                  <p className="text-2xl lg:text-3xl font-black text-primary">
                    {formatCurrency(currentPrice)}
                  </p>
                </div>
              </div>

              {/* Quick Stats Row (similar to Beds/Baths) */}
              <div className="grid grid-cols-3 gap-2 border-y border-gray-100 py-4 mb-6 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Clock size={18} className="text-primary shrink-0" />
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Tempo Restante</span>
                  <span className="text-xs font-bold text-[#0C1B33] truncate w-full px-1">
                    {calculateTimeLeft(auction.end_time, auction.status)}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x border-gray-100">
                  <Gavel size={18} className="text-primary shrink-0" />
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Lances</span>
                  <span className="text-xs font-bold text-[#0C1B33]">
                    {auction.bids_count || 0}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Shield size={18} className="text-primary shrink-0" />
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Condição</span>
                  <span className="text-xs font-bold text-[#0C1B33] capitalize truncate w-full px-1">
                    {auction.item.condition_type?.toLowerCase() || 'Não especificada'}
                  </span>
                </div>
              </div>

              {/* Place Bid Form Container */}
              <div className="mb-8 bg-slate-50 border border-slate-100 p-4 rounded-sm">
                {isLive ? (
                  <form onSubmit={handlePlaceBid} className="flex flex-col gap-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                      <input 
                        type="number" 
                        min={minBid}
                        step={minIncrement}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Mínimo: ${formatCurrency(minBid).replace('R$', '').trim()}`}
                        className="w-full bg-white border border-gray-300 focus:border-primary focus:ring-0 rounded-sm pl-12 pr-4 py-3 font-bold text-[#0C1B33] outline-none transition-colors"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={submittingBid}
                      className="w-full bg-primary hover:bg-primary/95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold tracking-wider uppercase py-3.5 rounded-sm shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {submittingBid ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-sm animate-spin" />
                      ) : (
                        <>
                          Confirmar Lance <ArrowUpRight size={18} />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center">
                      Ao dar um lance, você concorda com as políticas e prazos da BidLive.
                    </p>
                  </form>
                ) : (
                  <div className="bg-gray-100 text-gray-500 font-bold text-center py-4 rounded-sm border border-gray-200">
                    Este leilão encontra-se {auction.status === "SOLD" ? "Vendido" : auction.status === "ENDED" ? "Encerrado" : "Inativo"}.
                  </div>
                )}
              </div>


              {/* Bidding History List */}
              <div className="mb-8 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-extrabold text-[#0C1B33] uppercase tracking-wider">Histórico de Lances</h3>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm">{auction.bids_count || 0} lances</span>
                </div>
                
                <div className="flex flex-col max-h-60 overflow-y-auto pr-1 custom-scrollbar gap-1">
                  {bids.length > 0 ? (
                    bids.map((bid, i) => (
                      <div 
                        key={bid.id} 
                        className={`flex justify-between items-center py-2.5 px-2 rounded-sm transition-all ${
                          i === 0 ? 'bg-green-50/55 border-l-2 border-green-500' : 'border-b border-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold shrink-0 ${
                            i === 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {bid.bidder ? bid.bidder.username.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0C1B33]">
                              {bid.bidder ? bid.bidder.username : 'Anônimo'}
                              {i === 0 && <span className="ml-1 text-[10px] text-green-700 font-extrabold uppercase">(Líder)</span>}
                            </p>
                            <p className="text-[10px] text-gray-400">{new Date(bid.timestamp).toLocaleTimeString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className={`text-xs font-black ${i === 0 ? 'text-green-600' : 'text-[#0C1B33]'}`}>
                          {formatCurrency(bid.amount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-xs text-gray-400 italic">Nenhum lance registrado até o momento. Seja o primeiro!</p>
                  )}
                </div>
              </div>

              {/* Key Features (Termos e Regras) */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-extrabold text-[#0C1B33] uppercase tracking-wider mb-4">Termos e Valores Adicionais</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-500">Preço Inicial</span>
                    <span className="font-bold text-[#0C1B33]">{formatCurrency(auction.item.starting_price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-500">Incremento Mínimo</span>
                    <span className="font-bold text-[#0C1B33]">{formatCurrency(auction.item.minimum_increment)}</span>
                  </div>
                  {auction.item.buy_now_price && (
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100 bg-amber-50/50 p-2 rounded-sm">
                      <span className="font-bold text-amber-800">Comprar Agora (Sem Leilão)</span>
                      <span className="font-extrabold text-amber-900">{formatCurrency(auction.item.buy_now_price)}</span>
                    </div>
                  )}
                  {auction.item.reserve_price && (
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-500">Preço de Reserva</span>
                      <span className={`font-bold ${auction.reserve_met ? 'text-green-600' : 'text-amber-600'}`}>
                        {auction.reserve_met ? 'Alcançado' : 'Não alcançado'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-500">Início</span>
                    <span className="font-bold text-[#0C1B33]">{new Date(auction.start_time).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2">
                    <span className="font-semibold text-gray-500">Fim</span>
                    <span className="font-bold text-[#0C1B33]">{new Date(auction.end_time).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {auction.rules && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-sm text-xs text-blue-800">
                    <strong>Regras Adicionais:</strong> {typeof auction.rules === 'string' ? auction.rules : JSON.stringify(auction.rules)}
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
