import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/stores/auth.store";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  useAuctionsQuery,
  useAuctionQuery,
  useUpdateAuctionMutation,
  useCancelAuctionMutation,
  useDeleteAuctionMutation,
} from "@/hooks/useAuction";
import { AlertCircle } from "lucide-react";
import { useCategoriesQuery } from "@/hooks/useCategory";
import { AuctionStatus } from "@/shared/types/auction.types";

// Subcomponents
import ChatTab from "@/components/user/ChatTab";
import FriendsTab from "@/components/user/FriendsTab";
import MyBidsTab from "@/components/user/MyBidsTab";
import OverviewTab from "@/components/user/OverviewTab";
import UserSidebar from "@/components/user/UserSidebar";
import MyAuctionsTab from "@/components/user/MyAuctionsTab";
import CreateAuctionTab from "@/components/user/CreateAuctionTab";
import AuctionDetailTab from "@/components/user/AuctionDetailTab";
import FavoritesTab from "@/components/user/FavoritesTab";
import LiveStreamTab from "@/components/user/LiveStreamTab";
import MyReportsTab from "@/components/user/MyReportsTab";
import ProfileTab from "@/components/user/ProfileTab";

// Common UI Components
import ConfirmModal from "@/components/common/ConfirmModal";

export function UserDashboard() {
  const { t } = useTranslation();

  useDocumentTitle(t('user_dashboard.title'));

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
    if (tab && ["overview", "profile", "my-auctions", "my-bids", "create-auction", "chat", "friends", "auction-detail", "favorites", "live-stream", "reports"].includes(tab)) {
      return tab as "overview" | "profile" | "my-auctions" | "my-bids" | "create-auction" | "chat" | "friends" | "auction-detail" | "favorites" | "live-stream" | "reports";
    }
    return "overview";
  }, [searchParams]);

  const setActiveTab = (tab: "overview" | "profile" | "my-auctions" | "my-bids" | "create-auction" | "chat" | "friends" | "auction-detail" | "favorites" | "live-stream" | "reports") => {
    setSearchParams({ tab });
  };

  const selectedAuctionId = useMemo(() => {
    const id = searchParams.get("id");
    return id ? Number(id) : null;
  }, [searchParams]);

  // Carregar leilão individual caso esteja visualizando detalhes
  const { data: fetchedAuction, isLoading: loadingDetail } = useAuctionQuery(
    selectedAuctionId || 0
  );

  // Carregar categorias usando React Query
  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData || [];

  // Paginação e filtros para Meus Leilões
  const [myAuctionsPage, setMyAuctionsPage] = useState(1);
  const myAuctionsPageSize = 10;

  // Estados de ações
  const [cancelAuctionId, setCancelAuctionId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [approveAuctionId, setApproveAuctionId] = useState<number | null>(null);
  const [deleteAuctionId, setDeleteAuctionId] = useState<number | null>(null);
  


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
            {t('user_dashboard.loading_dashboard')}
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

          {activeTab === "profile" && <ProfileTab />}

          {activeTab === "my-auctions" && (
            <MyAuctionsTab
              myAuctions={myAuctions}
              loadingAuctions={loadingAuctions}
              myAuctionsPage={myAuctionsPage}
              myAuctionsTotal={myAuctionsTotal}
              myAuctionsPageSize={myAuctionsPageSize}
              onPageChange={(page) => setMyAuctionsPage(page)}
              onViewDetails={(auc) => setSearchParams({ tab: "auction-detail", id: String(auc.id) })}
              onPublishClick={setApproveAuctionId}
              onCancelClick={setCancelAuctionId}
              onDeleteClick={setDeleteAuctionId}
              onCreateNewClick={() => setActiveTab("create-auction")}
              onManageStreamClick={(auc) => setSearchParams({ tab: "live-stream", id: String(auc.id) })}
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
          {activeTab === "friends" && <FriendsTab />}
          {activeTab === "reports" && <MyReportsTab />}

          {activeTab === "create-auction" && (
            <CreateAuctionTab
              categories={categories}
              onSuccess={() => {
                fetchMyAuctions();
                setActiveTab("my-auctions");
              }}
            />
          )}

          {activeTab === "auction-detail" && (
            loadingDetail ? (
              <div className="bg-card border border-border p-12 rounded-sm text-center flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-muted-foreground font-semibold">{t('user_dashboard.loading_auction_detail')}</span>
              </div>
            ) : fetchedAuction ? (
              <AuctionDetailTab
                auction={fetchedAuction}
                onBack={() => setSearchParams({ tab: "my-auctions" })}
                onPublishClick={setApproveAuctionId}
                onCancelClick={setCancelAuctionId}
                onDeleteClick={setDeleteAuctionId}
                onManageStreamClick={(auc) => setSearchParams({ tab: "live-stream", id: String(auc.id) })}
              />
            ) : (
              <div className="bg-card border border-border p-12 rounded-sm text-center">
                <p className="text-sm font-bold text-destructive">{t('user_dashboard.auction_not_found')}</p>
                <button
                  onClick={() => setSearchParams({ tab: "my-auctions" })}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-sm cursor-pointer"
                >
                  {t('user_dashboard.back_to_my_auctions')}
                </button>
              </div>
            )
          )}

          {activeTab === "favorites" && (
            <FavoritesTab
              allAuctions={allAuctions}
              loadingAll={loadingAll}
              onViewDetails={(auc) => setSearchParams({ tab: "auction-detail", id: String(auc.id) })}
            />
          )}

          {activeTab === "live-stream" && (
            <LiveStreamTab
              myAuctions={myAuctions}
              loadingAuctions={loadingAuctions}
              onCreateNewClick={() => setActiveTab("create-auction")}
            />
          )}
        </div>
      </main>

      {/* CONFIRMAÇÃO DE PUBLICAÇÃO */}
      <ConfirmModal
        isOpen={approveAuctionId !== null}
        onClose={() => setApproveAuctionId(null)}
        onConfirm={handleApproveAuction}
        title={t('user_dashboard.publish_title')}
        message={t('user_dashboard.publish_message')}
        confirmText={t('user_dashboard.publish_confirm')}
        variant="primary"
      />

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal
        isOpen={deleteAuctionId !== null}
        onClose={() => setDeleteAuctionId(null)}
        onConfirm={handleDeleteAuction}
        title={t('user_dashboard.delete_title')}
        message={t('user_dashboard.delete_message')}
        confirmText={t('user_dashboard.delete_confirm')}
        variant="danger"
      />

      {/* CANCELAMENTO COM JUSTIFICATIVA */}
      {cancelAuctionId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-sm max-w-md w-full p-6 shadow-xl animate-in zoom-in duration-200 text-left text-foreground">
            <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-destructive" />
              {t('user_dashboard.cancel_title')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {t('user_dashboard.cancel_message')}
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t('user_dashboard.cancel_placeholder')}
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
                {t('user_dashboard.cancel_back')}
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={handleCancelAuction}
                className="px-4 py-2 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm uppercase disabled:opacity-50 cursor-pointer border-none"
              >
                {t('user_dashboard.cancel_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
