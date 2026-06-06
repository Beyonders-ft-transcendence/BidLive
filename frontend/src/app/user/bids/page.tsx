"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { formatCurrency, auctionStatusColor } from "@/utils/auction";
import TableFilters from "@/components/common/TableFilters";
import ActionCard from "@/components/common/ActionCard";
import Modal from "@/components/common/Modal";
import { useAuthStore } from "@/store/auth.store";
import auctionService from "@/services/auction.service";
import { type Auction, type Bid } from "@/types/auction.types";
import {
  Eye, Gavel, Trophy, TrendingDown,
  ChevronLeft, ChevronRight, X, Clock, AlertTriangle,
  ArrowUp, Bell, Loader2
} from "lucide-react";

type BidStatus = "Vencendo" | "Ultrapassado" | "Ganhou" | "Perdeu" | "Ao Vivo";

interface BiddingItem {
  id: string;
  auction: Auction;
  bids: Bid[];
  myBid: number;
  topBid: number;
  position: number;
  totalBidders: number;
  status: BidStatus;
  timeLeft: string;
  bidDate: string;
  history: { date: string; value: number }[];
}

const BID_STATUS_STYLE: Record<BidStatus, { bg: string; dot: string; text: string }> = {
  "Vencendo": { bg: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", text: "Vencendo" },
  "Ultrapassado": { bg: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500 animate-pulse", text: "Ultrapassado" },
  "Ganhou": { bg: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", text: "Ganhou" },
  "Perdeu": { bg: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400", text: "Perdeu" },
  "Ao Vivo": { bg: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500 animate-pulse", text: "Ao Vivo" },
};

const ALERT_STYLES = {
  danger: "border-red-200 bg-red-50 text-red-700",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
  success: "border-green-200 bg-green-50 text-green-700",
};

export default function MeusLances() {
  const user = useAuthStore((state) => state.user);

  // States
  const [items, setItems] = useState<BiddingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [historyBid, setHistoryBid] = useState<BiddingItem | null>(null);
  const [newBidModal, setNewBidModal] = useState<BiddingItem | null>(null);
  const [newBidValue, setNewBidValue] = useState("");
  const [bidSubmitLoading, setBidSubmitLoading] = useState(false);
  const [bidSubmitError, setBidSubmitError] = useState("");
  const [showAlerts, setShowAlerts] = useState(true);

  // Fetch Bids and calculate detailed info
  const fetchBidsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get all auctions the user bid on
      const res = await auctionService.list({ bidder_id: user.id, page_size: 100 });
      if (res.success && res.data) {
        const auctionsList = res.data.results;
        
        // Fetch bids in parallel for each auction
        const detailed = await Promise.all(
          auctionsList.map(async (auction) => {
            const bidsRes = await auctionService.listBids(auction.id, { page_size: 100 });
            const bids = bidsRes.success && bidsRes.data ? bidsRes.data.results : [];
            
            // Sort bids by amount descending
            const sortedBids = [...bids].sort((a, b) => Number(b.amount) - Number(a.amount));
            
            // Filter user bids
            const userBids = sortedBids.filter(b => b.bidder?.id === user.id || b.bidder_id === user.id);
            const myBid = userBids.length > 0 ? Number(userBids[0].amount) : 0;
            const topBid = Number(auction.item?.current_price || 0);

            // Find position of highest user bid
            const position = sortedBids.findIndex(b => b.bidder?.id === user.id || b.bidder_id === user.id) + 1;
            
            // Calculate unique bidders
            const uniqueBidders = new Set(bids.map(b => b.bidder?.id || b.bidder_id)).size;

            // Calculate status
            let status: BidStatus = "Ao Vivo";
            if (auction.status === "LIVE") {
              status = position === 1 ? "Vencendo" : "Ultrapassado";
            } else if (auction.status === "ENDED" || auction.status === "SOLD") {
              status = auction.winner === user.id ? "Ganhou" : "Perdeu";
            } else if (auction.status === "CANCELLED") {
              status = "Perdeu";
            }

            // Time Left format
            let timeLeft = "Encerrado";
            if (auction.status === "LIVE") {
              const diffMs = new Date(auction.end_time).getTime() - Date.now();
              if (diffMs > 0) {
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                timeLeft = `${diffHrs}h ${diffMins}m`;
              }
            }

            // Latest bid date
            const bidDate = userBids.length > 0 
              ? new Date(userBids[0].created_at || userBids[0].timestamp).toLocaleDateString("pt-PT") 
              : "—";

            // Bid history for graphs/logs
            const history = userBids
              .reverse()
              .map(b => ({
                date: new Date(b.created_at || b.timestamp).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }),
                value: Number(b.amount),
              }));

            return {
              id: String(auction.id),
              auction,
              bids,
              myBid,
              topBid,
              position,
              totalBidders: uniqueBidders,
              status,
              timeLeft,
              bidDate,
              history,
            };
          })
        );

        setItems(detailed);
      }
    } catch (err) {
      console.error("Erro ao obter dados de bids:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBidsData();
  }, [fetchBidsData]);

  // Submit Bid
  const handlePlaceBid = async () => {
    if (!newBidModal || !newBidValue) return;
    const valueNum = Number(newBidValue);
    const minInc = Number(newBidModal.auction.item?.minimum_increment || 1);
    const minBidRequired = newBidModal.topBid + minInc;

    if (valueNum < minBidRequired) {
      setBidSubmitError(`O lance mínimo deve ser de pelo menos ${formatCurrency(minBidRequired)}`);
      return;
    }

    setBidSubmitLoading(true);
    setBidSubmitError("");
    try {
      const res = await auctionService.placeBid(newBidModal.auction.id, { amount: valueNum });
      if (res.success) {
        setNewBidModal(null);
        setNewBidValue("");
        fetchBidsData();
      } else if (res.errors) {
        setBidSubmitError(Object.values(res.errors)[0]?.[0] || "Erro ao realizar lance.");
      }
    } catch (err: any) {
      console.error("Erro ao enviar bid:", err);
      setBidSubmitError(err.response?.data?.message || "Ocorreu um erro no servidor.");
    } finally {
      setBidSubmitLoading(false);
    }
  };

  // Filtered items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.auction.item?.title?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  // Totals
  const totals = useMemo(() => ({
    total: items.length,
    vencendo: items.filter(b => b.status === "Vencendo").length,
    perdidos: items.filter(b => b.status === "Perdeu").length,
    ganhos: items.filter(b => b.status === "Ganhou").length,
  }), [items]);

  // Real Alerts
  const alerts = useMemo(() => {
    const list: { type: "danger" | "warning" | "success"; icon: any; text: string; time: string }[] = [];
    items.forEach((item) => {
      if (item.status === "Ultrapassado") {
        list.push({
          type: "danger",
          icon: AlertTriangle,
          text: `Seu lance no leilão "${item.auction.item?.title}" foi ultrapassado!`,
          time: "Pendente",
        });
      } else if (item.status === "Ganhou") {
        list.push({
          type: "success",
          icon: Trophy,
          text: `Parabéns! Você arrematou o item "${item.auction.item?.title}"!`,
          time: "Concluído",
        });
      } else if (item.status === "Vencendo") {
        const diffMs = new Date(item.auction.end_time).getTime() - Date.now();
        const diffHrs = diffMs / (1000 * 60 * 60);
        if (diffHrs > 0 && diffHrs < 12) {
          list.push({
            type: "warning",
            icon: Clock,
            text: `O leilão "${item.auction.item?.title}" encerra em menos de ${Math.ceil(diffHrs)} horas! Acompanhe de perto.`,
            time: "Urgente",
          });
        }
      }
    });
    return list.slice(0, 3);
  }, [items]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  return (
    <div className="space-y-6 select-none">
      
      {/* HEADER */}
      <ActionCard 
        title="Meus Lances" 
        subtitle="Acompanhe seus lances e posições em tempo real" 
        buttonLabel="Explorar Leilões" 
        onButtonClick={() => window.location.href = "/auctions"}
      />

      {/* DYNAMIC ALERTS */}
      {showAlerts && alerts.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Bell size={13} className="text-primary" /> Alertas Relevantes
            </h3>
            <button onClick={() => setShowAlerts(false)} className="text-[10px] text-gray-400 hover:text-gray-600 font-bold">Ocultar</button>
          </div>
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-sm border text-xs ${ALERT_STYLES[alert.type]}`}>
              <alert.icon size={15} className="shrink-0" />
              <span className="flex-1 font-medium">{alert.text}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 shrink-0">{alert.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Leilões Ofertados", value: totals.total, icon: Gavel, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Lances Vencendo", value: totals.vencendo, icon: TrendingDown, color: "text-green-600", bg: "bg-green-50" },
          { label: "Lances Ultrapassados", value: totals.total - totals.vencendo - totals.ganhos - totals.perdidos, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Leilões Arrematados", value: totals.ganhos, icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-sm shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-sm ${card.bg} ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{card.label}</p>
              <p className="text-xl font-black text-gray-950 mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-gray-100 p-4 rounded-sm shadow-sm overflow-hidden">
        <TableFilters
          search={search}
          onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          filters={{ status: statusFilter }}
          onFilterChange={(name, val) => { if (name === "status") { setStatusFilter(val); setCurrentPage(1); } }}
          onClearFilters={() => { setSearch(""); setStatusFilter(""); setCurrentPage(1); }}
          filterOptions={{
            statusOptions: [
              { value: "", label: "Todos" },
              { value: "Vencendo", label: "Vencendo" },
              { value: "Ultrapassado", label: "Ultrapassado" },
              { value: "Ganhou", label: "Ganhou" },
              { value: "Perdeu", label: "Perdeu" },
            ],
          }}
        />

        <div className="overflow-x-auto mt-2">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="p-3">Leilão</th>
                <th className="py-3">Seu Lance</th>
                <th className="py-3">Maior Lance</th>
                <th className="py-3 text-center">Posição</th>
                <th className="py-3">Situação</th>
                <th className="py-3">Tempo Restante</th>
                <th className="py-3 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[11px] text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">Obtendo dados de lances...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">Nenhum lance encontrado.</td>
                </tr>
              ) : paginated.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50/5 border border-primary/10 rounded-sm flex items-center justify-center text-base shrink-0 font-bold">
                        {item.auction.item?.images?.[0]?.file?.url ? (
                          <img src={item.auction.item.images[0].file.url} alt="" className="w-full h-full object-cover rounded-sm" />
                        ) : "📦"}
                      </div>
                      <div>
                        <span className="font-bold text-gray-950 block">{item.auction.item?.title || "Leilão"}</span>
                        <span className="text-[9px] text-gray-400 font-bold font-mono">ID: #{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="font-bold text-gray-900 font-mono">{formatCurrency(item.myBid)}</td>
                  <td className={`font-bold font-mono ${item.myBid >= item.topBid ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(item.topBid)}
                  </td>
                  <td className="text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${item.position === 1 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : "bg-gray-100 text-gray-600"}`}>
                      {item.position}º
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase border ${BID_STATUS_STYLE[item.status].bg}`}>
                      {BID_STATUS_STYLE[item.status].text}
                    </span>
                  </td>
                  <td className="font-bold">
                    {item.status === "Ultrapassado" ? (
                      <span className="text-red-600 font-bold animate-pulse">{item.timeLeft}</span>
                    ) : (
                      <span className="text-gray-500">{item.timeLeft}</span>
                    )}
                  </td>
                  <td className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        title="Ver Leilão" 
                        onClick={() => window.location.href = `/auctions/${item.id}`}
                        className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-600 transition"
                      >
                        <Eye size={13} />
                      </button>
                      {(item.status === "Vencendo" || item.status === "Ultrapassado" || item.status === "Ao Vivo") && (
                        <button 
                          title="Dar Novo Lance" 
                          onClick={() => { setNewBidModal(item); setNewBidValue(""); setBidSubmitError(""); }}
                          className="p-1.5 rounded-sm hover:bg-green-50 text-green-600 transition"
                        >
                          <ArrowUp size={13} />
                        </button>
                      )}
                      <button 
                        title="Histórico de Lances" 
                        onClick={() => setHistoryBid(item)}
                        className="p-1.5 rounded-sm hover:bg-purple-50 text-purple-600 transition"
                      >
                        <Clock size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-gray-100 mt-2">
            <div className="text-xs text-gray-500 font-medium">
              Mostrando {Math.min(filtered.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filtered.length, currentPage * pageSize)} de {filtered.length}
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer"
              >
                <ChevronLeft size={12} />
              </button>
              <span className="text-xs font-bold text-gray-900 px-3">{currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NEW BID DIALOG */}
      <Modal
        isOpen={!!newBidModal}
        onClose={() => setNewBidModal(null)}
        title="Dar Novo Lance"
        size="sm"
      >
        {newBidModal && (
          <div className="p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-950">{newBidModal.auction.item?.title}</h4>
              <p className="text-[9px] text-gray-400 font-mono font-bold mt-0.5">Leilão #{newBidModal.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-sm border border-gray-100">
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Maior Lance Atual</span>
                <span className="font-bold text-red-600 font-mono">{formatCurrency(newBidModal.topBid)}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Seu Lance Máximo</span>
                <span className="font-bold text-gray-800 font-mono">{formatCurrency(newBidModal.myBid)}</span>
              </div>
              <div className="col-span-2 border-t border-gray-200/50 pt-2 mt-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Lance Mínimo Exigido</span>
                <span className="font-black text-primary font-mono">
                  {formatCurrency(newBidModal.topBid + Number(newBidModal.auction.item?.minimum_increment || 1))}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Valor do Lance (AOA)</label>
              <input 
                type="number" 
                required
                value={newBidValue}
                onChange={(e) => setNewBidValue(e.target.value)}
                placeholder="Ex: 85000"
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              />
              {bidSubmitError && <p className="text-[9px] font-bold text-red-500">{bidSubmitError}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <button 
                type="button"
                onClick={() => setNewBidModal(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-sm transition cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                disabled={bidSubmitLoading || !newBidValue}
                onClick={handlePlaceBid}
                className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {bidSubmitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmar Oferta
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* HISTORY DIALOG */}
      <Modal
        isOpen={!!historyBid}
        onClose={() => setHistoryBid(null)}
        title="📈 Histórico Pessoal de Lances"
        size="md"
      >
        {historyBid && (
          <div className="p-6 space-y-4 select-none">
            <div className="flex flex-col gap-0.5 border-b border-gray-50 pb-3">
              <h4 className="font-black text-gray-950 text-sm leading-tight">{historyBid.auction.item?.title}</h4>
              <p className="text-[9px] text-gray-400 font-mono font-bold">Seus lances registrados para o leilão #{historyBid.id}</p>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {historyBid.bids.filter(b => b.bidder?.id === user?.id || b.bidder_id === user?.id).map((bid, i) => (
                <div key={bid.id} className="flex items-center justify-between p-3 rounded-sm border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-primary" : "bg-gray-300"}`}></div>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(bid.created_at || bid.timestamp).toLocaleString("pt-PT")}
                    </span>
                  </div>
                  <span className={`text-xs font-bold font-mono ${i === 0 ? "text-primary" : "text-gray-700"}`}>
                    {formatCurrency(bid.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-sm">
              <p className="text-[10px] text-blue-600 font-bold uppercase">Resumo da Participação</p>
              <p className="text-xs text-blue-700 mt-1 font-medium">
                Você realizou {historyBid.history.length} lances neste leilão.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setHistoryBid(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-sm transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
