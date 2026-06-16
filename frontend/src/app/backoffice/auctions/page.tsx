"use client";

import { useMemo, useState } from "react";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSection from "@/components/common/TableSection";
import {
  useAuctionsQuery,
  useAuctionQuery,
  useUpdateAuctionMutation,
  useCancelAuctionMutation,
  useDeleteAuctionMutation,
  useAuctionBidsQuery,
  useAuctionStreamsQuery,
  useCreateStreamMutation,
  useStartStreamMutation,
  useEndStreamMutation,
} from "@/hooks/useAuction";
import { AuctionStatus } from "@/types/auction.types";
import { useCategoriesQuery } from "@/hooks/useCategory";
import { auctionStatusColor, getAuctionStatusLabel, formatCurrency } from "@/utils/auction";
import ENV from "@/utils/env.utils";
import {
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  X,
  AlertTriangle,
  Gavel,
  Calendar,
  Video,
  PlayCircle,
  PowerOff,
  Award,
} from "lucide-react";

export default function Auctions() {
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
  
  // Pagination & Counts
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Modals state
  const [deleteAuctionId, setDeleteAuctionId] = useState<number | null>(null);
  const [cancelAuctionId, setCancelAuctionId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [approveAuctionId, setApproveAuctionId] = useState<number | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Load categories
  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData || [];

  // Fetch Auctions
  const auctionsParams = useMemo(() => ({
    page: currentPage,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
    category_id: categoryFilter || undefined,
  }), [currentPage, pageSize, search, statusFilter, categoryFilter]);

  const { data: auctionsListData, isLoading: loading } = useAuctionsQuery(auctionsParams);
  const auctions = auctionsListData?.results || [];
  const totalCount = auctionsListData?.count || 0;

  const { data: selectedAuctionData } = useAuctionQuery(selectedAuctionId || 0);
  const selectedAuction = selectedAuctionData || null;

  // Additional Queries for selected auction details
  const { data: bidsData } = useAuctionBidsQuery(selectedAuctionId || 0);
  const { data: streamsData } = useAuctionStreamsQuery(selectedAuctionId || 0, !!selectedAuctionId);

  const selectedAuctionBids = bidsData?.results || [];
  const selectedAuctionStreams = streamsData || [];
  const activeStream = selectedAuctionStreams.find((s: any) => s.status === "LIVE" || s.status === "READY" || s.status === "SCHEDULED") || null;

  // Stream Mutations
  const createStreamMutation = useCreateStreamMutation();
  const startStreamMutation = useStartStreamMutation();
  const endStreamMutation = useEndStreamMutation();

  // Detail Modal Gallery and Stream states
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Mutations
  const updateAuctionMutation = useUpdateAuctionMutation();
  const cancelAuctionMutation = useCancelAuctionMutation();
  const deleteAuctionMutation = useDeleteAuctionMutation();

  // View details modal
  const handleViewDetails = (auctionId: number) => {
    setSelectedAuctionId(auctionId);
    setActiveImageIdx(0);
    setStreamError(null);
  };

  // Publish / Approve Auction
  const handleApproveAuction = async () => {
    if (!approveAuctionId) return;
    try {
      await updateAuctionMutation.mutateAsync({
        id: approveAuctionId,
        payload: { publish: true },
      });
    } catch (err) {
      console.error("Erro ao aprovar leilão:", err);
    }
    setApproveAuctionId(null);
  };

  // Cancel Auction
  const handleCancelAuction = async () => {
    if (!cancelAuctionId) return;
    try {
      await cancelAuctionMutation.mutateAsync({
        id: cancelAuctionId,
        payload: { reason: cancelReason },
      });
    } catch (err) {
      console.error("Erro ao cancelar leilão:", err);
    }
    setCancelAuctionId(null);
    setCancelReason("");
  };

  // Delete Auction
  const handleDeleteAuction = async () => {
    if (!deleteAuctionId) return;
    try {
      await deleteAuctionMutation.mutateAsync(deleteAuctionId);
      if (selectedAuctionId === deleteAuctionId) {
        setSelectedAuctionId(null);
      }
    } catch (err) {
      console.error("Erro ao excluir leilão:", err);
    }
    setDeleteAuctionId(null);
  };

  // Stream Handlers
  const handleCreateStream = async () => {
    if (!selectedAuctionId || !selectedAuction) return;
    setStreamLoading(true);
    setStreamError(null);
    try {
      const res = await createStreamMutation.mutateAsync({
        auctionId: selectedAuctionId,
        payload: { title: `Live: ${selectedAuction.item?.title || 'Leilão'}` }
      });
      if (!res.success) {
        setStreamError(res.message || "Erro ao criar stream");
      }
    } catch (err) {
      setStreamError("Falha na rede ao criar stream");
    } finally {
      setStreamLoading(false);
    }
  };

  const handleStartStream = async (streamId: number) => {
    if (!selectedAuctionId) return;
    setStreamLoading(true);
    setStreamError(null);
    try {
      const res = await startStreamMutation.mutateAsync({
        auctionId: selectedAuctionId,
        streamId,
        payload: {}
      });
      if (!res.success) {
        setStreamError(res.message || "Erro ao iniciar stream");
      }
    } catch (err) {
      setStreamError("Falha na rede ao iniciar stream");
    } finally {
      setStreamLoading(false);
    }
  };

  const handleEndStream = async (streamId: number) => {
    if (!selectedAuctionId) return;
    setStreamLoading(true);
    setStreamError(null);
    try {
      const res = await endStreamMutation.mutateAsync({
        auctionId: selectedAuctionId,
        streamId,
        payload: {}
      });
      if (!res.success) {
        setStreamError(res.message || "Erro ao encerrar stream");
      }
    } catch (err) {
      setStreamError("Falha na rede ao encerrar stream");
    } finally {
      setStreamLoading(false);
    }
  };

  // Format date helper
  const formatDateSimple = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  // Category options mapping for filters
  const categoryFilterOptions = useMemo(() => {
    const list = categories.map((c) => ({
      value: String(c.id),
      label: c.name,
    }));
    return [{ value: "", label: "Todas as Categorias" }, ...list];
  }, [categories]);

  const filtersSlot = (
    <TableFilters
      search={search}
      onSearchChange={(val) => {
        setSearch(val);
        setCurrentPage(1);
      }}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      filters={{
        status: statusFilter,
        category: categoryFilter,
      }}
      onFilterChange={(filterName, value) => {
        setCurrentPage(1);
        if (filterName === "status") setStatusFilter(value);
        if (filterName === "category") setCategoryFilter(value);
      }}
      onClearFilters={() => {
        setSearch("");
        setStatusFilter("");
        setCategoryFilter("");
        setCurrentPage(1);
      }}
      filterOptions={{
        statusOptions: [
          { value: "", label: "Todos os Status" },
          { value: AuctionStatus.DRAFT, label: "Rascunho" },
          { value: AuctionStatus.SCHEDULED, label: "Agendado" },
          { value: AuctionStatus.LIVE, label: "Ao Vivo (Ativo)" },
          { value: AuctionStatus.ENDED, label: "Finalizado" },
          { value: AuctionStatus.CANCELLED, label: "Cancelado" },
          { value: AuctionStatus.SOLD, label: "Vendido" },
        ],
        categoryOptions: categoryFilterOptions,
      }}
    />
  );

  return (
    <div className="flex flex-col gap-5 p-1 select-none">

      {/* HEADER SECTION */}
      <ActionCard
        title="Gestão de Leilões"
        subtitle="Monitore e administre os leilões publicados na plataforma, aprove rascunhos agendados ou cancele leilões fraudulentos."
      />

      {/* TABLE SECTION */}
      <TableSection
        filters={filtersSlot}
        entityName="leilões"
        pagination={{
          currentPage: currentPage,
          totalCount: totalCount,
          pageSize: pageSize,
          onPageChange: (page) => setCurrentPage(page)
        }}
      >
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
              <th className="p-3">Título / Categoria</th>
              <th className="py-3">Vendedor</th>
              <th className="py-3">Preço Inicial</th>
              <th className="py-3">Preço Atual</th>
              <th className="py-3">Status</th>
              <th className="py-3">Término</th>
              <th className="py-3 text-right pr-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[10px] text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                  Carregando lista de leilões da API...
                </td>
              </tr>
            ) : auctions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                  Nenhum leilão cadastrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              auctions.map((auction) => (
                <tr key={auction.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                        <Gavel size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-950 text-xs leading-tight">
                          {auction.item?.title || "Leilão sem título"}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 mt-0.5 tracking-wider uppercase font-mono">
                          ID: {auction.id} | {auction.item?.category_label || "Sem categoria"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-gray-500 font-bold">ID: {auction.item?.seller}</span>
                  </td>
                  <td className="py-3 font-semibold text-gray-800">
                    {formatCurrency(auction.item?.starting_price || 0)}
                  </td>
                  <td className="py-3 font-bold text-primary">
                    {formatCurrency(auction.item?.current_price || 0)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${auctionStatusColor(auction.status)}`}>
                      {getAuctionStatusLabel(auction.status)}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 font-bold">
                    {formatDateSimple(auction.end_time)}
                  </td>
                  <td className="py-3 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleViewDetails(auction.id)}
                        title="Ver Detalhes"
                        className="p-1.5 rounded-sm hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-gray-100 bg-white"
                      >
                        <Eye size={12} />
                      </button>

                      {(auction.status === AuctionStatus.DRAFT || auction.status === AuctionStatus.SCHEDULED) && (
                        <button
                          onClick={() => setApproveAuctionId(auction.id)}
                          title="Publicar Leilão"
                          className="p-1.5 rounded-sm hover:bg-green-50 text-green-600 transition-colors cursor-pointer border border-gray-100 bg-white"
                        >
                          <CheckCircle size={12} />
                        </button>
                      )}

                      {auction.status === AuctionStatus.LIVE && (
                        <button
                          onClick={() => setCancelAuctionId(auction.id)}
                          title="Cancelar Leilão"
                          className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                        >
                          <Ban size={12} />
                        </button>
                      )}

                      {auction.status === AuctionStatus.DRAFT && (
                        <button
                          onClick={() => setDeleteAuctionId(auction.id)}
                          title="Excluir Leilão"
                          className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableSection>

      {/* DETAIL MODAL */}
      {selectedAuction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-sm max-w-xl w-full p-6 shadow-xl relative animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAuctionId(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Gavel size={16} className="text-primary" />
              Detalhes do Leilão #{selectedAuction.id}
            </h3>

            <div className="space-y-6">
              {/* Image Gallery */}
              {selectedAuction.item?.images && selectedAuction.item.images.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full rounded-sm overflow-hidden bg-gray-950 border border-gray-100 shadow-sm">
                    <img
                      src={selectedAuction.item.images[activeImageIdx]?.file?.url || "/placeholder.png"}
                      alt={selectedAuction.item.title}
                      className="h-full w-full object-cover transition-all"
                    />
                  </div>
                  {selectedAuction.item.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedAuction.item.images.map((img: any, idx: number) => (
                        <button
                          key={img.id || idx}
                          onClick={() => setActiveImageIdx(idx)}
                          className={`relative aspect-video w-16 shrink-0 rounded-sm overflow-hidden bg-gray-950 transition-all border ${
                            activeImageIdx === idx ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src={img?.file?.url} alt="Thumbnail" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video w-full rounded-sm overflow-hidden bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-gray-400 text-xs gap-1.5">
                  <Eye size={24} className="text-gray-300" />
                  Sem imagens cadastradas para este lote
                </div>
              )}

              {/* Product Info */}
              <div>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider font-mono">Título do Item</span>
                <h4 className="text-sm font-bold text-gray-900 leading-tight mt-0.5">{selectedAuction.item?.title}</h4>
                <p className="text-[10px] text-gray-600 leading-relaxed mt-2 bg-gray-50 p-3 rounded-sm border border-gray-100 italic">
                  "{selectedAuction.item?.description || "Sem descrição informada para este item."}"
                </p>
              </div>

              {/* Grid detail */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Categoria</span>
                  <span className="text-xs font-semibold text-gray-800">{selectedAuction.item?.category_label || "Sem Categoria"}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Estado de Conservação</span>
                  <span className="text-xs font-semibold text-gray-800 uppercase font-mono">{selectedAuction.item?.condition_type || "Novo"}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">ID Vendedor</span>
                  <span className="text-xs font-semibold text-gray-800 font-mono">#{selectedAuction.item?.seller}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Status Atual</span>
                  <span className={`inline-block px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase mt-1 ${auctionStatusColor(selectedAuction.status)}`}>
                    {getAuctionStatusLabel(selectedAuction.status)}
                  </span>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 bg-primary/5 p-4 rounded-sm border border-primary/10">
                <div>
                  <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">Preço Inicial</span>
                  <span className="text-xs font-black text-gray-900">{formatCurrency(selectedAuction.item?.starting_price || 0)}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">Licitado Atual</span>
                  <span className="text-xs font-black text-primary">{formatCurrency(selectedAuction.item?.current_price || 0)}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">Incremento Mínimo</span>
                  <span className="text-xs font-semibold text-gray-800">{formatCurrency(selectedAuction.item?.minimum_increment || 0)}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">Compra Imediata</span>
                  <span className="text-xs font-semibold text-gray-800">{selectedAuction.item?.buy_now_price ? formatCurrency(selectedAuction.item.buy_now_price) : "Não habilitado"}</span>
                </div>
              </div>

              {/* Durations */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div className="flex gap-2 items-center">
                  <Calendar size={12} className="text-gray-400" />
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Início Agendado</span>
                    <span className="text-[10px] font-semibold text-gray-700">{formatDateSimple(selectedAuction.start_time)}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Calendar size={12} className="text-gray-400" />
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Fim Previsto</span>
                    <span className="text-[10px] font-semibold text-gray-700">{formatDateSimple(selectedAuction.end_time)}</span>
                  </div>
                </div>
              </div>

              {/* Live Stream Section */}
              {(selectedAuction.status === AuctionStatus.LIVE || selectedAuction.status === AuctionStatus.SCHEDULED) && (
                <div className="border-t border-gray-100 pt-4">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Transmissão ao Vivo (Live Stream)</span>
                  {streamError && (
                    <div className="mb-3 text-[10px] text-red-600 bg-red-50 p-2 rounded-sm border border-red-100">
                      {streamError}
                    </div>
                  )}
                  {!activeStream ? (
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-sm flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h5 className="text-[10px] font-bold text-gray-950">Nenhuma transmissão associada</h5>
                        <p className="text-[9px] text-gray-500">Crie uma stream para transmitir ao vivo via LiveKit.</p>
                      </div>
                      <button
                        onClick={handleCreateStream}
                        disabled={streamLoading}
                        className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-sm uppercase tracking-wider hover:bg-primary/95 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Video size={12} />
                        Criar Stream
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${activeStream.status === "LIVE" ? "bg-red-500 animate-pulse" : "bg-gray-400"}`} />
                          <span className="text-[10px] font-bold text-gray-800">Status: <span className="uppercase font-mono">{activeStream.status}</span></span>
                        </div>
                        <div className="flex gap-2">
                          {(activeStream.status === "SCHEDULED" || activeStream.status === "READY" || activeStream.status === "DRAFT") && (
                            <button
                              onClick={() => handleStartStream(activeStream.id)}
                              disabled={streamLoading}
                              className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-sm uppercase tracking-wider hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <PlayCircle size={12} />
                              Iniciar
                            </button>
                          )}
                          {activeStream.status === "LIVE" && (
                            <button
                              onClick={() => handleEndStream(activeStream.id)}
                              disabled={streamLoading}
                              className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-sm uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <PowerOff size={12} />
                              Encerrar
                            </button>
                          )}
                        </div>
                      </div>
                      {/* OBS Credentials */}
                      <div className="space-y-2 text-[9px]">
                        <div>
                          <span className="text-gray-400 font-bold block">Servidor de Stream (URL):</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="text"
                              readOnly
                              value={ENV.LIVEKIT_URL || "rtc.livekit.cloud"}
                              className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded-sm font-mono text-[9px] outline-none"
                            />
                            <button
                              onClick={() => navigator.clipboard.writeText(ENV.LIVEKIT_URL || "rtc.livekit.cloud")}
                              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-sm font-bold uppercase"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block">Chave de Stream (Stream Key):</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="password"
                              readOnly
                              value={activeStream.stream_key || ""}
                              id="obs-stream-key"
                              className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded-sm font-mono text-[9px] outline-none"
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById("obs-stream-key") as HTMLInputElement;
                                if (input) {
                                  input.type = input.type === "password" ? "text" : "password";
                                }
                              }}
                              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-sm font-bold uppercase"
                            >
                              Mostrar
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(activeStream.stream_key || "")}
                              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-sm font-bold uppercase"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bid History Section */}
              <div className="border-t border-gray-100 pt-4">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Award size={10} className="text-primary" />
                  Histórico de Lances
                </span>
                {selectedAuctionBids.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-sm text-center text-[10px] text-gray-400">
                    Nenhum lance ofertado neste lote até o momento.
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-sm divide-y divide-gray-100">
                    {selectedAuctionBids.map((bid: any) => (
                      <div key={bid.id} className="flex justify-between items-center p-2.5 text-[10px] hover:bg-gray-50 transition-colors">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-800">
                            {bid.bidder ? bid.bidder.username : `Usuário #${bid.bidder_id}`}
                          </span>
                          <span className="text-[8px] text-gray-400 block font-mono">
                            {formatDateSimple(bid.timestamp || bid.created_at)}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-primary">
                          {formatCurrency(bid.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cancellation notes if exists */}
              {selectedAuction.status === AuctionStatus.CANCELLED && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-sm flex gap-3 text-red-700 border-t pt-4">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider block">Motivo de Cancelamento</span>
                    <p className="text-[10px] font-medium leading-relaxed mt-1 italic">
                      "{selectedAuction.cancel_reason || "Nenhum motivo detalhado."}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setSelectedAuctionId(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-sm uppercase tracking-wider"
              >
                Fechar
              </button>
              {(selectedAuction.status === AuctionStatus.DRAFT || selectedAuction.status === AuctionStatus.SCHEDULED) && (
                <button
                  onClick={() => {
                    setApproveAuctionId(selectedAuction.id);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-green-600 text-white hover:bg-green-700 rounded-sm uppercase tracking-wider"
                >
                  Aprovar & Publicar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM APPROVAL MODAL */}
      <ConfirmModal
        isOpen={approveAuctionId !== null}
        onClose={() => setApproveAuctionId(null)}
        onConfirm={handleApproveAuction}
        title="Publicar Leilão"
        message="Tem certeza de que deseja aprovar e publicar este leilão na plataforma? Licitantes poderão visualizá-lo e enviar lances assim que o leilão iniciar."
        confirmText="Confirmar Publicação"
        variant="primary"
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={deleteAuctionId !== null}
        onClose={() => setDeleteAuctionId(null)}
        onConfirm={handleDeleteAuction}
        title="Excluir Rascunho"
        message="Deseja realmente excluir permanentemente este rascunho de leilão? Esta ação é irreversível."
        confirmText="Excluir Rascunho"
        variant="danger"
      />

      {/* CANCEL AUCTION WITH REASON MODAL */}
      {cancelAuctionId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-xl animate-in zoom-in duration-200">
            <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Cancelar Leilão Ativo
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Por favor, informe a justificativa para o cancelamento imediato deste leilão ativo. Este motivo será visível aos licitantes.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Item foi denunciado por suspeita de fraude..."
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-red-500 outline-none resize-none mb-6"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setCancelAuctionId(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-sm uppercase"
              >
                Voltar
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={handleCancelAuction}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-sm uppercase disabled:opacity-50"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
