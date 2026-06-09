"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth.store";
import auctionService from "@/services/auction.service";
import categoryService from "@/services/category.service";
import rbacService from "@/services/rbac.service";
import type { Auction } from "@/types/auction.types";
import { AuctionStatus, ItemCondition } from "@/types/auction.types";
import { Category } from "@/types/category.types";
import { formatCurrency, getAuctionStatusLabel, auctionStatusColor } from "@/utils/auction";
import {
  LayoutDashboard,
  Gavel,
  TrendingUp,
  Settings,
  PlusCircle,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  Calendar,
  User,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut
} from "lucide-react";
import StatsGrid, { StatItem } from "@/components/common/StatsGrid";
import TableSection from "@/components/common/TableSection";
import ConfirmModal from "@/components/common/ConfirmModal";
import Modal from "@/components/common/Modal";

export default function UserPage() {
  const router = useRouter();
  
  // Auth Store selectors
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const changePassword = useAuthStore((s) => s.changePassword);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const apiError = useAuthStore((s) => s.error);

  // Tabs & Navigation State
  const [activeTab, setActiveTab] = useState<"overview" | "my-auctions" | "my-bids" | "settings">("overview");

  // Data State
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
  
  // Loading states
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form & Action Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [cancelAuctionId, setCancelAuctionId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [approveAuctionId, setApproveAuctionId] = useState<number | null>(null);
  const [deleteAuctionId, setDeleteAuctionId] = useState<number | null>(null);

  // Pagination for tables
  const [myAuctionsPage, setMyAuctionsPage] = useState(1);
  const [myAuctionsTotal, setMyAuctionsTotal] = useState(0);
  const myAuctionsPageSize = 10;

  // Filters for "Meus Leilões"
  const [auctionSearch, setAuctionSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Profile Form state
  const [fullName, setFullName] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Create Auction Form fields state
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category_id: "",
    condition_type: ItemCondition.NEW,
    starting_price: "",
    minimum_increment: "1000",
    reserve_price: "",
    buy_now_price: "",
    start_time: "",
    end_time: "",
  });
  const [createError, setCreateError] = useState("");

  // Check authentication
  useEffect(() => {
    if (status !== "loading" && !isAuthenticated) {
      router.push("/signin");
    }
  }, [status, isAuthenticated, router]);

  // Set default settings values
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
    }
  }, [user]);

  // Fetch Category options
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
        search: auctionSearch || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
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
  }, [user, myAuctionsPage, auctionSearch, statusFilter, categoryFilter]);

  // Fetch all active/ended auctions for general metric checks (won auctions, participating lances)
  const fetchAllAuctions = useCallback(async () => {
    setLoadingAll(true);
    try {
      // Fetch live & ended auctions to filter client-side for metrics
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

  // Hydrate dashboard data
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

    // Auctions where current user is bidder (mock or client-side calculation if winner/bids counts present)
    const participatingCount = allAuctions.filter(
      (a) => a.winner === user.id || a.item?.seller !== user.id && a.bids_count && a.bids_count > 0
    ).length;

    return { totalCreated, activeCreated, wonCount, participatingCount };
  }, [user, myAuctions, myAuctionsTotal, allAuctions]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (err) {
      console.error("Erro ao efetuar logout:", err);
    }
  };

  // Handle Edit/Update Profile Details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    if (!user) return;

    try {
      const res = await rbacService.updateUser(user.id, {
        full_name: fullName,
      });
      if (res.success && res.data) {
        await fetchMe();
        setProfileSuccess("Os detalhes do seu perfil foram salvos!");
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError(res.message || "Falha ao atualizar perfil.");
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || "Ocorreu um erro ao atualizar os detalhes do perfil.");
    }
  };

  // Handle Change Password Form
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPasswordError("Todos os campos de senha são obrigatórios.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordError("A nova senha e a confirmação de senha não coincidem.");
      return;
    }

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });

      setPasswordSuccess("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err: any) {
      const msg = useAuthStore.getState().error || "Erro ao alterar a senha. Verifique a senha atual.";
      setPasswordError(msg);
    }
  };

  // Create Auction Form Submission Handler
  const handleCreateAuctionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsSubmitting(true);

    const {
      title,
      description,
      category_id,
      condition_type,
      starting_price,
      minimum_increment,
      reserve_price,
      buy_now_price,
      start_time,
      end_time,
    } = createForm;

    if (!title || !starting_price || !minimum_increment || !start_time || !end_time) {
      setCreateError("Os campos Título, Preço Inicial, Incremento e Datas são obrigatórios.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title,
        description,
        category_id: category_id ? Number(category_id) : null,
        condition_type,
        starting_price: Number(starting_price),
        minimum_increment: Number(minimum_increment),
        reserve_price: reserve_price ? Number(reserve_price) : null,
        buy_now_price: buy_now_price ? Number(buy_now_price) : null,
        start_time: new Date(start_time).toISOString(),
        end_time: new Date(end_time).toISOString(),
        is_draft: true, // starts as draft by default
      };

      const res = await auctionService.create(payload);
      if (res.success) {
        setIsCreateModalOpen(false);
        // Reset form
        setCreateForm({
          title: "",
          description: "",
          category_id: "",
          condition_type: ItemCondition.NEW,
          starting_price: "",
          minimum_increment: "1000",
          reserve_price: "",
          buy_now_price: "",
          start_time: "",
          end_time: "",
        });
        fetchMyAuctions();
      } else {
        setCreateError(res.message || "Erro ao criar leilão.");
      }
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Erro de rede ao criar leilão.");
    } finally {
      setIsSubmitting(false);
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

  // Initials for avatar
  const initials = useMemo(() => {
    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return user?.username?.slice(0, 2).toUpperCase() || "US";
  }, [user]);

  // Sidebar items
  const sidebarItems = [
    { id: "overview", label: "Visão Geral", icon: <LayoutDashboard size={16} /> },
    { id: "my-auctions", label: "Meus Leilões", icon: <Gavel size={16} /> },
    { id: "my-bids", label: "Meus Lances", icon: <TrendingUp size={16} /> },
    { id: "settings", label: "Configurações", icon: <Settings size={16} /> },
  ] as const;

  // Categories Dropdown Mapping
  const categoryFilterOptions = useMemo(() => {
    const list = categories.map((c) => ({
      value: String(c.id),
      label: c.name,
    }));
    return [{ value: "", label: "Todas as Categorias" }, ...list];
  }, [categories]);

  // Loading page block
  if (status === "loading" || !user) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center select-none font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 font-sans flex flex-col">
      {/* Platform Sticky Header */}
      <Header />

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 flex flex-col md:flex-row gap-6 flex-1 select-none">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-5">
          {/* Blue branding block */}
          <div className="bg-[#0C1B33] text-white rounded-xl p-5 flex flex-col shadow-sm border border-slate-800">
            <div className="flex items-center gap-2.5 mb-6 px-1.5">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                <Gavel size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight leading-none">BidLive</span>
                <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest mt-1">Portal do Usuário</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-primary text-white font-bold shadow-md shadow-primary/10"
                        : "text-white/70 hover:text-white hover:bg-white/10 font-semibold"
                    }`}
                  >
                    <span className={isActive ? "text-white animate-pulse" : "text-white/50"}>{item.icon}</span>
                    <span className="truncate tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile brief card */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                {initials}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {user.full_name}
                </span>
                <span className="text-[9px] text-slate-400 font-bold truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <hr className="border-gray-100 my-0.5" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors w-full text-left cursor-pointer focus:outline-none"
            >
              <LogOut size={14} />
              Terminar Sessão
            </button>
          </div>
        </aside>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Header card */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Bem-vindo, {user.full_name}!</h2>
                    <p className="text-xs text-gray-400 mt-1 font-normal">Controle aqui seus lances, leilões ativos e preferências do portal.</p>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/10 transition uppercase cursor-pointer"
                  >
                    <PlusCircle size={15} />
                    Novo Leilão
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <StatsGrid
                items={[
                  { label: "Leilões Criados", value: metrics.totalCreated, icon: <Gavel size={16} /> },
                  { label: "Leilões Ativos", value: metrics.activeCreated, icon: <TrendingUp size={16} /> },
                  { label: "Leilões Participando", value: metrics.participatingCount, icon: <FileText size={16} /> },
                  { label: "Leilões Ganhos", value: metrics.wonCount, icon: <CheckCircle2 size={16} /> },
                ]}
                columns={4}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Created Auctions */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                      <span className="text-xs font-black text-gray-950 uppercase tracking-wider">Meus Leilões Recentes</span>
                      <button onClick={() => setActiveTab("my-auctions")} className="text-[10px] font-bold text-primary hover:underline uppercase">Ver Todos</button>
                    </div>

                    <div className="space-y-3">
                      {loadingAuctions ? (
                        <p className="text-center text-xs text-gray-400 py-8">Carregando...</p>
                      ) : myAuctions.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 py-8">Você não possui leilões cadastrados.</p>
                      ) : (
                        myAuctions.slice(0, 4).map((auc) => (
                          <div key={auc.id} className="flex justify-between items-center p-3 bg-gray-50/50 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100/50">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                                <Gavel size={12} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-gray-900 truncate leading-snug">{auc.item?.title}</span>
                                <span className="text-[8px] font-mono font-bold text-gray-400 uppercase tracking-wider mt-0.5">{auc.item?.category_label || "Sem Categoria"}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-primary font-mono">{formatCurrency(auc.item?.current_price || 0)}</p>
                              <span className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[7px] font-bold uppercase mt-1 ${auctionStatusColor(auc.status)}`}>
                                {getAuctionStatusLabel(auc.status)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bidding Summary Panel */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                      <span className="text-xs font-black text-gray-950 uppercase tracking-wider">Histórico de Disputas</span>
                      <button onClick={() => setActiveTab("my-bids")} className="text-[10px] font-bold text-primary hover:underline uppercase">Ver Todos</button>
                    </div>

                    <div className="space-y-3">
                      {loadingAll ? (
                        <p className="text-center text-xs text-gray-400 py-8">Carregando...</p>
                      ) : allAuctions.filter(a => a.winner === user.id).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
                          <TrendingUp size={24} className="opacity-40 animate-pulse mb-2" />
                          <p className="text-xs">Nenhuma licitação ganha ou disputada no momento.</p>
                        </div>
                      ) : (
                        allAuctions.filter(a => a.winner === user.id).slice(0, 4).map((auc) => (
                          <div key={auc.id} className="flex justify-between items-center p-3 bg-green-50/30 hover:bg-green-50/50 rounded-lg transition-colors border border-green-100/50">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded bg-green-500/10 flex items-center justify-center text-green-600 border border-green-500/20 shrink-0">
                                <CheckCircle2 size={12} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-gray-950 truncate leading-snug">{auc.item?.title}</span>
                                <span className="text-[8px] font-bold text-green-600 uppercase tracking-wider mt-0.5">Vencedor do Lote</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black text-green-700 font-mono">{formatCurrency(auc.item?.current_price || 0)}</p>
                              <span className="inline-block px-1.5 py-0.5 bg-green-100 border border-green-200 text-green-800 text-[7px] font-bold uppercase rounded-[4px] mt-1">
                                Ganho
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEUS LEILÕES */}
          {activeTab === "my-auctions" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight font-sans">Meus Leilões</h2>
                    <p className="text-xs text-gray-400 mt-1 font-normal">Crie novos lotes, gerencie seus rascunhos, publique itens ou cancele leilões criados.</p>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/10 transition uppercase cursor-pointer"
                  >
                    <PlusCircle size={15} />
                    Criar Leilão
                  </button>
                </div>
              </div>

              {/* Table list section */}
              <TableSection
                entityName="leilões"
                pagination={{
                  currentPage: myAuctionsPage,
                  totalCount: myAuctionsTotal,
                  pageSize: myAuctionsPageSize,
                  onPageChange: (page) => setMyAuctionsPage(page),
                }}
              >
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                      <th className="p-3">Título / Categoria</th>
                      <th className="py-3">Preço Inicial</th>
                      <th className="py-3">Preço Atual</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Término</th>
                      <th className="py-3 text-right pr-6">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[10px] text-gray-700">
                    {loadingAuctions ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">Carregando seus leilões da API...</td>
                      </tr>
                    ) : myAuctions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">Nenhum leilão cadastrado por você.</td>
                      </tr>
                    ) : (
                      myAuctions.map((auc) => (
                        <tr key={auc.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shrink-0">
                                <Gavel size={12} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-950 text-xs leading-tight">{auc.item?.title}</span>
                                <span className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider font-mono">
                                  ID: #{auc.id} | {auc.item?.category_label || "Sem categoria"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-gray-800">{formatCurrency(auc.item?.starting_price || 0)}</td>
                          <td className="py-3 font-bold text-primary">{formatCurrency(auc.item?.current_price || 0)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${auctionStatusColor(auc.status)}`}>
                              {getAuctionStatusLabel(auc.status)}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400 font-bold">
                            {new Date(auc.end_time).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedAuction(auc)}
                                title="Ver Detalhes"
                                className="p-1.5 rounded-sm hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-gray-100 bg-white"
                              >
                                <Eye size={12} />
                              </button>

                              {auc.status === AuctionStatus.DRAFT && (
                                <>
                                  <button
                                    onClick={() => setApproveAuctionId(auc.id)}
                                    title="Publicar Leilão"
                                    className="p-1.5 rounded-sm hover:bg-green-50 text-green-600 transition-colors cursor-pointer border border-gray-100 bg-white"
                                  >
                                    <CheckCircle size={12} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteAuctionId(auc.id)}
                                    title="Excluir Rascunho"
                                    className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}

                              {auc.status === AuctionStatus.LIVE && (
                                <button
                                  onClick={() => setCancelAuctionId(auc.id)}
                                  title="Cancelar Leilão"
                                  className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                                >
                                  <Ban size={12} />
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
            </div>
          )}

          {/* TAB 3: MEUS LANCES */}
          {activeTab === "my-bids" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Meus Lances</h2>
                  <p className="text-xs text-gray-400 mt-1 font-normal">Visualize leilões arrematados ou disputados em que você enviou ofertas.</p>
                </div>
              </div>

              {/* Table or list showing auctions the user won or placed lances on */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                {loadingAll ? (
                  <p className="text-center text-xs text-gray-400 py-8">Carregando seus lances da API...</p>
                ) : allAuctions.filter(a => a.winner === user.id).length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                    <TrendingUp size={36} className="opacity-40 mb-3 animate-bounce" />
                    <h4 className="text-sm font-bold text-gray-800 mb-1">Nenhum lance arrematado ainda</h4>
                    <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                      Você ainda não arrematou leilões. Participe de salas de leilão ao vivo a partir da página principal para fazer ofertas.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allAuctions.filter(a => a.winner === user.id).map((auc) => (
                      <div key={auc.id} className="border border-green-100 bg-green-50/10 rounded-xl p-4 flex flex-col justify-between gap-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <span className="text-[9px] font-extrabold text-green-600 bg-green-50 rounded px-2 py-0.5 border border-green-200/50 inline-block uppercase">Arrematado</span>
                            <h4 className="text-xs font-bold text-slate-800 truncate mt-2 leading-snug">{auc.item?.title}</h4>
                            <p className="text-[9px] text-gray-400 mt-1 font-mono uppercase">Lote: #{auc.id}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Preço Final</span>
                            <span className="text-xs font-black text-green-700 font-mono">{formatCurrency(auc.item?.current_price || 0)}</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-100/50 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                          <span>Finalizado em:</span>
                          <span>{new Date(auc.end_time).toLocaleDateString("pt-PT")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONFIGURAÇÕES */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Configurações do Perfil</h2>
                <p className="text-xs text-gray-400 mt-1 font-normal">Gerencie suas credenciais, nome público e informações de segurança.</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
                
                {/* Information update form */}
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <h3 className="text-xs font-black text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
                    <User className="w-4 h-4 text-primary animate-pulse" />
                    Detalhes Pessoais
                  </h3>

                  {profileSuccess && (
                    <div className="bg-green-50 border border-green-100 text-green-700 text-xs p-3 rounded-sm flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      <span>{profileSuccess}</span>
                    </div>
                  )}
                  {profileError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-sm flex items-center gap-2">
                      <AlertCircle size={14} />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Nome Completo</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Endereço de E-mail</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-100 bg-gray-50 text-gray-400 rounded-sm text-xs outline-none cursor-not-allowed transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-sm hover:bg-primary/95 shadow-sm transition uppercase cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar Detalhes
                    </button>
                  </div>
                </form>

                {/* Password update switcher */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-xs font-extrabold text-primary hover:text-primary-light uppercase tracking-wider flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {showPasswordFields ? "Esconder Modificar Senha" : "Alterar Senha de Acesso"}
                  </button>

                  {showPasswordFields && (
                    <form onSubmit={handleChangePassword} className="mt-5 space-y-4 max-w-md animate-in slide-in-from-top-2 duration-250">
                      {passwordSuccess && (
                        <div className="bg-green-50 border border-green-100 text-green-700 text-xs p-3 rounded-sm flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          <span>{passwordSuccess}</span>
                        </div>
                      )}
                      {passwordError && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-sm flex items-center gap-2">
                          <AlertCircle size={14} />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Senha Atual</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Nova Senha</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                          placeholder="Mínimo de 8 caracteres"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Confirmar Nova Senha</label>
                        <input
                          type="password"
                          value={newPasswordConfirm}
                          onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#0C1B33] text-white text-xs font-bold rounded-sm hover:bg-slate-900 shadow-sm transition uppercase cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Atualizar Senha
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* CREATE AUCTION MODAL FORM */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Novo Lote de Leilão"
        size="xl"
      >
        <form onSubmit={handleCreateAuctionSubmit} className="p-6 space-y-6">
          {createError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-sm flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{createError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Título do Item</label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                placeholder="Ex: BMW X6 M Competition 2023"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
              <select
                value={createForm.category_id}
                onChange={(e) => setCreateForm({ ...createForm, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs bg-white focus:ring-1 focus:ring-primary outline-none transition h-[34px]"
              >
                <option value="">Selecione a Categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Descrição do Lote</label>
            <textarea
              rows={3}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none resize-none transition"
              placeholder="Descreva detalhes como estado, documentação, especificações técnicas..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Condição</label>
              <select
                value={createForm.condition_type}
                onChange={(e) => setCreateForm({ ...createForm, condition_type: e.target.value as ItemCondition })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs bg-white focus:ring-1 focus:ring-primary outline-none transition h-[34px]"
              >
                <option value={ItemCondition.NEW}>Novo (NEW)</option>
                <option value={ItemCondition.USED}>Usado (USED)</option>
                <option value={ItemCondition.REFURBISHED}>Recondicionado (REFURBISHED)</option>
                <option value={ItemCondition.DAMAGED}>Danificado (DAMAGED)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Preço Inicial (AOA)</label>
              <input
                type="number"
                value={createForm.starting_price}
                onChange={(e) => setCreateForm({ ...createForm, starting_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                placeholder="Ex: 500000"
                min="0"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Incremento Mínimo (AOA)</label>
              <input
                type="number"
                value={createForm.minimum_increment}
                onChange={(e) => setCreateForm({ ...createForm, minimum_increment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                placeholder="Ex: 1000"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Preço de Reserva (Opcional)</label>
              <input
                type="number"
                value={createForm.reserve_price}
                onChange={(e) => setCreateForm({ ...createForm, reserve_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                placeholder="Preço mínimo para venda de fato"
                min="0"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Compra Imediata (Opcional)</label>
              <input
                type="number"
                value={createForm.buy_now_price}
                onChange={(e) => setCreateForm({ ...createForm, buy_now_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                placeholder="Valor para arremate imediato"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Início do Leilão</label>
              <input
                type="datetime-local"
                value={createForm.start_time}
                onChange={(e) => setCreateForm({ ...createForm, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Término do Leilão</label>
              <input
                type="datetime-local"
                value={createForm.end_time}
                onChange={(e) => setCreateForm({ ...createForm, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-sm uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-sm uppercase disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              {isSubmitting ? "Cadastrando..." : "Confirmar Rascunho"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL VIEW MODAL */}
      {selectedAuction && (
        <Modal
          isOpen={selectedAuction !== null}
          onClose={() => setSelectedAuction(null)}
          title={`Detalhes do Leilão #${selectedAuction.id}`}
          size="lg"
        >
          <div className="p-6 space-y-6">
            <div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider font-mono">Item do Leilão</span>
              <h4 className="text-sm font-bold text-gray-900 leading-tight mt-0.5">{selectedAuction.item?.title}</h4>
              <p className="text-[10px] text-gray-600 leading-relaxed mt-2 bg-gray-50 p-3 rounded-sm border border-gray-100 italic">
                "{selectedAuction.item?.description || "Sem descrição informada para este item."}"
              </p>
            </div>

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
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">ID Lote</span>
                <span className="text-xs font-semibold text-gray-800 font-mono">#{selectedAuction.id}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Status Atual</span>
                <span className={`inline-block px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase mt-1 ${auctionStatusColor(selectedAuction.status)}`}>
                  {getAuctionStatusLabel(selectedAuction.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 bg-primary/5 p-4 rounded-sm border border-primary/10">
              <div>
                <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">Preço Inicial</span>
                <span className="text-xs font-black text-gray-900">{formatCurrency(selectedAuction.item?.starting_price || 0)}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">Lance Atual</span>
                <span className="text-xs font-black text-primary">{formatCurrency(selectedAuction.item?.current_price || 0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div className="flex gap-2 items-center">
                <Calendar size={12} className="text-gray-400" />
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Início</span>
                  <span className="text-[10px] font-semibold text-gray-700">
                    {new Date(selectedAuction.start_time).toLocaleString("pt-PT")}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Calendar size={12} className="text-gray-400" />
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Término</span>
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
          <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-xl animate-in zoom-in duration-200">
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
    </div>
  );
}