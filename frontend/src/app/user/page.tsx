"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth.store";
import auctionService from "@/services/auction.service";
import categoryService from "@/services/category.service";
import type { Auction } from "@/types/auction.types";
import { AuctionStatus, ItemCondition } from "@/types/auction.types";
import { Category } from "@/types/category.types";
import { formatCurrency, getAuctionStatusLabel, auctionStatusColor } from "@/utils/auction";
import { Calendar, AlertCircle, Gavel } from "lucide-react";

// Subcomponents
import UserSidebar from "@/components/user/UserSidebar";
import OverviewTab from "@/components/user/OverviewTab";
import MyAuctionsTab from "@/components/user/MyAuctionsTab";
import MyBidsTab from "@/components/user/MyBidsTab";
import SettingsTab from "@/components/user/SettingsTab";
import CreateAuctionTab from "@/components/user/CreateAuctionTab";

// Common UI Components
import ConfirmModal from "@/components/common/ConfirmModal";
import Modal from "@/components/common/Modal";
import StreamConsoleModal from "@/components/user/StreamConsoleModal";

export default function UserPage() {
  const router = useRouter();

  // Auth Store selectors
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"overview" | "my-auctions" | "my-bids" | "settings" | "create-auction">("overview");

  // Dashboard state
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);

  // Loading states
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);

  // Table pagination and filters
  const [myAuctionsPage, setMyAuctionsPage] = useState(1);
  const [myAuctionsTotal, setMyAuctionsTotal] = useState(0);
  const myAuctionsPageSize = 10;

  // Actions states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [cancelAuctionId, setCancelAuctionId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [approveAuctionId, setApproveAuctionId] = useState<number | null>(null);
  const [deleteAuctionId, setDeleteAuctionId] = useState<number | null>(null);
  
  // Streaming states
  const [selectedStreamAuction, setSelectedStreamAuction] = useState<Auction | null>(null);
  const [isStreamConsoleOpen, setIsStreamConsoleOpen] = useState(false);

  // Route protection
  useEffect(() => {
    if (status !== "loading" && !isAuthenticated) {
      router.push("/signin");
    }
  }, [status, isAuthenticated, router]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.list();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch User's Created Auctions
  const fetchMyAuctions = useCallback(async () => {
    if (!user) return;
    setLoadingAuctions(true);
    try {
      const params: Record<string, any> = {
        seller_id: user.id,
        page: myAuctionsPage,
        page_size: myAuctionsPageSize,
      };
      const res = await auctionService.list(params);
      if (res.success && res.data) {
        setMyAuctions(res.data.results);
        setMyAuctionsTotal(res.data.count);
      }
    } catch (err) {
      console.error("Erro ao carregar leilões criados:", err);
    } finally {
      setLoadingAuctions(false);
    }
  }, [user, myAuctionsPage]);

  // Fetch all auctions for global metric calculations (winning/bids lists)
  const fetchAllAuctions = useCallback(async () => {
    setLoadingAll(true);
    try {
      const res = await auctionService.list({ page_size: 100 });
      if (res.success && res.data) {
        setAllAuctions(res.data.results);
      }
    } catch (err) {
      console.error("Erro ao carregar leilões gerais:", err);
    } finally {
      setLoadingAll(false);
    }
  }, []);

  // Sync dashboard data
  useEffect(() => {
    if (user) {
      fetchMyAuctions();
      fetchAllAuctions();
    }
  }, [user, fetchMyAuctions, fetchAllAuctions]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    if (!user) return { totalCreated: 0, activeCreated: 0, wonCount: 0, participatingCount: 0 };

    const totalCreated = myAuctionsTotal;
    const activeCreated = myAuctions.filter(
      (a) => a.status === AuctionStatus.LIVE || a.status === AuctionStatus.SCHEDULED
    ).length;

    // Auctions won by the current user
    const wonCount = allAuctions.filter((a) => a.winner === user.id).length;

    // Auctions where current user is participating
    const participatingCount = allAuctions.filter(
      (a) => a.winner === user.id || (a.item?.seller !== user.id && a.bids_count && a.bids_count > 0)
    ).length;

    return { totalCreated, activeCreated, wonCount, participatingCount };
  }, [user, myAuctions, myAuctionsTotal, allAuctions]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  // Publish Draft Auction
  const handleApproveAuction = async () => {
    if (!approveAuctionId) return;
    try {
      const res = await auctionService.update(approveAuctionId, { publish: true });
      if (res.success) {
        fetchMyAuctions();
        fetchAllAuctions();
      }
    } catch (err) {
      console.error("Erro ao publicar leilão:", err);
    }
    setApproveAuctionId(null);
  };

  // Cancel Active Auction
  const handleCancelAuction = async () => {
    if (!cancelAuctionId) return;
    try {
      const res = await auctionService.cancel(cancelAuctionId, { reason: cancelReason });
      if (res.success) {
        fetchMyAuctions();
        fetchAllAuctions();
      }
    } catch (err) {
      console.error("Erro ao cancelar leilão:", err);
    }
    setCancelAuctionId(null);
    setCancelReason("");
  };

  // Delete Draft Auction
  const handleDeleteAuction = async () => {
    if (!deleteAuctionId) return;
    try {
      const res = await auctionService.delete(deleteAuctionId);
      if (res.success) {
        fetchMyAuctions();
        fetchAllAuctions();
      }
    } catch (err) {
      console.error("Erro ao excluir leilão:", err);
    }
    setDeleteAuctionId(null);
  };

  // Loading indicator
  if (status === "loading" || !user) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center select-none font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Carregando painel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 font-sans flex flex-col">
      {/* Sticky Top Header */}
      <Header />

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 flex flex-col md:flex-row gap-6 flex-1 select-none">
        {/* Sidebar Component */}
        <UserSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />

        {/* Tab content view area */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {activeTab === "overview" && (
            <OverviewTab
              user={user}
              metrics={metrics}
              loadingAuctions={loadingAuctions}
              myAuctions={myAuctions}
              loadingAll={loadingAll}
              allAuctions={allAuctions}
              onCreateNewClick={() => setActiveTab("create-auction")}
              onViewAllAuctionsClick={() => setActiveTab("my-auctions")}
              onViewAllBidsClick={() => setActiveTab("my-bids")}
            />
          )}

          {activeTab === "my-auctions" && (
            <MyAuctionsTab
              myAuctions={myAuctions}
              loadingAuctions={loadingAuctions}
              myAuctionsPage={myAuctionsPage}
              myAuctionsTotal={myAuctionsTotal}
              myAuctionsPageSize={myAuctionsPageSize}
              onPageChange={(page) => setMyAuctionsPage(page)}
              onViewDetails={setSelectedAuction}
              onPublishClick={setApproveAuctionId}
              onCancelClick={setCancelAuctionId}
              onDeleteClick={setDeleteAuctionId}
              onCreateNewClick={() => setActiveTab("create-auction")}
              onManageStreamClick={(auc) => {
                setSelectedStreamAuction(auc);
                setIsStreamConsoleOpen(true);
              }}
            />
          )}

          {activeTab === "my-bids" && (
            <MyBidsTab
              allAuctions={allAuctions}
              user={user}
              loadingAll={loadingAll}
            />
          )}

          {activeTab === "settings" && <SettingsTab user={user} />}

          {activeTab === "create-auction" && (
            <CreateAuctionTab
              categories={categories}
              onSuccess={() => {
                fetchMyAuctions();
                setActiveTab("my-auctions");
              }}
            />
          )}
        </div>
      </main>



      {/* DETAIL VIEW MODAL */}
      {selectedAuction && (
        <Modal
          isOpen={selectedAuction !== null}
          onClose={() => setSelectedAuction(null)}
          title={`Detalhes do Leilão #${selectedAuction.id}`}
          size="lg"
        >
          <div className="p-6 space-y-6 text-left">
            <div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                Item do Leilão
              </span>
              <h4 className="text-sm font-bold text-gray-900 leading-tight mt-0.5">
                {selectedAuction.item?.title}
              </h4>
              <p className="text-[10px] text-gray-600 leading-relaxed mt-2 bg-gray-50 p-3 rounded-sm border border-gray-100 italic">
                "{selectedAuction.item?.description || "Sem descrição informada para este item."}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">
                  Categoria
                </span>
                <span className="text-xs font-semibold text-gray-800">
                  {selectedAuction.item?.category_label || "Sem Categoria"}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">
                  Estado de Conservação
                </span>
                <span className="text-xs font-semibold text-gray-800 uppercase font-mono">
                  {selectedAuction.item?.condition_type || "Novo"}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">
                  ID Lote
                </span>
                <span className="text-xs font-semibold text-gray-800 font-mono">
                  #{selectedAuction.id}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">
                  Status Atual
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase mt-1 ${auctionStatusColor(
                    selectedAuction.status
                  )}`}
                >
                  {getAuctionStatusLabel(selectedAuction.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 bg-primary/5 p-4 rounded-sm border border-primary/10">
              <div>
                <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">
                  Preço Inicial
                </span>
                <span className="text-xs font-black text-gray-900 font-mono">
                  {formatCurrency(selectedAuction.item?.starting_price || 0)}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">
                  Preço Atual
                </span>
                <span className="text-xs font-black text-primary font-mono">
                  {formatCurrency(selectedAuction.item?.current_price || 0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div className="flex gap-2 items-center">
                <Calendar size={12} className="text-gray-400" />
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">
                    Início
                  </span>
                  <span className="text-[10px] font-semibold text-gray-700">
                    {new Date(selectedAuction.start_time).toLocaleString("pt-PT")}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Calendar size={12} className="text-gray-400" />
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">
                    Término
                  </span>
                  <span className="text-[10px] font-semibold text-gray-700">
                    {new Date(selectedAuction.end_time).toLocaleString("pt-PT")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedAuction(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-sm uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM APPROVAL MODAL */}
      <ConfirmModal
        isOpen={approveAuctionId !== null}
        onClose={() => setApproveAuctionId(null)}
        onConfirm={handleApproveAuction}
        title="Publicar Leilão"
        message="Tem certeza de que deseja publicar este rascunho de leilão? Isso o tornará ativo para lances assim que o horário de início for alcançado."
        confirmText="Publicar Leilão"
        variant="primary"
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteAuctionId !== null}
        onClose={() => setDeleteAuctionId(null)}
        onConfirm={handleDeleteAuction}
        title="Excluir Rascunho"
        message="Tem certeza de que deseja excluir permanentemente este rascunho? Esta ação não pode ser desfeita."
        confirmText="Excluir Rascunho"
        variant="danger"
      />

      {/* CANCEL MODAL WITH REASON */}
      {cancelAuctionId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-xl animate-in zoom-in duration-200 text-left">
            <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              Cancelar Leilão Ativo
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Informe o motivo para cancelar este leilão imediatamente. Os licitantes ativos serão notificados.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Erro no preenchimento das especificações ou lote avariado..."
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
                Cancelar Leilão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STREAM CONSOLE MODAL */}
      <StreamConsoleModal
        isOpen={isStreamConsoleOpen}
        onClose={() => {
          setIsStreamConsoleOpen(false);
          setSelectedStreamAuction(null);
        }}
        auction={selectedStreamAuction}
      />
    </div>
  );
}