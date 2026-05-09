"use client";

import { auctionStatusColor, formatCurrency, AuctionStatus } from "@/utils/auction";
import TableFilters from "@/components/common/TableFilters";
import ActionCard from "@/components/common/ActionCard";
import {
  Eye, Edit3, Pause, Play, Ban, BarChart3, MessageSquare,
  ChevronLeft, ChevronRight, Gavel, Users, TrendingUp,
  Clock, X, ArrowUpRight, Send,
} from "lucide-react";
import { useMemo, useState } from "react";

interface MyAuction {
  id: string;
  title: string;
  image: string;
  status: AuctionStatus;
  currentPrice: number;
  startingPrice: number;
  bidsCount: number;
  participants: number;
  views: number;
  topBid: number;
  bidGrowth: string;
  timeLeft: string;
  endDate: string;
  messages: { sender: string; text: string; time: string }[];
}

const MOCK_AUCTIONS: MyAuction[] = [
  {
    id: "AUC-2001", title: "Toyota Land Cruiser 2023", image: "🚗",
    status: "Ativo", currentPrice: 28500000, startingPrice: 25000000,
    bidsCount: 12, participants: 8, views: 342, topBid: 28500000,
    bidGrowth: "+14%", timeLeft: "2d 14h",
    endDate: "15 Mai 2025",
    messages: [
      { sender: "Carlos M.", text: "Aceita proposta direta?", time: "14:30" },
      { sender: "Maria O.", text: "Qual a quilometragem?", time: "12:15" },
    ],
  },
  {
    id: "AUC-2002", title: "Apartamento T3 Talatona", image: "🏠",
    status: "Ao Vivo", currentPrice: 92000000, startingPrice: 85000000,
    bidsCount: 28, participants: 15, views: 1204, topBid: 92000000,
    bidGrowth: "+8.2%", timeLeft: "0d 2h 30m",
    endDate: "09 Mai 2025",
    messages: [
      { sender: "João S.", text: "Documentação completa?", time: "19:45" },
    ],
  },
  {
    id: "AUC-2003", title: "iPhone 15 Pro Max 256GB", image: "📱",
    status: "Finalizado", currentPrice: 920000, startingPrice: 750000,
    bidsCount: 45, participants: 22, views: 890, topBid: 920000,
    bidGrowth: "+22.7%", timeLeft: "Encerrado",
    endDate: "05 Mai 2025",
    messages: [
      { sender: "Pedro A.", text: "Quando posso retirar?", time: "10:00" },
    ],
  },
  {
    id: "AUC-2004", title: "Gerador Industrial 50kVA", image: "⚡",
    status: "Pausado", currentPrice: 4500000, startingPrice: 4500000,
    bidsCount: 1, participants: 1, views: 67, topBid: 4500000,
    bidGrowth: "0%", timeLeft: "Pausado",
    endDate: "20 Mai 2025",
    messages: [],
  },
  {
    id: "AUC-2005", title: "Lote de Terreno - Benfica", image: "🏗️",
    status: "Cancelado", currentPrice: 12500000, startingPrice: 12000000,
    bidsCount: 3, participants: 2, views: 156, topBid: 12500000,
    bidGrowth: "+4.2%", timeLeft: "Cancelado",
    endDate: "15 Abr 2025",
    messages: [],
  },
  {
    id: "AUC-2006", title: "Coleção de Arte Contemporânea", image: "🎨",
    status: "Privado", currentPrice: 5200000, startingPrice: 4000000,
    bidsCount: 6, participants: 3, views: 45, topBid: 5200000,
    bidGrowth: "+30%", timeLeft: "5d 8h",
    endDate: "25 Mai 2025",
    messages: [
      { sender: "Ana R.", text: "Posso agendar uma visita?", time: "16:20" },
    ],
  },
];

const STATUS_DOT: Record<string, string> = {
  "Ativo": "bg-green-500", "Ao Vivo": "bg-red-500 animate-pulse",
  "Finalizado": "bg-blue-500", "Pausado": "bg-yellow-500",
  "Cancelado": "bg-gray-400", "Privado": "bg-purple-500",
};

export default function MeusLeiloes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statsAuction, setStatsAuction] = useState<MyAuction | null>(null);
  const [chatAuction, setChatAuction] = useState<MyAuction | null>(null);
  const [chatMsg, setChatMsg] = useState("");

  const filtered = useMemo(() => {
    return MOCK_AUCTIONS.filter((a) => {
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? a.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totals = useMemo(() => ({
    ativos: MOCK_AUCTIONS.filter(a => a.status === "Ativo" || a.status === "Ao Vivo").length,
    encerrados: MOCK_AUCTIONS.filter(a => a.status === "Finalizado").length,
    views: MOCK_AUCTIONS.reduce((s, a) => s + a.views, 0),
    bids: MOCK_AUCTIONS.reduce((s, a) => s + a.bidsCount, 0),
  }), []);

  return (
    <>
      <ActionCard title="Meus Leilões" subtitle="Gerencie e acompanhe todos os seus leilões" buttonLabel="Criar Leilão" />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Leilões Ativos", value: totals.ativos, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Encerrados", value: totals.encerrados, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Visualizações", value: totals.views.toLocaleString(), icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Total de Bids", value: totals.bids, icon: Gavel, color: "text-orange-600", bg: "bg-orange-50" },
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
              { value: "Ativo", label: "Ativos" },
              { value: "Ao Vivo", label: "Ao Vivo" },
              { value: "Finalizado", label: "Encerrados" },
              { value: "Cancelado", label: "Cancelados" },
              { value: "Pausado", label: "Pausados" },
              { value: "Privado", label: "Privados" },
            ],
          }}
        />

        <div className="overflow-x-auto mt-2">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs text-gray-600 border-b border-gray-200">
                <th className="p-3">Leilão</th>
                <th className="text-xs">Status</th>
                <th className="text-xs">Preço Atual</th>
                <th className="text-xs text-center">Bids</th>
                <th className="text-xs text-center">Participantes</th>
                <th className="text-xs">Tempo</th>
                <th className="text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-500">Nenhum leilão encontrado</td>
                </tr>
              ) : filtered.map((auction) => (
                <tr key={auction.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition text-xs">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center text-lg">{auction.image}</div>
                      <div>
                        <span className="font-medium text-gray-900 block">{auction.title}</span>
                        <span className="text-[10px] text-gray-400">{auction.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${auctionStatusColor(auction.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[auction.status]}`}></span>
                      {auction.status}
                    </span>
                  </td>
                  <td className="text-xs font-bold text-blue-600">{formatCurrency(auction.currentPrice)}</td>
                  <td className="text-xs text-center font-medium">{auction.bidsCount}</td>
                  <td className="text-xs text-center">{auction.participants}</td>
                  <td className="text-xs text-gray-600">
                    {auction.status === "Ao Vivo" ? (
                      <span className="text-red-600 font-bold animate-pulse">{auction.timeLeft}</span>
                    ) : auction.timeLeft}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button title="Ver Detalhes" className="p-1.5 rounded-sm hover:bg-blue-100 text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                      {(auction.status === "Ativo" || auction.status === "Ao Vivo" || auction.status === "Privado") && (
                        <button title="Editar" className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-700"><Edit3 className="w-3.5 h-3.5" /></button>
                      )}
                      {(auction.status === "Ativo" || auction.status === "Ao Vivo") && (
                        <button title="Pausar" className="p-1.5 rounded-sm hover:bg-yellow-100 text-yellow-600"><Pause className="w-3.5 h-3.5" /></button>
                      )}
                      {auction.status === "Pausado" && (
                        <button title="Retomar" className="p-1.5 rounded-sm hover:bg-green-100 text-green-600"><Play className="w-3.5 h-3.5" /></button>
                      )}
                      {auction.status !== "Finalizado" && auction.status !== "Cancelado" && (
                        <button title="Cancelar" className="p-1.5 rounded-sm hover:bg-red-100 text-red-600"><Ban className="w-3.5 h-3.5" /></button>
                      )}
                      <button title="Estatísticas" onClick={() => setStatsAuction(auction)} className="p-1.5 rounded-sm hover:bg-purple-100 text-purple-600"><BarChart3 className="w-3.5 h-3.5" /></button>
                      {auction.messages.length > 0 && (
                        <button title="Mensagens" onClick={() => setChatAuction(auction)} className="p-1.5 rounded-sm hover:bg-blue-100 text-blue-600 relative">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{auction.messages.length}</span>
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

      {/* STATISTICS MODAL */}
      {statsAuction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">📊 Estatísticas</h2>
              <button onClick={() => setStatsAuction(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-4">{statsAuction.title}</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Visualizações", value: statsAuction.views.toLocaleString(), icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Participantes", value: statsAuction.participants, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Maior Lance", value: formatCurrency(statsAuction.topBid), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                { label: "Crescimento Bids", value: statsAuction.bidGrowth, icon: ArrowUpRight, color: "text-orange-600", bg: "bg-orange-50" },
              ].map((s) => (
                <div key={s.label} className="border border-gray-100 rounded-sm p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-sm ${s.bg} ${s.color}`}><s.icon size={18} /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{s.label}</p>
                    <p className="text-sm font-bold text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setStatsAuction(null)} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-sm border border-gray-200">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {chatAuction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-md w-full shadow-xl flex flex-col max-h-[500px]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">💬 Mensagens</h2>
                <p className="text-[10px] text-gray-500">{chatAuction.title}</p>
              </div>
              <button onClick={() => setChatAuction(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatAuction.messages.map((msg, i) => (
                <div key={i} className="bg-gray-50 rounded-sm p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-800">{msg.sender}</span>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                  </div>
                  <p className="text-xs text-gray-600">{msg.text}</p>
                </div>
              ))}
              {chatAuction.status === "Finalizado" && (
                <div className="bg-green-50 border border-green-100 rounded-sm p-3 text-center">
                  <p className="text-[10px] font-bold text-green-700 uppercase">Leilão Encerrado</p>
                  <p className="text-xs text-green-600 mt-1">Contacte o vencedor para finalizar a transação</p>
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
