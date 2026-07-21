import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    Users,
    Search,
    UserPlus,
    Check,
    X,
    Clock,
    Loader2,
    Circle,
    Eye,
    Ban,
    ShieldCheck,
    UserCheck,
    Inbox,
    Send,
    UserX,
    Sparkles
} from "lucide-react";
import Avatar from "@/components/common/Avatar";
import PublicProfileModal from "@/components/user/PublicProfileModal";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useBlockedStore } from "@/shared/stores/blocked.store";
import {
    useFriendsQuery,
    useOnlineFriendsQuery,
    usePendingRequestsReceivedQuery,
    usePendingRequestsSentQuery,
    useSendFriendRequestMutation,
    useAcceptFriendRequestMutation,
    useRejectFriendRequestMutation,
    useUserSearchQuery,
    useBlockedUsersQuery,
    useUnblockUserMutation,
} from "@/hooks/useSocial";
import type { PublicUser, Friendship } from "@/shared/types/social.types";

type ViewSection = "all" | "friends" | "received" | "sent" | "blocked";

/**
 * Aba "Amigos" do dashboard: Gestão de amigos, solicitações, bloqueios e pesquisa avançada.
 * Layout moderno, responsivo e de alto padrão estético.
 */
export default function FriendsTab() {
    const { t } = useTranslation();
    const currentUser = useAuthStore((s) => s.user);

    // Navegação entre secções
    const [activeSection, setActiveSection] = useState<ViewSection>("all");

    // Pesquisa com debounce
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Perfil público modal
    const [profileUser, setProfileUser] = useState<PublicUser | null>(null);

    // Queries do Backend
    const { data: friendsResponse, isLoading: isLoadingFriends } = useFriendsQuery();
    const { data: onlineResponse } = useOnlineFriendsQuery();
    const { data: receivedResponse, isLoading: isLoadingReceived } = usePendingRequestsReceivedQuery();
    const { data: sentResponse, isLoading: isLoadingSent } = usePendingRequestsSentQuery();
    const { data: searchResults, isLoading: isSearching } = useUserSearchQuery(debouncedQuery);
    const { data: blockedResponse, isLoading: isLoadingBlocked } = useBlockedUsersQuery();

    // Normalização defensiva de arrays
    const friends: PublicUser[] = Array.isArray(friendsResponse) ? friendsResponse : ((friendsResponse as any)?.data || []);
    const onlineFriends: PublicUser[] = Array.isArray(onlineResponse) ? onlineResponse : ((onlineResponse as any)?.data || []);
    const received: Friendship[] = Array.isArray(receivedResponse) ? receivedResponse : ((receivedResponse as any)?.data || []);
    const sent: Friendship[] = Array.isArray(sentResponse) ? sentResponse : ((sentResponse as any)?.data || []);
    const blockedUsers: PublicUser[] = Array.isArray(blockedResponse) ? blockedResponse : ((blockedResponse as any)?.data || []);

    const onlineIds = new Set(onlineFriends.map((u) => u.id));
    const friendIds = new Set(friends.map((u) => u.id));
    const sentToIds = new Set(sent.map((f) => f.addressee.id));
    const receivedFromIds = new Set(received.map((f) => f.requester.id));

    // Combina bloqueios do backend com a memória local
    const localBlockedList = useBlockedStore((s) => (currentUser ? s.byUser[currentUser.id] : undefined)) || [];
    const blockedIds = new Set([...blockedUsers.map((u) => u.id), ...localBlockedList]);
    const removeLocalBlocked = useBlockedStore((s) => s.removeBlocked);

    // Mutations
    const sendMutation = useSendFriendRequestMutation();
    const acceptMutation = useAcceptFriendRequestMutation();
    const rejectMutation = useRejectFriendRequestMutation();
    const unblockMutation = useUnblockUserMutation();

    const handleSend = (user: PublicUser) => {
        sendMutation.mutate({ addressee_id: user.id }, {
            onSuccess: (res) => {
                if (res.success) toast.success(t("friends_tab.request_sent", { name: user.username }));
                else toast.error(res.message || t("friends_tab.request_error"));
            },
            onError: () => toast.error(t("friends_tab.request_error")),
        });
    };

    const handleUnblock = (user: PublicUser) => {
        unblockMutation.mutate({ user_id: user.id }, {
            onSuccess: (res) => {
                if (res.success) {
                    if (currentUser) removeLocalBlocked(currentUser.id, user.id);
                    toast.success(t("public_profile.unblock_success", { name: user.full_name || user.username }));
                } else {
                    toast.error(res.message || t("public_profile.unblock_error"));
                }
            },
            onError: () => toast.error(t("public_profile.unblock_error")),
        });
    };

    const handleAccept = (f: Friendship) => {
        acceptMutation.mutate(f.id, {
            onSuccess: (res) => {
                if (res.success) toast.success(t("friends_tab.request_accepted", { name: f.requester.username }));
            },
            onError: () => toast.error(t("friends_tab.generic_error")),
        });
    };

    const handleReject = (f: Friendship) => {
        rejectMutation.mutate(f.id, {
            onSuccess: (res) => {
                if (res.success) toast.success(t("friends_tab.request_rejected", { name: f.requester.username }));
            },
            onError: () => toast.error(t("friends_tab.generic_error")),
        });
    };

    // Resultados de pesquisa sem o próprio utilizador
    const visibleResults: PublicUser[] = (searchResults || []).filter((u: PublicUser) => u.id !== currentUser?.id);

    // Estado do botão por resultado de pesquisa
    const searchAction = (user: PublicUser) => {
        if (blockedIds.has(user.id)) {
            return (
                <span className="text-[10px] font-bold uppercase text-destructive bg-destructive/10 px-2.5 py-1 rounded-full border border-destructive/20 inline-flex items-center gap-1">
                    <Ban size={11} /> {t("friends_tab.blocked")}
                </span>
            );
        }
        if (friendIds.has(user.id)) {
            return (
                <span className="text-[10px] font-bold uppercase text-green-600 dark:text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 inline-flex items-center gap-1">
                    <UserCheck size={11} /> {t("friends_tab.already_friends")}
                </span>
            );
        }
        if (sentToIds.has(user.id)) {
            return (
                <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border inline-flex items-center gap-1">
                    <Clock size={11} /> {t("friends_tab.pending")}
                </span>
            );
        }
        if (receivedFromIds.has(user.id)) {
            return (
                <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    {t("friends_tab.check_requests")}
                </span>
            );
        }
        return (
            <button
                onClick={() => handleSend(user)}
                disabled={sendMutation.isPending}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer border-none disabled:opacity-50"
            >
                <UserPlus size={13} /> {t("friends_tab.add")}
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7md mx-auto">
            {/* HERO HEADER RESPONSIVO */}
            <div className="relative overflow-hidden bg-card border border-border rounded-md p-6 sm:p-8 shadow-sm">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3md pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-2 max-w-md">
                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit">
                            <Sparkles size={13} /> Rede Social & Contactos
                        </div>
                        <h1 className="text-2md sm:text-3md font-extrabold text-foreground tracking-tight flex items-center gap-3">
                            <Users className="text-primary h-7 w-7 shrink-0" />
                            {t("friends_tab.title")}
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("friends_tab.desc")}
                        </p>
                    </div>

                    {/* MÉTROLOGIA / ESTATÍSTICAS RÁPIDAS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                        <div className="bg-background/80 backdrop-blur-sm border border-border/80 rounded-md p-3 text-center min-w-[85px]">
                            <span className="text-xs text-muted-foreground font-medium block">Amigos</span>
                            <span className="text-md font-bold text-foreground">{friends.length}</span>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm border border-border/80 rounded-md p-3 text-center min-w-[85px]">
                            <span className="text-xs text-muted-foreground font-medium block">Online</span>
                            <span className="text-md font-bold text-green-500">{onlineFriends.length}</span>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm border border-border/80 rounded-md p-3 text-center min-w-[85px]">
                            <span className="text-xs text-muted-foreground font-medium block">Convites</span>
                            <span className="text-md font-bold text-primary">{received.length}</span>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm border border-border/80 rounded-md p-3 text-center min-w-[85px]">
                            <span className="text-xs text-muted-foreground font-medium block">Bloqueados</span>
                            <span className="text-md font-bold text-destructive">{blockedUsers.length}</span>
                        </div>
                    </div>
                </div>

                {/* PESQUISA DE UTILIZADORES */}
                <div className="relative mt-6">
                    <div className="relative flex items-center">
                        <Search size={18} className="absolute start-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("friends_tab.search_placeholder")}
                            className="w-full bg-background border border-border rounded-md ps-11 pe-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground shadow-inner"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute end-3 p-1 text-muted-foreground hover:text-foreground rounded-full cursor-pointer bg-transparent border-none"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* RESULTADOS DE PESQUISA DROPDOWN */}
                    {debouncedQuery.trim() && (
                        <div className="absolute top-full start-0 end-0 mt-2 z-30 bg-card border border-border rounded-md shadow-2md overflow-hidden divide-y divide-border/60 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                            {isSearching ? (
                                <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                    <Loader2 size={16} className="animate-spin text-primary" /> {t("friends_tab.searching")}
                                </div>
                            ) : visibleResults.length === 0 ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    <UserX size={24} className="mx-auto mb-2 opacity-50" />
                                    {t("friends_tab.no_results")}
                                </div>
                            ) : (
                                visibleResults.map((user) => (
                                    <div key={user.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                                        <button
                                            onClick={() => setProfileUser(user)}
                                            className="flex items-center gap-3 min-w-0 bg-transparent border-none cursor-pointer text-start group"
                                        >
                                            <Avatar name={user.full_name || user.username} src={user.avatar_url || undefined} size="md" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                    {user.full_name || user.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                            </div>
                                        </button>
                                        <div className="shrink-0">{searchAction(user)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* SEPARADORES / BARRA DE NAVEGAÇÃO DE SECÇÕES */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                    onClick={() => setActiveSection("all")}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${activeSection === "all"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    <Users size={14} /> Todos os Contactos
                </button>
                <button
                    onClick={() => setActiveSection("friends")}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${activeSection === "friends"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    <UserCheck size={14} /> Amigos ({friends.length})
                </button>
                <button
                    onClick={() => setActiveSection("received")}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${activeSection === "received"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    <Inbox size={14} /> Convites ({received.length})
                    {received.length > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                            {received.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveSection("sent")}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${activeSection === "sent"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    <Send size={14} /> Enviados ({sent.length})
                </button>
                <button
                    onClick={() => setActiveSection("blocked")}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${activeSection === "blocked"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    <Ban size={14} /> Bloqueados ({blockedUsers.length})
                </button>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex flex-col gap-6">
                {/* 1. CONVITES RECEBIDOS */}
                {(activeSection === "all" || activeSection === "received") && (
                    <div className="bg-card border border-border rounded-md p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Inbox size={18} className="text-primary" />
                                {t("friends_tab.received_title")}
                                {received.length > 0 && (
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        {received.length}
                                    </span>
                                )}
                            </h3>
                        </div>

                        {isLoadingReceived ? (
                            <div className="py-8 flex items-center justify-center gap-2 text-muted-foreground text-xs">
                                <Loader2 size={16} className="animate-spin text-primary" /> {t("common.loading")}
                            </div>
                        ) : received.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-md">
                                {t("friends_tab.no_received")}
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {received.map((f) => (
                                    <div
                                        key={f.id}
                                        className="bg-background border border-border rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-all shadow-sm"
                                    >
                                        <button
                                            onClick={() => setProfileUser(f.requester)}
                                            className="flex items-center gap-3 min-w-0 bg-transparent border-none cursor-pointer text-start group"
                                        >
                                            <Avatar
                                                name={f.requester.full_name || f.requester.username}
                                                src={f.requester.avatar_url || undefined}
                                                size="md"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                    {f.requester.full_name || f.requester.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">@{f.requester.username}</p>
                                            </div>
                                        </button>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleAccept(f)}
                                                disabled={acceptMutation.isPending}
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer border-none disabled:opacity-50"
                                            >
                                                <Check size={14} /> {t("friends_tab.accept")}
                                            </button>
                                            <button
                                                onClick={() => handleReject(f)}
                                                disabled={rejectMutation.isPending}
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-transparent hover:bg-destructive/10 text-destructive border border-destructive/30 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                <X size={14} /> {t("friends_tab.reject")}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. LISTA DE AMIGOS */}
                {(activeSection === "all" || activeSection === "friends") && (
                    <div className="bg-card border border-border rounded-md p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Users size={18} className="text-primary" />
                                {t("friends_tab.friends_title")}
                                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                                    {friends.length}
                                </span>
                            </h3>
                        </div>

                        {isLoadingFriends ? (
                            <div className="py-8 flex items-center justify-center gap-2 text-muted-foreground text-xs">
                                <Loader2 size={16} className="animate-spin text-primary" /> {t("common.loading")}
                            </div>
                        ) : friends.length === 0 ? (
                            <div className="py-12 text-center bg-muted/20 border border-dashed border-border rounded-md">
                                <Users size={36} className="mx-auto text-muted-foreground/40 mb-3" />
                                <p className="text-sm font-bold text-foreground">{t("friends_tab.no_friends")}</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    {t("friends_tab.no_friends_desc")}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {friends.map((user) => {
                                    const isOnline = onlineIds.has(user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            className="group bg-background border border-border/80 hover:border-primary/50 rounded-md p-4 flex items-center justify-between gap-3 transition-all duration-200 hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="relative shrink-0">
                                                    <Avatar
                                                        name={user.full_name || user.username}
                                                        src={user.avatar_url || undefined}
                                                        size="md"
                                                    />
                                                    {isOnline ? (
                                                        <span className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
                                                    ) : (
                                                        <span className="absolute bottom-0 end-0 w-3 h-3 bg-muted-foreground/40 border-2 border-background rounded-full" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                        {user.full_name || user.username}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                                                        {isOnline ? (
                                                            <span className="text-green-600 dark:text-green-400 font-semibold">{t("friends_tab.online")}</span>
                                                        ) : (
                                                            <span>{t("friends_tab.offline")}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setProfileUser(user)}
                                                title={t("friends_tab.view_profile")}
                                                className="shrink-0 p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer bg-transparent border-none"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. CONVITES ENVIADOS */}
                {(activeSection === "all" || activeSection === "sent") && sent.length > 0 && (
                    <div className="bg-card border border-border rounded-md p-6 shadow-sm">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                            <Send size={16} className="text-muted-foreground" />
                            {t("friends_tab.sent_title")}
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                                {sent.length}
                            </span>
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {sent.map((f) => (
                                <div key={f.id} className="bg-background border border-border rounded-md p-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar
                                            name={f.addressee.full_name || f.addressee.username}
                                            src={f.addressee.avatar_url || undefined}
                                            size="md"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">{f.addressee.full_name || f.addressee.username}</p>
                                            <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                                                <Clock size={12} /> {t("friends_tab.pending")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. UTILIZADORES BLOQUEADOS */}
                {(activeSection === "all" || activeSection === "blocked") && (
                    <div className="bg-card border border-border rounded-md p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Ban size={18} className="text-destructive" />
                                Utilizadores Bloqueados
                                {blockedUsers.length > 0 && (
                                    <span className="bg-destructive/10 text-destructive text-xs font-bold px-2.5 py-0.5 rounded-full border border-destructive/20">
                                        {blockedUsers.length}
                                    </span>
                                )}
                            </h3>
                        </div>

                        {isLoadingBlocked ? (
                            <div className="py-8 flex items-center justify-center gap-2 text-muted-foreground text-xs">
                                <Loader2 size={16} className="animate-spin text-primary" /> {t("common.loading")}
                            </div>
                        ) : blockedUsers.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-md">
                                Nenhum utilizador bloqueado.
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                {blockedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="bg-background border border-border/80 rounded-md p-4 flex items-center justify-between gap-3 hover:border-destructive/30 transition-all"
                                    >
                                        <button
                                            onClick={() => setProfileUser(user)}
                                            className="flex items-center gap-3 min-w-0 bg-transparent border-none cursor-pointer text-start group"
                                        >
                                            <Avatar
                                                name={user.full_name || user.username}
                                                src={user.avatar_url || undefined}
                                                size="md"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                    {user.full_name || user.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleUnblock(user)}
                                            disabled={unblockMutation.isPending}
                                            className="inline-flex items-center gap-1.5 bg-transparent hover:bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer shrink-0 disabled:opacity-50"
                                        >
                                            <ShieldCheck size={14} />
                                            Desbloquear
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL DE PERFIL PÚBLICO */}
            {profileUser && (
                <PublicProfileModal
                    isOpen={profileUser !== null}
                    onClose={() => setProfileUser(null)}
                    userId={profileUser.id}
                    username={profileUser.username}
                    fullName={profileUser.full_name}
                    avatarUrl={profileUser.avatar_url || undefined}
                />
            )}
        </div>
    );
}

