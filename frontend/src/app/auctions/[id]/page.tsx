"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Clock, Gavel, ArrowUpRight, CheckCircle2, Shield, AlertCircle } from "lucide-react";
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

  useEffect(() => {
    if (!id) return;
    
    async function loadData() {
      try {
        const [auctionRes, bidsRes] = await Promise.all([
          auctionService.retrieve(id),
          auctionService.listBids(id)
        ]);
        
        if (auctionRes.success && auctionRes.data) {
          setAuction(auctionRes.data);
        }
        if (bidsRes.success && bidsRes.data) {
          setBids(bidsRes.data.results);
        }
      } catch (err) {
        console.error("Error loading auction", err);
        setError("Não foi possível carregar os detalhes do leilão.");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    
    // Polling for new bids every 5 seconds
    const interval = setInterval(async () => {
      try {
        const [aRes, bRes] = await Promise.all([
          auctionService.retrieve(id),
          auctionService.listBids(id)
        ]);
        if (aRes.success && aRes.data) setAuction(aRes.data);
        if (bRes.success && bRes.data) setBids(bRes.data.results);
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
      <div className="min-h-screen bg-[#F9FAFB] font-sans flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Carregando detalhes do lote...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] font-sans flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-[#0C1B33] mb-2">Lote não encontrado</h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">O leilão que você está procurando não existe ou foi removido.</p>
          <button onClick={() => router.push('/explore')} className="bg-primary text-white px-6 py-3 rounded-md font-bold">
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
    <div className="min-h-screen bg-[#F9FAFB] font-sans antialiased flex flex-col">
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
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left: Images & Details */}
          <div className="flex-[1.5] flex flex-col gap-8">
            {/* Main Image Gallery */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <div className="aspect-4/3 sm:aspect-video w-full bg-gray-100 relative flex items-center justify-center">
                {auction.item.images && auction.item.images.length > 0 ? (
                  <img 
                    src={auction.item.images[0].file.url} 
                    alt={auction.item.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Gavel size={48} className="mb-2 opacity-50" />
                    <span>Sem imagem disponível</span>
                  </div>
                )}
                
                {isLive && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> AO VIVO
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-lg">
                  Lote #{auction.id}
                </div>
              </div>
              
              {/* Thumbnails (if multiple images) */}
              {auction.item.images && auction.item.images.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto bg-gray-50 border-t border-gray-100">
                  {auction.item.images.map((img) => (
                    <div key={img.id} className="w-20 h-20 shrink-0 rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
                      <img src={img.file.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Description Tab */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:p-8"
            >
              <h2 className="text-xl font-bold text-[#0C1B33] mb-4">Visão Geral do Lote</h2>
              <div className="prose prose-sm sm:prose max-w-none text-gray-600">
                {auction.item.description ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{auction.item.description}</p>
                ) : (
                  <p className="italic text-gray-400">O vendedor não forneceu uma descrição detalhada para este item.</p>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Condição</p>
                    <p className="text-sm font-bold text-[#0C1B33] capitalize">{auction.item.condition_type?.toLowerCase() || 'Não especificada'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vendedor</p>
                    <p className="text-sm font-bold text-[#0C1B33]">Usuário #{auction.item.seller}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Bidding Panel */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Main Action Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-lg p-6 lg:p-8 sticky top-6"
            >
              <div className="mb-2">
                <span className="text-[11px] font-extrabold tracking-[1px] uppercase text-primary bg-primary/10 px-2 py-1 rounded-sm">
                  {auction.item.category_label || "Categoria não definida"}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0C1B33] leading-tight mb-6">
                {auction.item.title}
              </h1>

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Lance Atual</p>
                    <p className={`text-3xl font-black ${isLive ? 'text-green-600' : 'text-[#0C1B33]'}`}>
                      {formatCurrency(currentPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Tempo Restante</p>
                    <p className={`text-lg font-bold flex items-center justify-end gap-1.5 ${isLive ? 'text-red-500' : 'text-gray-500'}`}>
                      <Clock size={16} />
                      {calculateTimeLeft(auction.end_time, auction.status)}
                    </p>
                  </div>
                </div>
              </div>

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
                      className="w-full bg-white border-2 border-gray-200 focus:border-primary focus:ring-0 rounded-lg pl-12 pr-4 py-3.5 font-bold text-[#0C1B33] outline-none transition-colors"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingBid}
                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold tracking-[1px] uppercase py-4 rounded-lg shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {submittingBid ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirmar Lance <ArrowUpRight size={18} />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-1">Ao dar um lance, você concorda com nossos termos de compromisso de compra.</p>
                </form>
              ) : (
                <div className="bg-gray-100 text-gray-500 font-bold text-center py-4 rounded-lg border border-gray-200">
                  Este leilão encontra-se {auction.status === "SOLD" ? "Vendido" : auction.status === "ENDED" ? "Encerrado" : "Inativo"}.
                </div>
              )}
            </motion.div>

            {/* Bids History Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:p-8"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-[#0C1B33] flex items-center gap-2">
                  <Gavel size={20} className="text-primary" /> Histórico de Lances
                </h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  {auction.bids_count || 0} lances
                </span>
              </div>

              <div className="flex flex-col gap-0 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {bids.length > 0 ? (
                  bids.map((bid, i) => (
                    <div key={bid.id} className={`flex justify-between items-center py-3 ${i !== bids.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {bid.bidder ? bid.bidder.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0C1B33]">{bid.bidder ? bid.bidder.username : 'Anônimo'}</p>
                          <p className="text-[10px] text-gray-400">{new Date(bid.timestamp).toLocaleTimeString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className={`text-sm font-black ${i === 0 ? 'text-green-600' : 'text-[#0C1B33]'}`}>
                        {formatCurrency(bid.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhum lance foi dado ainda.<br/>Seja o primeiro!
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
