"use client";

import { useEffect, useState, useCallback } from "react";
import ActionCard from "@/components/common/ActionCard";
import { useAuthStore } from "@/store/auth.store";
import auctionService from "@/services/auction.service";
import type { Auction } from "@/types/auction.types";
import { formatCurrency, getAuctionStatusLabel, auctionStatusColor } from "@/utils/auction";
import { 
  TrendingUp, Gavel, Trophy, Calendar, 
  ArrowRight, Loader2, PlayCircle, Eye
} from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
  const user = useAuthStore((state) => state.user);
  
  const [createdAuctions, setCreatedAuctions] = useState<Auction[]>([]);
  const [biddingAuctions, setBiddingAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch user's own auctions (created)
      const resCreated = await auctionService.list({
        seller_id: user.id,
        page_size: 5,
      });

      // 2. Fetch auctions where user placed bids
      const resBidding = await auctionService.list({
        bidder_id: user.id,
        page_size: 5,
      });

      if (resCreated.success && resCreated.data) {
        setCreatedAuctions(resCreated.data.results);
      }
      if (resBidding.success && resBidding.data) {
        setBiddingAuctions(resBidding.data.results);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Statistics calculations
  const stats = {
    totalCreated: createdAuctions.length,
    activeCreated: createdAuctions.filter(a => a.status === "LIVE").length,
    totalBidding: biddingAuctions.length,
    wonAuctions: biddingAuctions.filter(a => a.status === "ENDED" && a.winner === user?.id).length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs text-gray-500 mt-2 font-medium">Carregando painel do usuário...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto select-none">
      
      {/* WELCOME SECTION */}
      <ActionCard
        title={`Bem-vindo(a) de volta, ${user?.full_name || user?.username || "Licitante"}!`}
        subtitle={`Acompanhe o andamento dos seus lances e gerencie seus leilões ativos diretamente do seu painel.`}
        buttonLabel="Explorar Leilões"
        onButtonClick={() => window.location.href = "/auctions"}
      />

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Meus Leilões Criados", 
            value: stats.totalCreated, 
            icon: Calendar, 
            color: "text-blue-600", 
            bg: "bg-blue-50" 
          },
          { 
            label: "Leilões Ativos (Sendo Vendidos)", 
            value: stats.activeCreated, 
            icon: TrendingUp, 
            color: "text-green-600", 
            bg: "bg-green-50" 
          },
          { 
            label: "Leilões Participando (Bids)", 
            value: stats.totalBidding, 
            icon: Gavel, 
            color: "text-orange-600", 
            bg: "bg-orange-50" 
          },
          { 
            label: "Leilões Arrematados", 
            value: stats.wonAuctions, 
            icon: Trophy, 
            color: "text-yellow-600", 
            bg: "bg-yellow-50" 
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-sm border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-sm ${card.bg} ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
              <p className="text-2xl font-black text-gray-950">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT CREATED AUCTIONS */}
        <div className="bg-white rounded-sm border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
              <span className="text-xs font-bold text-gray-950 uppercase tracking-wider">Meus Leilões Recentes</span>
              <Link href="/user/auctions" className="text-primary hover:text-primary/95 text-[10px] font-bold flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>

            {createdAuctions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-400 font-medium">Nenhum leilão criado por você ainda.</p>
                <Link href="/user/auctions" className="text-xs text-primary font-bold hover:underline mt-1 block">
                  Criar meu primeiro leilão
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {createdAuctions.slice(0, 3).map((auction) => (
                  <div key={auction.id} className="flex items-center justify-between p-3 border border-gray-50 rounded-sm hover:bg-gray-50/50 transition">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-gray-900 line-clamp-1">{auction.item?.title}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-sm text-[7px] font-bold uppercase ${auctionStatusColor(auction.status)}`}>
                          {getAuctionStatusLabel(auction.status)}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold font-mono">ID: #{auction.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 font-bold block">Valor Atual</span>
                      <span className="text-xs font-black text-primary font-mono">{formatCurrency(auction.item?.current_price || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE PARTICIPATING AUCTIONS */}
        <div className="bg-white rounded-sm border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
              <span className="text-xs font-bold text-gray-950 uppercase tracking-wider">Lances e Participações</span>
              <Link href="/user/bids" className="text-primary hover:text-primary/95 text-[10px] font-bold flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>

            {biddingAuctions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-400 font-medium">Você ainda não enviou lances em nenhum leilão.</p>
                <Link href="/auctions" className="text-xs text-primary font-bold hover:underline mt-1 block">
                  Explorar leilões ativos
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {biddingAuctions.slice(0, 3).map((auction) => (
                  <div key={auction.id} className="flex items-center justify-between p-3 border border-gray-50 rounded-sm hover:bg-gray-50/50 transition">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-gray-900 line-clamp-1">{auction.item?.title}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-sm text-[7px] font-bold uppercase ${auctionStatusColor(auction.status)}`}>
                          {getAuctionStatusLabel(auction.status)}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold font-mono">Lances: {auction.bids_count || 0}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 font-bold block">Maior Lance</span>
                      <span className="text-xs font-black text-primary font-mono">{formatCurrency(auction.item?.current_price || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
