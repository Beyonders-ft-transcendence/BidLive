"use client";
import { useEffect, useState } from "react";
import { 
  ChevronDown, 
  SlidersHorizontal, 
  Gavel, 
  Clock, 
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { HTMLMotionProps, motion } from "framer-motion";
import auctionService from "@/services/auction.service";
import type { Auction } from "@/types/auction.types";

interface ScrollAnimatedCardProps extends HTMLMotionProps<"div"> {
  className?: string;
  children: React.ReactNode;
}

function ScrollAnimatedCard({ className, children, ...props }: ScrollAnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-full h-48 bg-gray-200 rounded-sm mb-4"></div>
      <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-12"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export default function ExploreUser() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuctions() {
      try {
        const res = await auctionService.list();
        if (res.success && res.data) {
          setAuctions(res.data.results);
        }
      } catch (error) {
        console.error("Failed to load auctions", error);
      } finally {
        setLoading(false);
      }
    }
    loadAuctions();
  }, []);

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(value));
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

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans antialiased flex flex-col">
      <Header />
      <div className="max-w-7xl mx-auto px-6 w-full flex-1 mb-16">
        {/* Top Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-sm p-2.5 mt-8 max-w-4xl mx-auto flex flex-wrap items-center justify-between shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center flex-1 divide-x divide-gray-100 overflow-x-auto">
            <div className="px-4 lg:px-8 py-2 flex flex-col cursor-pointer hover:bg-gray-50 rounded-sm transition-colors shrink-0">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Categoria</span>
              <span className="text-sm font-bold text-[#0C1B33] flex items-center gap-2">
                Todas as Categorias <ChevronDown size={14} className="text-gray-400" />
              </span>
            </div>
            
            <div className="px-4 lg:px-8 py-2 flex flex-col cursor-pointer hover:bg-gray-50 rounded-sm transition-colors shrink-0">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Status</span>
              <span className="text-sm font-bold text-[#0C1B33] flex items-center gap-2">
                Todos <ChevronDown size={14} className="text-gray-400" />
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pr-2 pl-4 mt-4 lg:mt-0">
            <button className="p-3 border border-gray-200 rounded-sm text-gray-500 hover:bg-gray-50 hover:text-[#0C1B33] transition-colors">
              <SlidersHorizontal size={18} />
            </button>
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-sm text-sm font-bold transition-colors shadow-md shadow-blue-500/10">
              Buscar Lotes!
            </button>
          </div>
        </motion.div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {loading ? (
            <>
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </>
          ) : auctions.length > 0 ? (
            auctions.map((auction) => (
              <ScrollAnimatedCard key={auction.id} className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col hover:border-primary/30 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl lg:text-2xl font-extrabold text-[#0C1B33]">
                    {formatCurrency(auction.item.current_price || auction.item.starting_price)}
                  </h3>
                </div>
                
                <div className="w-full h-48 bg-gray-100 rounded-sm mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  {auction.item.images && auction.item.images.length > 0 ? (
                    <img src={auction.item.images[0].file.url} alt={auction.item.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={40} className="text-gray-300" />
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-sm text-xs font-bold text-[#0C1B33] backdrop-blur-sm shadow-sm">
                    {auction.item.category_label || "Lote"} #{auction.id}
                  </div>
                  {auction.status === "LIVE" && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-sm text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Ao Vivo
                    </div>
                  )}
                </div>
                
                <h4 className="text-sm font-bold text-[#0C1B33] line-clamp-1 mb-1">{auction.item.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                  {auction.item.description || "Nenhuma descrição disponível."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <Link href={`/auctions/${auction.id}`} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                    Detalhes
                  </Link>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5"><Gavel size={14} className="text-gray-400" /> {auction.bids_count || 0}</span>
                    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border ${auction.status === "LIVE" ? "bg-red-50 border-red-100 text-red-600" : "bg-gray-50 border-gray-100"}`}>
                      <Clock size={14} className={auction.status === "LIVE" ? "text-red-500" : "text-gray-400"} /> 
                      {calculateTimeLeft(auction.end_time, auction.status)}
                    </span>
                  </div>
                </div>
              </ScrollAnimatedCard>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              Nenhum leilão encontrado no momento.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
