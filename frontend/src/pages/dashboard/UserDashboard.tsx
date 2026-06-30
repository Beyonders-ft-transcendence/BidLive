import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/stores/auth.store";
import Header from "@/components/layout/Header";
import {
  useAuctionsQuery,
  useUpdateAuctionMutation,
  useCancelAuctionMutation,
  useDeleteAuctionMutation,
} from "@/hooks/useAuction";
import type { Auction } from "@/shared/types/auction.types";
import { AuctionStatus } from "@/shared/types/auction.types";
import { useCategoriesQuery } from "@/hooks/useCategory";
import { Calendar, AlertCircle } from "lucide-react";
import { formatCurrency, getAuctionStatusLabel, auctionStatusColor } from "@/shared/utils/auction.utils";

// Subcomponents
import ChatTab from "@/components/user/ChatTab";
import MyBidsTab from "@/components/user/MyBidsTab";
import OverviewTab from "@/components/user/OverviewTab";
import UserSidebar from "@/components/user/UserSidebar";
import MyAuctionsTab from "@/components/user/MyAuctionsTab";
import CreateAuctionTab from "@/components/user/CreateAuctionTab";

// Common UI Components
import ConfirmModal from "@/components/common/ConfirmModal";
import Modal from "@/components/common/Modal";
import StreamConsoleModal from "@/components/user/StreamConsoleModal";

export function UserDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auth Store selectors
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  // Sincronizar aba ativa a partir da URL (?tab=...)
  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "my-auctions", "my-bids", "create-auction", "chat"].includes(tab)) {
      return tab as "overview" | "my-auctions" | "my-bids" | "create-auction" | "chat";
    }
    return "overview";
  }, [searchParams]);

  const setActiveTab = (tab: "overview" | "my-auctions" | "my-bids" | "create-auction" | "chat") => {
    setSearchParams({ tab });
  };

  // Carregar categorias usando React Query
  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData || [];

  // Paginação e filtros para Meus Leilões
  const [myAuctionsPage, setMyAuctionsPage] = useState(1);
  const myAuctionsPageSize = 10;

  // Estados de ações
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [cancelAuctionId, setCancelAuctionId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [approveAuctionId, setApproveAuctionId] = useState<number | null>(null);
  const [deleteAuctionId, setDeleteAuctionId] = useState<number | null>(null);
  
  // Estados de Transmissão
  const [selectedStreamAuction, setSelectedStreamAuction] = useState<Auction | null>(null);
  const [isStreamConsoleOpen, setIsStreamConsoleOpen] = useState(false);

  // Proteção de Rota
  useEffect(() => {
    if (status !== "loading" && !isAuthenticated) {
      navigate("/signin");
    }
  }, [status, isAuthenticated, navigate]);

  // Buscar Leilões criados pelo próprio usuário
  const myAuctionsParams = useMemo(() => {
    if (!user) return null;
    return {
      seller_id: user.id,
      page: myAuctionsPage,
      page_size: myAuctionsPageSize,
    };
  }, [user, myAuctionsPage]);

  const queryClient = useQueryClient();

  // Mutations
  const updateAuctionMutation = useUpdateAuctionMutation();
  const cancelAuctionMutation = useCancelAuctionMutation();
  const deleteAuctionMutation = useDeleteAuctionMutation();

  const {
    data: myAuctionsData,
    isLoading: loadingAuctions,
  } = useAuctionsQuery(myAuctionsParams || undefined);

  const myAuctions = myAuctionsData?.results || [];
  const myAuctionsTotal = myAuctionsData?.count || 0;

  // Buscar todos os leilões para o histórico global de lances
  const {
    data: allAuctionsData,
    isLoading: loadingAll,
  } = useAuctionsQuery({ page_size: 100 });

  const allAuctions = allAuctionsData?.results || [];

  const fetchMyAuctions = () => {
    queryClient.invalidateQueries({ queryKey: ["auctions"] });
  };

  // Calcular métricas resumidas
  const metrics = useMemo(() => {
    if (!user) return { totalCreated: 0, activeCreated: 0, wonCount: 0, participatingCount: 0 };

    const totalCreated = myAuctionsTotal;
    const activeCreated = myAuctions.filter(
      (a) => a.status === AuctionStatus.LIVE || a.status === AuctionStatus.SCHEDULED
    ).length;

    // Leilões arrematados pelo usuário atual
    const wonCount = allAuctions.filter((a) => a.winner === user.id).length;

    // Leilões em que o usuário está participando (ganhando ou deu algum lance)
    const participatingCount = allAuctions.filter(
      (a) => a.winner === user.id || (a.item?.seller !== user.id && a.bids_count && a.bids_count > 0)
    ).length;

    return { totalCreated, activeCreated, wonCount, participatingCount };
  }, [user, myAuctions, myAuctionsTotal, allAuctions]);

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  // Publicar rascunho de leilão
  const handleApproveAuction = async () => {
    if (!approveAuctionId) return;
    try {
      await updateAuctionMutation.mutateAsync({
        id: approveAuctionId,
        payload: { publish: true },
      });
      fetchMyAuctions();
    } catch (err) {
      console.error("Erro ao publicar leilão:", err);
    }
    setApproveAuctionId(null);
  };

  // Cancelar leilão ativo
  const handleCancelAuction = async () => {
    if (!cancelAuctionId) return;
    try {
      await cancelAuctionMutation.mutateAsync({
        id: cancelAuctionId,
        payload: { reason: cancelReason },
      });
      fetchMyAuctions();
    } catch (err) {
      console.error("Erro ao cancelar leilão:", err);
    }
    setCancelAuctionId(null);
    setCancelReason("");
  };

  // Excluir rascunho de leilão
  const handleDeleteAuction = async () => {
    if (!deleteAuctionId) return;
    try {
      await deleteAuctionMutation.mutateAsync(deleteAuctionId);
      fetchMyAuctions();
    } catch (err) {
      console.error("Erro ao excluir leilão:", err);
    }
    setDeleteAuctionId(null);
  };

  // Carregando
  if (status === "loading" || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center select-none font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
            Carregando painel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Header Global */}
      <Header />

      {/* Container Principal */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start gap-6 flex-1 select-none">
        {/* Sidebar do Usuário */}
        <UserSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />

        {/* Área de Conteúdo da Aba Ativa */}
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

          {activeTab === "chat" && <ChatTab />}

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

      {/* MODAL DE VISUALIZAÇÃO DE DETALHES */}
      {selectedAuction && (
        <Modal
          isOpen={selectedAuction !== null}
          onClose={() => setSelectedAuction(null)}
          title={`Detalhes do Leilão #${selectedAuction.id}`}
          size="lg"
        >
          <div className="p-6 space-y-6 text-left text-foreground bg-card">
            <div>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Item do Leilão
              </span>
              <h4 className="text-sm font-bold leading-tight mt-0.5">
                {selectedAuction.item?.title}
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-2 bg-muted/30 p-3 rounded-sm border border-border italic">
                "{selectedAuction.item?.description || "Sem descrição informada para este item."}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Categoria
                </span>
                <span className="text-xs font-semibold">
                  {selectedAuction.item?.category_label || "Sem Categoria"}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Estado de Conservação
                </span>
                <span className="text-xs font-semibold uppercase font-mono">
                  {selectedAuction.item?.condition_type || "Novo"}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
                  ID Lote
                </span>
                <span className="text-xs font-semibold font-mono">
                  #{selectedAuction.id}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
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

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 bg-primary/5 p-4 rounded-sm border border-primary/10">
              <div>
                <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">
                  Preço Inicial
                </span>
                <span className="text-xs font-black font-mono">
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

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="flex gap-2 items-center">
                <Calendar size={12} className="text-muted-foreground" />
                <div>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Início
                  </span>
                  <span className="text-[10px] font-semibold">
                    {new Date(selectedAuction.start_time).toLocaleString("pt-PT")}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Calendar size={12} className="text-muted-foreground" />
                <div>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Término
                  </span>
                  <span className="text-[10px] font-semibold">
                    {new Date(selectedAuction.end_time).toLocaleString("pt-PT")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setSelectedAuction(null)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted border border-border rounded-sm uppercase tracking-wider cursor-pointer bg-background"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRMAÇÃO DE PUBLICAÇÃO */}
      <ConfirmModal
        isOpen={approveAuctionId !== null}
        onClose={() => setApproveAuctionId(null)}
        onConfirm={handleApproveAuction}
        title="Publicar Leilão"
        message="Tem certeza de que deseja publicar este rascunho de leilão? Isso o tornará ativo para lances assim que o horário de início for alcançado."
        confirmText="Publicar Leilão"
        variant="primary"
      />

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal
        isOpen={deleteAuctionId !== null}
        onClose={() => setDeleteAuctionId(null)}
        onConfirm={handleDeleteAuction}
        title="Excluir Rascunho"
        message="Tem certeza de que deseja excluir permanentemente este rascunho? Esta ação não pode ser desfeita."
        confirmText="Excluir Rascunho"
        variant="danger"
      />

      {/* CANCELAMENTO COM JUSTIFICATIVA */}
      {cancelAuctionId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-sm max-w-md w-full p-6 shadow-xl animate-in zoom-in duration-200 text-left text-foreground">
            <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-destructive" />
              Cancelar Leilão Ativo
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Informe o motivo para cancelar este leilão imediatamente. Os licitantes ativos serão notificados.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Erro no preenchimento das especificações ou lote avariado..."
              className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-destructive outline-none resize-none mb-6"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setCancelAuctionId(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted border border-border rounded-sm uppercase cursor-pointer bg-background"
              >
                Voltar
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={handleCancelAuction}
                className="px-4 py-2 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm uppercase disabled:opacity-50 cursor-pointer border-none"
              >
                Cancelar Leilão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLE DE TRANSMISSÃO */}
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
