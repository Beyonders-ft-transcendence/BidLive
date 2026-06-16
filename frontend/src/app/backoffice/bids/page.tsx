"use client";

import { useState, useMemo } from "react";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import TableSection from "@/components/common/TableSection";
import { useAuctionsQuery, useAuctionBidsQuery } from "@/hooks/useAuction";
import type { Auction, Bid } from "@/types/auction.types";
import { formatCurrency, getAuctionStatusLabel, auctionStatusColor } from "@/utils/auction";
import {
  Gavel,
  History,
  User,
  Search,
  Monitor,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export default function Bids() {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Search/Filter state for auctions list
  const [auctionSearch, setAuctionSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Auctions via React Query
  const { data: auctionsData, isLoading: loadingAuctions } = useAuctionsQuery({
    search: auctionSearch || undefined,
    page_size: 50,
  });
  const auctions = auctionsData?.results || [];

  // Fetch Bids via React Query
  const bidsParams = useMemo(() => ({
    page: currentPage,
    page_size: pageSize,
  }), [currentPage, pageSize]);

  const { data: bidsData, isLoading: loadingBids } = useAuctionBidsQuery(
    selectedAuction?.id || 0,
    bidsParams
  );
  const bids = bidsData?.results || [];
  const totalBidsCount = bidsData?.count || 0;

  // Handle selecting an auction
  const handleSelectAuction = (auction: Auction) => {
    setSelectedAuction(auction);
    setCurrentPage(1);
  };

  // Helper date formatter
  const formatDateSimple = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("pt-PT", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-5 p-1 select-none">
      
      {/* HEADER */}
      <ActionCard
        title="Histórico de Lances"
        subtitle="Selecione um leilão e monitore em tempo real todas as ofertas enviadas pelos licitantes, incluindo carimbos de IP e metadados de auditoria."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Search & Select Auction (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-sm border border-gray-100 p-4 shadow-sm flex flex-col min-h-[500px]">
          <span className="text-xs font-bold text-gray-950 mb-3 block uppercase tracking-wider">Leilões Disponíveis</span>
          
          {/* Search Input */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Buscar leilão por título..."
              value={auctionSearch}
              onChange={(e) => setAuctionSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
            />
          </div>

          {/* Auctions List */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[550px] scrollbar-none pr-1">
            {loadingAuctions ? (
              <p className="text-center text-xs text-gray-400 py-8 font-medium">Buscando leilões no banco...</p>
            ) : auctions.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8 font-medium">Nenhum leilão correspondente.</p>
            ) : (
              auctions.map((auction) => {
                const isSelected = selectedAuction?.id === auction.id;
                return (
                  <button
                    key={auction.id}
                    onClick={() => handleSelectAuction(auction)}
                    className={`w-full text-left p-3 rounded-sm border transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-primary/5 border-primary/20 shadow-sm"
                        : "bg-white border-gray-100 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-gray-900"} leading-snug line-clamp-2`}>
                        {auction.item?.title || "Leilão sem título"}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[7px] font-bold uppercase shrink-0 ${auctionStatusColor(auction.status)}`}>
                        {getAuctionStatusLabel(auction.status)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-[9px] text-gray-400 font-bold font-mono">
                      <span>ID: #{auction.id}</span>
                      <span className="text-primary font-sans font-bold">
                        {formatCurrency(auction.item?.current_price || 0)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Bids History Table (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-sm border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
          {!selectedAuction ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-4 animate-pulse">
                <Gavel size={20} />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Nenhum Leilão Selecionado</h4>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                Por favor, escolha um leilão na lista ao lado para carregar e monitorar seu histórico completo de lances.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Selected Auction Brief */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-primary uppercase tracking-wider font-mono">Monitorando Leilão</span>
                  <h4 className="text-sm font-black text-gray-950 leading-tight mt-0.5">{selectedAuction.item?.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Preço Corrente</span>
                  <span className="text-sm font-black text-primary font-mono">{formatCurrency(selectedAuction.item?.current_price || 0)}</span>
                </div>
              </div>

              {/* Table Section */}
              <TableSection
                entityName="lances"
                pagination={{
                  currentPage: currentPage,
                  totalCount: totalBidsCount,
                  pageSize: pageSize,
                  onPageChange: (page) => setCurrentPage(page)
                }}
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                      <th className="p-3">ID Lance</th>
                      <th className="py-3">Licitante (Usuário)</th>
                      <th className="py-3">Valor Ofertado</th>
                      <th className="py-3">IP Origem</th>
                      <th className="py-3">Metadados</th>
                      <th className="py-3">Horário</th>
                      <th className="py-3 text-right pr-6">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[10px] text-gray-700">
                    {loadingBids ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                          Carregando lances da API...
                        </td>
                      </tr>
                    ) : bids.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                          Nenhum lance ofertado neste leilão ainda.
                        </td>
                      </tr>
                    ) : (
                      bids.map((bid) => (
                        <tr key={bid.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-gray-400">#{bid.id}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <User size={10} className="text-gray-400" />
                              <span className="font-bold text-gray-950">
                                {bid.bidder?.full_name || bid.bidder?.username || `Licitante #${bid.bidder_id}`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 font-bold text-primary font-mono">{formatCurrency(bid.amount)}</td>
                          <td className="py-3 font-mono text-gray-500 text-[9px]">
                            <div className="flex items-center gap-1">
                              <Monitor size={10} className="text-gray-400" />
                              <span>{bid.ip_address || "—"}</span>
                            </div>
                          </td>
                          <td className="py-3 text-gray-500 font-mono text-[8px] max-w-[120px] truncate">
                            {bid.metadata ? JSON.stringify(bid.metadata) : "—"}
                          </td>
                          <td className="py-3 font-bold text-gray-400">{formatDateSimple(bid.created_at || bid.timestamp)}</td>
                          <td className="py-3 text-right pr-6">
                            {bid.is_buy_now ? (
                              <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100">
                                Compra Imediata
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100">
                                Lance Padrão
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableSection>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
