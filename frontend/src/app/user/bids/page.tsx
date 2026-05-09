"use client";

import { formatCurrency } from "@/utils/auction";
import TableFilters from "@/components/common/TableFilters";
import ActionCard from "@/components/common/ActionCard";
import {
  Eye, Heart, MessageSquare, Gavel, Trophy, TrendingDown,
  ChevronLeft, ChevronRight, X, Send, Clock, AlertTriangle,
  ArrowUp, Bell,
} from "lucide-react";
import { useMemo, useState } from "react";

type BidStatus = "Vencendo" | "Ultrapassado" | "Ganhou" | "Perdeu" | "Ao Vivo";

interface MyBid {
  id: string;
  auctionId: string;
  auctionTitle: string;
  image: string;
  myBid: number;
  topBid: number;
  position: number;
  totalBidders: number;
  status: BidStatus;
  timeLeft: string;
  bidDate: string;
  history: { date: string; value: number }[];
  messages: { sender: string; text: string; time: string }[];
}

const BID_STATUS_STYLE: Record<BidStatus, { bg: string; dot: string }> = {
  "Vencendo": { bg: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "Ultrapassado": { bg: "bg-red-100 text-red-700", dot: "bg-red-500 animate-pulse" },
  "Ganhou": { bg: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  "Perdeu": { bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  "Ao Vivo": { bg: "bg-red-100 text-red-700", dot: "bg-red-500 animate-pulse" },
};

const MOCK_BIDS: MyBid[] = [
  {
    id: "BID-001", auctionId: "AUC-2001", auctionTitle: "Toyota Land Cruiser 2023", image: "🚗",
    myBid: 28500000, topBid: 28500000, position: 1, totalBidders: 8,
    status: "Vencendo", timeLeft: "2d 14h", bidDate: "08 Mai 2025",
    history: [
      { date: "06 Mai", value: 25500000 },
      { date: "07 Mai", value: 27000000 },
      { date: "08 Mai", value: 28500000 },
    ],
    messages: [{ sender: "Vendedor", text: "Obrigado pelo lance!", time: "15:00" }],
  },
  {
    id: "BID-002", auctionId: "AUC-2002", auctionTitle: "Apartamento T3 Talatona", image: "🏠",
    myBid: 89000000, topBid: 92000000, position: 3, totalBidders: 15,
    status: "Ao Vivo", timeLeft: "0d 2h 30m", bidDate: "09 Mai 2025",
    history: [
      { date: "08 Mai", value: 86000000 },
      { date: "09 Mai", value: 89000000 },
    ],
    messages: [{ sender: "Vendedor", text: "Aumente o lance para ter chance!", time: "19:50" }],
  },
  {
    id: "BID-003", auctionId: "AUC-2003", auctionTitle: "iPhone 15 Pro Max 256GB", image: "📱",
    myBid: 920000, topBid: 920000, position: 1, totalBidders: 22,
    status: "Ganhou", timeLeft: "Encerrado", bidDate: "04 Mai 2025",
    history: [
      { date: "01 Mai", value: 780000 },
      { date: "03 Mai", value: 850000 },
      { date: "04 Mai", value: 920000 },
    ],
    messages: [{ sender: "Vendedor", text: "Parabéns! Vamos combinar a entrega.", time: "10:30" }],
  },
  {
    id: "BID-004", auctionId: "AUC-2010", auctionTitle: "MacBook Pro M3 14\"", image: "💻",
    myBid: 1100000, topBid: 1350000, position: 4, totalBidders: 11,
    status: "Ultrapassado", timeLeft: "1d 6h", bidDate: "07 Mai 2025",
    history: [
      { date: "05 Mai", value: 950000 },
      { date: "07 Mai", value: 1100000 },
    ],
    messages: [],
  },
  {
    id: "BID-005", auctionId: "AUC-2011", auctionTitle: "Relógio Rolex Submariner", image: "⌚",
    myBid: 3200000, topBid: 3800000, position: 2, totalBidders: 6,
    status: "Perdeu", timeLeft: "Encerrado", bidDate: "02 Mai 2025",
    history: [
      { date: "28 Abr", value: 2800000 },
      { date: "30 Abr", value: 3200000 },
    ],
    messages: [],
  },
  {
    id: "BID-006", auctionId: "AUC-2012", auctionTitle: "Quadro Original - Pinturas de Luanda", image: "🎨",
    myBid: 4800000, topBid: 4800000, position: 1, totalBidders: 4,
    status: "Vencendo", timeLeft: "4d 12h", bidDate: "09 Mai 2025",
    history: [
      { date: "09 Mai", value: 4800000 },
    ],
    messages: [{ sender: "Vendedor", text: "Excelente lance!", time: "18:00" }],
  },
];

const ALERTS = [
  { type: "danger" as const, icon: AlertTriangle, text: "Seu lance no MacBook Pro M3 foi ultrapassado!", time: "há 2h" },
  { type: "warning" as const, icon: Clock, text: "Apartamento T3 Talatona encerra em 2h 30m!", time: "há 30min" },
  { type: "success" as const, icon: Trophy, text: "Você venceu o leilão do iPhone 15 Pro Max!", time: "há 1 dia" },
];

const ALERT_STYLES = {
  danger: "border-red-200 bg-red-50 text-red-700",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
  success: "border-green-200 bg-green-50 text-green-700",
};

export default function MeusLances() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [historyBid, setHistoryBid] = useState<MyBid | null>(null);
  const [chatBid, setChatBid] = useState<MyBid | null>(null);
  const [chatMsg, setChatMsg] = useState("");
  const [newBidModal, setNewBidModal] = useState<MyBid | null>(null);
  const [newBidValue, setNewBidValue] = useState("");
  const [showAlerts, setShowAlerts] = useState(true);

  const filtered = useMemo(() => {
    return MOCK_BIDS.filter((b) => {
      const matchSearch = b.auctionTitle.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? b.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totals = useMemo(() => ({
    total: MOCK_BIDS.length,
    vencendo: MOCK_BIDS.filter(b => b.status === "Vencendo").length,
    perdidos: MOCK_BIDS.filter(b => b.status === "Perdeu").length,
    ganhos: MOCK_BIDS.filter(b => b.status === "Ganhou").length,
  }), []);

  return (
    <>
      <ActionCard title="Meus Lances" subtitle="Acompanhe todos os seus lances e posições em leilões" buttonLabel="Explorar Leilões" />

      {/* ALERTS */}
      {showAlerts && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Bell size={14} /> Alertas Importantes
            </h3>
            <button onClick={() => setShowAlerts(false)} className="text-[10px] text-gray-400 hover:text-gray-600">Ocultar</button>
          </div>
          {ALERTS.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-sm border text-xs ${ALERT_STYLES[alert.type]}`}>
              <alert.icon size={16} className="shrink-0" />
              <span className="flex-1 font-medium">{alert.text}</span>
              <span className="text-[10px] opacity-70 shrink-0">{alert.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total de Lances", value: totals.total, icon: Gavel, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Vencendo", value: totals.vencendo, icon: TrendingDown, color: "text-green-600", bg: "bg-green-50" },
          { label: "Perdidos", value: totals.perdidos, icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
          { label: "Ganhos", value: totals.ganhos, icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-sm shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-sm ${card.bg} ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 rounded-sm shadow-sm mt-6 overflow-hidden">
        <TableFilters
          search={search}
          onSearchChange={setSearch}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          filters={{ status: statusFilter }}
          onFilterChange={(name, val) => { if (name === "status") setStatusFilter(val); }}
          onClearFilters={() => { setSearch(""); setStatusFilter(""); }}
          filterOptions={{
            statusOptions: [
              { value: "", label: "Todos" },
              { value: "Vencendo", label: "Vencendo" },
              { value: "Ultrapassado", label: "Ultrapassado" },
              { value: "Ganhou", label: "Ganhou" },
              { value: "Perdeu", label: "Perdeu" },
              { value: "Ao Vivo", label: "Ao Vivo" },
            ],
          }}
        />

        <div className="overflow-x-auto mt-2">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs text-gray-600 border-b border-gray-200">
                <th className="p-3">Leilão</th>
                <th className="text-xs">Seu Lance</th>
                <th className="text-xs">Maior Lance</th>
                <th className="text-xs text-center">Posição</th>
                <th className="text-xs">Status</th>
                <th className="text-xs">Tempo</th>
                <th className="text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-500">Nenhum lance encontrado</td>
                </tr>
              ) : filtered.map((bid) => (
                <tr key={bid.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition text-xs">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center text-lg">{bid.image}</div>
                      <div>
                        <span className="font-medium text-gray-900 block">{bid.auctionTitle}</span>
                        <span className="text-[10px] text-gray-400">{bid.auctionId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs font-bold text-gray-900">{formatCurrency(bid.myBid)}</td>
                  <td className={`text-xs font-bold ${bid.myBid >= bid.topBid ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(bid.topBid)}
                  </td>
                  <td className="text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${bid.position === 1 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {bid.position}º
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${BID_STATUS_STYLE[bid.status].bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${BID_STATUS_STYLE[bid.status].dot}`}></span>
                      {bid.status === "Vencendo" && "🟢 Vencendo"}
                      {bid.status === "Ultrapassado" && "🔴 Ultrapassado"}
                      {bid.status === "Ganhou" && "🏆 Ganhou"}
                      {bid.status === "Perdeu" && "⚫ Perdeu"}
                      {bid.status === "Ao Vivo" && "⚡ Ao Vivo"}
                    </span>
                  </td>
                  <td className="text-xs text-gray-600">
                    {bid.status === "Ao Vivo" ? (
                      <span className="text-red-600 font-bold animate-pulse">{bid.timeLeft}</span>
                    ) : bid.timeLeft}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button title="Ver Leilão" className="p-1.5 rounded-sm hover:bg-blue-100 text-blue-600">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {(bid.status === "Vencendo" || bid.status === "Ultrapassado" || bid.status === "Ao Vivo") && (
                        <button title="Novo Lance" onClick={() => { setNewBidModal(bid); setNewBidValue(""); }} className="p-1.5 rounded-sm hover:bg-green-100 text-green-600">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button title="Favoritar" className="p-1.5 rounded-sm hover:bg-red-100 text-red-500">
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <button title="Histórico" onClick={() => setHistoryBid(bid)} className="p-1.5 rounded-sm hover:bg-purple-100 text-purple-600">
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      {bid.messages.length > 0 && (
                        <button title="Mensagens" onClick={() => setChatBid(bid)} className="p-1.5 rounded-sm hover:bg-blue-100 text-blue-600 relative">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{bid.messages.length}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-3 border-t border-gray-100 mt-2">
          <div className="text-xs text-gray-500">Mostrando 1–{filtered.length} de {filtered.length}</div>
          <div className="flex items-center gap-1.5">
            <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50"><ChevronLeft className="w-3 h-3" /></button>
            <button className="px-2.5 py-1 bg-blue-600 text-white rounded-sm text-xs font-medium">1</button>
            <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50"><ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      </div>

      {/* NEW BID MODAL */}
      {newBidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-900">💰 Novo Lance</h2>
              <button onClick={() => setNewBidModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-gray-600 mb-1">{newBidModal.auctionTitle}</p>
            <p className="text-[10px] text-gray-400 mb-4">Maior lance atual: <span className="font-bold text-red-600">{formatCurrency(newBidModal.topBid)}</span></p>
            <input
              type="number" value={newBidValue} onChange={(e) => setNewBidValue(e.target.value)}
              placeholder="Digite o valor do lance (Kz)"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setNewBidModal(null)} className="flex-1 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-sm border border-gray-200">Cancelar</button>
              <button className="flex-1 px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-sm">Confirmar Lance</button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {historyBid && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-900">📈 Histórico de Lances</h2>
              <button onClick={() => setHistoryBid(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-gray-600 mb-4">{historyBid.auctionTitle}</p>
            <div className="space-y-2">
              {historyBid.history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-sm border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${i === historyBid.history.length - 1 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <span className="text-xs text-gray-600">{h.date}</span>
                  </div>
                  <span className={`text-xs font-bold ${i === historyBid.history.length - 1 ? "text-green-600" : "text-gray-700"}`}>
                    {formatCurrency(h.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-sm">
              <p className="text-[10px] text-blue-600 font-bold uppercase">Evolução</p>
              <p className="text-xs text-blue-700 mt-1">
                {historyBid.history.length} lances realizados · De {formatCurrency(historyBid.history[0].value)} até {formatCurrency(historyBid.history[historyBid.history.length - 1].value)}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setHistoryBid(null)} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-sm border border-gray-200">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {chatBid && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-md w-full shadow-xl flex flex-col max-h-[500px]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">💬 Conversa</h2>
                <p className="text-[10px] text-gray-500">{chatBid.auctionTitle}</p>
              </div>
              <button onClick={() => setChatBid(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatBid.messages.map((msg, i) => (
                <div key={i} className="bg-gray-50 rounded-sm p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-800">{msg.sender}</span>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                  </div>
                  <p className="text-xs text-gray-600">{msg.text}</p>
                </div>
              ))}
              {chatBid.status === "Ganhou" && (
                <div className="bg-green-50 border border-green-100 rounded-sm p-3 text-center">
                  <p className="text-[10px] font-bold text-green-700 uppercase">🏆 Você Venceu!</p>
                  <p className="text-xs text-green-600 mt-1">Combine com o vendedor a entrega do item</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Escrever mensagem..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button className="p-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
