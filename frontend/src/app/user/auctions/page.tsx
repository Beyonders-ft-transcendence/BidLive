"use client";

import { useEffect, useState, useCallback } from "react";
import { auctionStatusColor, formatCurrency, getAuctionStatusLabel } from "@/utils/auction";
import TableFilters from "@/components/common/TableFilters";
import ActionCard from "@/components/common/ActionCard";
import Modal from "@/components/common/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useAuthStore } from "@/store/auth.store";
import auctionService from "@/services/auction.service";
import {
  ItemCondition, AuctionStatus,
  type Auction, type AuctionCategory, type Bid
} from "@/types/auction.types";
import {
  Eye, Edit3, Ban, BarChart3, Trash2,
  ChevronLeft, ChevronRight, X, Clock,
  TrendingUp, Users, Plus, Upload, Loader2, Play
} from "lucide-react";

export default function MeusLeiloes() {
  const user = useAuthStore((state) => state.user);

  // Data State
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<AuctionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals / Action State
  const [statsAuction, setStatsAuction] = useState<Auction | null>(null);
  const [statsBids, setStatsBids] = useState<Bid[]>([]);
  const [loadingStatsBids, setLoadingStatsBids] = useState(false);

  const [detailAuction, setDetailAuction] = useState<Auction | null>(null);

  const [confirmCancel, setConfirmCancel] = useState<Auction | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<Auction | null>(null);

  // Create / Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editAuction, setEditAuction] = useState<Auction | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    condition_type: ItemCondition.NEW,
    starting_price: "",
    minimum_increment: "1",
    reserve_price: "",
    buy_now_price: "",
    start_time: "",
    end_time: "",
    is_draft: false,
    publish: false,
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await auctionService.listCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Erro ao obter categorias:", err);
    }
  }, []);

  // Fetch Auctions
  const fetchAuctions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await auctionService.list({
        seller_id: user.id,
        search: search || undefined,
        status: statusFilter || undefined,
        page: currentPage,
        page_size: pageSize,
      });
      if (res.success && res.data) {
        setAuctions(res.data.results);
        setTotalCount(res.data.count);
      }
    } catch (err) {
      console.error("Erro ao carregar leilões:", err);
    } finally {
      setLoading(false);
    }
  }, [user, search, statusFilter, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Statistics / Summary totals calculated from all user auctions
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
  const fetchAllForStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await auctionService.list({
        seller_id: user.id,
        page_size: 100,
      });
      if (res.success && res.data) {
        setAllAuctions(res.data.results);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchAllForStats();
  }, [fetchAllForStats, auctions]);

  const totals = {
    ativos: allAuctions.filter(a => a.status === AuctionStatus.LIVE || a.status === AuctionStatus.SCHEDULED).length,
    encerrados: allAuctions.filter(a => a.status === AuctionStatus.ENDED || a.status === AuctionStatus.SOLD).length,
    drafts: allAuctions.filter(a => a.status === AuctionStatus.DRAFT).length,
    bids: allAuctions.reduce((s, a) => s + (Number(a.bids_count) || 0), 0),
  };

  // Fetch bids history for stats modal
  useEffect(() => {
    if (!statsAuction) return;
    const fetchBids = async () => {
      setLoadingStatsBids(true);
      try {
        const res = await auctionService.listBids(statsAuction.id, { page_size: 20 });
        if (res.success && res.data) {
          setStatsBids(res.data.results);
        }
      } catch (err) {
        console.error("Erro ao obter lances:", err);
      } finally {
        setLoadingStatsBids(false);
      }
    };
    fetchBids();
  }, [statsAuction]);

  // Form handlers
  const handleOpenCreate = () => {
    setEditAuction(null);
    setFormData({
      title: "",
      description: "",
      category_id: categories[0]?.id ? String(categories[0].id) : "",
      condition_type: ItemCondition.NEW,
      starting_price: "",
      minimum_increment: "1",
      reserve_price: "",
      buy_now_price: "",
      start_time: new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16), // 30m in future
      end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 24h in future
      is_draft: false,
      publish: false,
    });
    setSelectedImages([]);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (auction: Auction) => {
    setEditAuction(auction);
    // Convert backend dates to datetime-local format
    const localStart = auction.start_time ? new Date(auction.start_time).toISOString().slice(0, 16) : "";
    const localEnd = auction.end_time ? new Date(auction.end_time).toISOString().slice(0, 16) : "";

    setFormData({
      title: auction.item?.title || "",
      description: auction.item?.description || "",
      category_id: auction.item?.category?.id ? String(auction.item.category.id) : "",
      condition_type: auction.item?.condition_type || ItemCondition.NEW,
      starting_price: auction.item?.starting_price || "",
      minimum_increment: auction.item?.minimum_increment || "1",
      reserve_price: auction.item?.reserve_price || "",
      buy_now_price: auction.item?.buy_now_price || "",
      start_time: localStart,
      end_time: localEnd,
      is_draft: auction.status === AuctionStatus.DRAFT,
      publish: false,
    });
    setSelectedImages([]);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormErrors({});

    try {
      const payload: any = {
        description: formData.description,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        reserve_price: formData.reserve_price ? Number(formData.reserve_price) : null,
        buy_now_price: formData.buy_now_price ? Number(formData.buy_now_price) : null,
        images: selectedImages,
      };

      let res;
      if (editAuction) {
        payload.publish = formData.publish;
        res = await auctionService.update(editAuction.id, payload);
      } else {
        payload.title = formData.title;
        payload.condition_type = formData.condition_type;
        payload.starting_price = Number(formData.starting_price);
        payload.minimum_increment = Number(formData.minimum_increment);
        payload.is_draft = formData.is_draft;
        res = await auctionService.create(payload);
      }

      if (res.success) {
        setIsFormOpen(false);
        fetchAuctions();
      } else if (res.errors) {
        setFormErrors(res.errors);
      }
    } catch (err: any) {
      console.error("Erro ao salvar leilão:", err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelAuction = async () => {
    if (!confirmCancel) return;
    try {
      const res = await auctionService.cancel(confirmCancel.id, { reason: cancelReason || "Cancelado pelo vendedor" });
      if (res.success) {
        setConfirmCancel(null);
        setCancelReason("");
        fetchAuctions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAuction = async () => {
    if (!confirmDelete) return;
    try {
      const res = await auctionService.delete(confirmDelete.id);
      if (res.success) {
        setConfirmDelete(null);
        fetchAuctions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 select-none">

      {/* HEADER */}
      <ActionCard
        title="Meus Leilões"
        subtitle="Gerencie e acompanhe todos os seus leilões criados"
        buttonLabel="Criar Leilão"
        onButtonClick={handleOpenCreate}
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Leilões Ativos / Agendados", value: totals.ativos, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Finalizados / Vendidos", value: totals.encerrados, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Leilões em Rascunho", value: totals.drafts, icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Total de Bids Recebidos", value: totals.bids, icon: Plus, color: "text-orange-600", bg: "bg-orange-50" },
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

      {/* TABLE */}
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
              { value: "DRAFT", label: "Rascunho" },
              { value: "SCHEDULED", label: "Agendado" },
              { value: "LIVE", label: "Ao Vivo" },
              { value: "ENDED", label: "Encerrados" },
              { value: "CANCELLED", label: "Cancelados" },
              { value: "SOLD", label: "Vendido" },
            ],
          }}
        />

        <div className="overflow-x-auto mt-2">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="p-3">Leilão</th>
                <th className="py-3">Status</th>
                <th className="py-3">Preço Atual</th>
                <th className="py-3 text-center">Bids</th>
                <th className="py-3">Início</th>
                <th className="py-3">Fim</th>
                <th className="py-3 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[11px] text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">Carregando leilões da API...</td>
                </tr>
              ) : auctions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">Nenhum leilão encontrado.</td>
                </tr>
              ) : auctions.map((auction) => (
                <tr key={auction.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50/5 border border-primary/10 rounded-sm flex items-center justify-center text-base shrink-0 font-bold">
                        {auction.item?.images?.[0]?.file?.url ? (
                          <img src={auction.item.images[0].file.url} alt="" className="w-full h-full object-cover rounded-sm" />
                        ) : "📦"}
                      </div>
                      <div>
                        <span className="font-bold text-gray-950 block">{auction.item?.title || "Leilão sem título"}</span>
                        <span className="text-[9px] text-gray-400 font-bold font-mono">ID: #{auction.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase border ${auctionStatusColor(auction.status)}`}>
                      {getAuctionStatusLabel(auction.status)}
                    </span>
                  </td>
                  <td className="font-bold text-primary font-mono">{formatCurrency(auction.item?.current_price || 0)}</td>
                  <td className="text-center font-bold font-mono">{auction.bids_count || 0}</td>
                  <td className="text-gray-500 font-bold">{new Date(auction.start_time).toLocaleString("pt-PT")}</td>
                  <td className="text-gray-500 font-bold">{new Date(auction.end_time).toLocaleString("pt-PT")}</td>
                  <td className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Ver Detalhes"
                        onClick={() => setDetailAuction(auction)}
                        className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-600 transition"
                      >
                        <Eye size={13} />
                      </button>
                      {auction.status === AuctionStatus.DRAFT && (
                        <button
                          title="Editar/Publicar"
                          onClick={() => handleOpenEdit(auction)}
                          className="p-1.5 rounded-sm hover:bg-blue-50 text-primary transition"
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                      {auction.status === AuctionStatus.DRAFT && (
                        <button
                          title="Excluir"
                          onClick={() => setConfirmDelete(auction)}
                          className="p-1.5 rounded-sm hover:bg-red-50 text-red-600 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      {(auction.status === AuctionStatus.SCHEDULED || auction.status === AuctionStatus.LIVE) && (
                        <button
                          title="Cancelar Leilão"
                          onClick={() => setConfirmCancel(auction)}
                          className="p-1.5 rounded-sm hover:bg-red-50 text-red-600 transition"
                        >
                          <Ban size={13} />
                        </button>
                      )}
                      <button
                        title="Estatísticas e Lances"
                        onClick={() => setStatsAuction(auction)}
                        className="p-1.5 rounded-sm hover:bg-purple-50 text-purple-600 transition"
                      >
                        <BarChart3 size={13} />
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
              Mostrando {Math.min(totalCount, (currentPage - 1) * pageSize + 1)}–{Math.min(totalCount, currentPage * pageSize)} de {totalCount}
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

      {/* CREATE / EDIT DIALOG */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editAuction ? "Editar Leilão" : "Criar Novo Leilão"}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Title (Create only) */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Título do Item</label>
              <input
                type="text"
                required
                disabled={!!editAuction}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: iPhone 15 Pro Max 256GB"
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100 transition"
              />
              {formErrors.title && <p className="text-[9px] font-bold text-red-500">{formErrors.title[0]}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Descrição Detalhada</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes sobre o estado do item, o que acompanha, etc."
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              />
              {formErrors.description && <p className="text-[9px] font-bold text-red-500">{formErrors.description[0]}</p>}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Categoria</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="px-3 py-2 border border-gray-200 bg-white rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Condition Type (Create only) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Condição do Item</label>
              <select
                disabled={!!editAuction}
                value={formData.condition_type}
                onChange={(e) => setFormData({ ...formData, condition_type: e.target.value as ItemCondition })}
                className="px-3 py-2 border border-gray-200 bg-white rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100 transition"
              >
                <option value={ItemCondition.NEW}>Novo / Selado</option>
                <option value={ItemCondition.USED}>Usado</option>
                <option value={ItemCondition.REFURBISHED}>Recondicionado</option>
                <option value={ItemCondition.DAMAGED}>Com Defeito</option>
              </select>
            </div>

            {/* Starting Price (Create only) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Preço Inicial (AOA)</label>
              <input
                type="number"
                required
                disabled={!!editAuction}
                value={formData.starting_price}
                onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                placeholder="Ex: 50000"
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100 transition"
              />
              {formErrors.starting_price && <p className="text-[9px] font-bold text-red-500">{formErrors.starting_price[0]}</p>}
            </div>

            {/* Min Increment (Create only) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Incremento Mínimo (AOA)</label>
              <input
                type="number"
                required
                disabled={!!editAuction}
                value={formData.minimum_increment}
                onChange={(e) => setFormData({ ...formData, minimum_increment: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100 transition"
              />
              {formErrors.minimum_increment && <p className="text-[9px] font-bold text-red-500">{formErrors.minimum_increment[0]}</p>}
            </div>

            {/* Reserve Price */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Preço Reserva (Opcional)</label>
              <input
                type="number"
                value={formData.reserve_price}
                onChange={(e) => setFormData({ ...formData, reserve_price: e.target.value })}
                placeholder="Ex: 80000"
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              />
              {formErrors.reserve_price && <p className="text-[9px] font-bold text-red-500">{formErrors.reserve_price[0]}</p>}
            </div>

            {/* Buy Now Price */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Preço Compra Imediata (Opcional)</label>
              <input
                type="number"
                value={formData.buy_now_price}
                onChange={(e) => setFormData({ ...formData, buy_now_price: e.target.value })}
                placeholder="Ex: 120000"
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              />
              {formErrors.buy_now_price && <p className="text-[9px] font-bold text-red-500">{formErrors.buy_now_price[0]}</p>}
            </div>

            {/* Start Time */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Data/Hora de Início</label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              />
              {formErrors.start_time && <p className="text-[9px] font-bold text-red-500">{formErrors.start_time[0]}</p>}
            </div>

            {/* End Time */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Data/Hora de Fim</label>
              <input
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              />
              {formErrors.end_time && <p className="text-[9px] font-bold text-red-500">{formErrors.end_time[0]}</p>}
            </div>

            {/* Images Upload */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Imagens do Produto</label>
              <div className="border-2 border-dashed border-gray-200 rounded-sm p-4 text-center hover:bg-gray-50/50 transition relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedImages(Array.from(e.target.files));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto text-gray-400 mb-2" size={20} />
                <span className="text-xs text-gray-500 block font-medium">Clique ou arraste imagens aqui</span>
                <span className="text-[9px] text-gray-400 block mt-1">PNG, JPG ou WEBP de até 5MB</span>
              </div>
              {selectedImages.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedImages.map((img, idx) => (
                    <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-600 font-mono text-[9px] px-2 py-1 rounded-sm">
                      {img.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Options (Draft Checkbox for Create, Publish for Edit) */}
            <div className="md:col-span-2 flex items-center gap-3 py-2">
              {editAuction ? (
                editAuction.status === AuctionStatus.DRAFT && (
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.publish}
                      onChange={(e) => setFormData({ ...formData, publish: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>Publicar Leilão Imediatamente</span>
                  </label>
                )
              ) : (
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_draft}
                    onChange={(e) => setFormData({ ...formData, is_draft: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>Salvar como Rascunho</span>
                </label>
              )}
            </div>

          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-sm transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editAuction ? "Salvar Alterações" : formData.is_draft ? "Salvar Rascunho" : "Criar Leilão"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailAuction}
        onClose={() => setDetailAuction(null)}
        title="Detalhes do Leilão"
        size="md"
      >
        {detailAuction && (
          <div className="p-6 space-y-4 select-none">
            <div className="flex gap-4 items-start border-b border-gray-50 pb-4">
              <div className="w-16 h-16 bg-blue-50/5 border border-primary/10 rounded-sm flex items-center justify-center text-3xl font-bold shrink-0">
                {detailAuction.item?.images?.[0]?.file?.url ? (
                  <img src={detailAuction.item.images[0].file.url} alt="" className="w-full h-full object-cover rounded-sm" />
                ) : "📦"}
              </div>
              <div className="flex-1">
                <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase border ${auctionStatusColor(detailAuction.status)}`}>
                  {getAuctionStatusLabel(detailAuction.status)}
                </span>
                <h4 className="font-black text-gray-950 text-base leading-tight mt-1">{detailAuction.item?.title}</h4>
                <p className="text-[10px] text-gray-400 font-mono font-bold mt-0.5">ID: #{detailAuction.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs border-b border-gray-50 pb-4">
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Categoria</span>
                <span className="font-bold text-gray-800">{detailAuction.item?.category?.name || "Sem Categoria"}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Condição</span>
                <span className="font-bold text-gray-800 uppercase">{detailAuction.item?.condition_type || "—"}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Preço Inicial</span>
                <span className="font-bold text-gray-800 font-mono">{formatCurrency(detailAuction.item?.starting_price || 0)}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Preço Reserva</span>
                <span className="font-bold text-gray-800 font-mono">{detailAuction.item?.reserve_price ? formatCurrency(detailAuction.item.reserve_price) : "Sem Reserva"}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Compra Imediata</span>
                <span className="font-bold text-gray-800 font-mono">{detailAuction.item?.buy_now_price ? formatCurrency(detailAuction.item.buy_now_price) : "Sem Compra Imediata"}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Preço Atual</span>
                <span className="font-black text-primary font-mono">{formatCurrency(detailAuction.item?.current_price || 0)}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Horário de Início</span>
                <span className="font-bold text-gray-700">{new Date(detailAuction.start_time).toLocaleString("pt-PT")}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Horário de Fim</span>
                <span className="font-bold text-gray-700">{new Date(detailAuction.end_time).toLocaleString("pt-PT")}</span>
              </div>
            </div>

            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Descrição do Produto</span>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 p-3 rounded-sm">
                {detailAuction.item?.description || "Sem descrição disponível."}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailAuction(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-sm transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* STATISTICS & BIDS HISTORIC MODAL */}
      <Modal
        isOpen={!!statsAuction}
        onClose={() => setStatsAuction(null)}
        title="📊 Estatísticas e Histórico de Lances"
        size="lg"
      >
        {statsAuction && (
          <div className="p-6 space-y-5 select-none">
            <div className="flex flex-col gap-0.5 border-b border-gray-50 pb-3">
              <h4 className="font-black text-gray-950 text-sm leading-tight">{statsAuction.item?.title}</h4>
              <p className="text-[9px] text-gray-400 font-mono font-bold">Resumo estatístico do leilão #{statsAuction.id}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-100 rounded-sm p-4 flex items-center gap-3">
                <div className="p-2 rounded-sm bg-blue-50 text-blue-600"><Users size={18} /></div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Total Lances</p>
                  <p className="text-sm font-black text-gray-950 mt-0.5">{statsAuction.bids_count || 0}</p>
                </div>
              </div>
              <div className="border border-gray-100 rounded-sm p-4 flex items-center gap-3">
                <div className="p-2 rounded-sm bg-green-50 text-green-600"><TrendingUp size={18} /></div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Maior Lance</p>
                  <p className="text-sm font-black text-gray-950 mt-0.5 font-mono">{formatCurrency(statsAuction.item?.current_price || 0)}</p>
                </div>
              </div>
              <div className="border border-gray-100 rounded-sm p-4 flex items-center gap-3">
                <div className="p-2 rounded-sm bg-purple-50 text-purple-600"><Clock size={18} /></div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Status Atual</p>
                  <p className="text-xs font-black text-gray-950 mt-0.5 uppercase">{getAuctionStatusLabel(statsAuction.status)}</p>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-[10px] font-bold text-gray-900 uppercase mb-3">Histórico de Ofertas (Recentes)</h5>
              <div className="border border-gray-100 rounded-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="p-3">Licitante</th>
                      <th className="py-3">Valor</th>
                      <th className="py-3">Horário</th>
                      <th className="py-3 text-right pr-6">IP Origem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[10px] text-gray-700 font-mono">
                    {loadingStatsBids ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400 font-medium font-sans">Carregando ofertas da API...</td>
                      </tr>
                    ) : statsBids.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400 font-medium font-sans">Nenhum lance ofertado ainda.</td>
                      </tr>
                    ) : statsBids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-3 font-bold text-gray-950 font-sans">
                          {bid.bidder?.full_name || bid.bidder?.username || `Licitante #${bid.bidder_id}`}
                        </td>
                        <td className="py-3 font-bold text-primary">{formatCurrency(bid.amount)}</td>
                        <td className="py-3 text-gray-500 font-sans">{new Date(bid.created_at || bid.timestamp).toLocaleString("pt-PT")}</td>
                        <td className="py-3 text-right pr-6 text-gray-400 text-[9px]">{bid.ip_address || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStatsAuction(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-sm transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL AUCTION CONFIRM MODAL */}
      <Modal
        isOpen={!!confirmCancel}
        onClose={() => { setConfirmCancel(null); setCancelReason(""); }}
        title="Cancelar Leilão"
        size="sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-600">
            Tem certeza de que deseja cancelar o leilão do item <strong className="text-gray-950">"{confirmCancel?.item?.title}"</strong>?
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-gray-500 uppercase">Motivo do Cancelamento</label>
            <input
              type="text"
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Produto danificado ou indisponível"
              className="px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <button
              onClick={() => { setConfirmCancel(null); setCancelReason(""); }}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-sm transition cursor-pointer"
            >
              Voltar
            </button>
            <button
              onClick={handleCancelAuction}
              disabled={!cancelReason.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-sm transition cursor-pointer disabled:opacity-50"
            >
              Cancelar Leilão
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE AUCTION CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteAuction}
        title="Excluir Leilão"
        message={`Esta ação removerá permanentemente o rascunho de "${confirmDelete?.item?.title}". Esta ação não poderá ser desfeita.`}
        confirmText="Excluir"
        cancelText="Voltar"
        variant="danger"
      />

    </div>
  );
}
