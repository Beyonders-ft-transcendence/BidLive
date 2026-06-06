"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSection from "@/components/common/TableSection";
import auctionService from "@/services/auction.service";
import categoryService from "@/services/category.service";
import type { Auction, AuctionCategory } from "@/types/auction.types";
import { AuctionStatus } from "@/types/auction.types";
import { auctionStatusColor, getAuctionStatusLabel, formatCurrency } from "@/utils/auction";
import {
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  X,
  AlertTriangle,
  Gavel,
  Calendar,
  DollarSign
} from "lucide-react";

export default function Auctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<AuctionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  
  // Pagination & Counts
  const [totalCount, setTotalCount] = useState(0);
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

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.list();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Auctions
  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        page_size: pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
      };

      const res = await auctionService.list(params);
      if (res.success && res.data) {
        setAuctions(res.data.results);
        setTotalCount(res.data.count);
      }
    } catch (err) {
      console.error("Erro ao carregar leilões da API:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // View details modal
  const handleViewDetails = async (auctionId: number) => {
    try {
      const res = await auctionService.retrieve(auctionId);
      if (res.success && res.data) {
        setSelectedAuction(res.data);
      }
    } catch (err) {
      console.error("Erro ao obter detalhes do leilão:", err);
    }
  };

  // Publish / Approve Auction
  const handleApproveAuction = async () => {
    if (!approveAuctionId) return;
    try {
      const res = await auctionService.update(approveAuctionId, { publish: true });
      if (res.success) {
        fetchAuctions();
        if (selectedAuction && selectedAuction.id === approveAuctionId) {
          setSelectedAuction(res.data || null);
        }
      }
    } catch (err) {
      console.error("Erro ao aprovar leilão:", err);
    }
    setApproveAuctionId(null);
  };

  // Cancel Auction
  const handleCancelAuction = async () => {
    if (!cancelAuctionId) return;
    try {
      const res = await auctionService.cancel(cancelAuctionId, { reason: cancelReason });
      if (res.success) {
        fetchAuctions();
        if (selectedAuction && selectedAuction.id === cancelAuctionId) {
          setSelectedAuction(res.data || null);
        }
      }
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
      const res = await auctionService.delete(deleteAuctionId);
      if (res.success) {
        fetchAuctions();
        if (selectedAuction && selectedAuction.id === deleteAuctionId) {
          setSelectedAuction(null);
        }
      }
    } catch (err) {
      console.error("Erro ao excluir leilão:", err);
    }
    setDeleteAuctionId(null);
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
              onClick={() => setSelectedAuction(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Gavel size={16} className="text-primary" />
              Detalhes do Leilão #{selectedAuction.id}
            </h3>

            <div className="space-y-6">
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
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 bg-primary/5 p-4 rounded-sm border border-primary/10">
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

              {/* Cancellation notes if exists */}
              {selectedAuction.status === AuctionStatus.CANCELLED && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-sm flex gap-3 text-red-700">
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
                onClick={() => setSelectedAuction(null)}
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
