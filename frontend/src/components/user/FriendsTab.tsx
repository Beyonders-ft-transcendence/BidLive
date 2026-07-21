import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Users, Search, UserPlus, Check, X, Clock, Loader2, Circle, Eye, Ban, ShieldCheck } from "lucide-react";
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

/**
 * Aba "Amigos" do dashboard (ISSUE FE-010): pesquisa e adição de utilizadores,
 * gestão de convites (aceitar / rejeitar / cancelar), lista de amigos e gestão de bloqueios.
 */
export default function FriendsTab() {
    const { t } = useTranslation();
    const currentUser = useAuthStore((s) => s.user);

    // Pesquisa com debounce
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Perfil público (com ação de bloqueio/desbloqueio)
    const [profileUser, setProfileUser] = useState<PublicUser | null>(null);

    // Queries do Backend
    const { data: friendsResponse, isLoading: isLoadingFriends } = useFriendsQuery();
    const { data: onlineResponse } = useOnlineFriendsQuery();
    const { data: receivedResponse, isLoading: isLoadingReceived } = usePendingRequestsReceivedQuery();
    const { data: sentResponse } = usePendingRequestsSentQuery();
    const { data: searchResults, isLoading: isSearching } = useUserSearchQuery(debouncedQuery);
    const { data: blockedResponse, isLoading: isLoadingBlocked } = useBlockedUsersQuery();

    // Normalização defensiva
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
            return <span className="text-[10px] font-bold uppercase text-destructive inline-flex items-center gap-1"><Ban size={11} /> {t("friends_tab.blocked")}</span>;
        }
        if (friendIds.has(user.id)) {
            return <span className="text-[10px] font-bold uppercase text-green-600 dark:text-green-400">{t("friends_tab.already_friends")}</span>;
        }
        if (sentToIds.has(user.id)) {
            return <span className="text-[10px] font-bold uppercase text-muted-foreground inline-flex items-center gap-1"><Clock size={11} /> {t("friends_tab.pending")}</span>;
        }
        if (receivedFromIds.has(user.id)) {
            return <span className="text-[10px] font-bold uppercase text-primary">{t("friends_tab.check_requests")}</span>;
        }
        return (
            <button
                onClick={() => handleSend(user)}
                disabled={sendMutation.isPending}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-none disabled:opacity-50"
            >
                <UserPlus size={12} /> {t("friends_tab.add")}
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Cabeçalho */}
            <div className="bg-card border border-border p-6 rounded-sm">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users size={20} className="text-primary" /> {t("friends_tab.title")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t("friends_tab.desc")}</p>

                {/* Pesquisa e adição */}
                <div className="relative mt-4">
                    <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("friends_tab.search_placeholder")}
                        className="w-full bg-background border border-border rounded-sm ps-9 pe-3 py-2.5 text-xs focus:ring-1 focus:ring-primary outline-none text-foreground"
                    />
                </div>

                {debouncedQuery.trim() && (
                    <div className="mt-3 border border-border rounded-sm divide-y divide-border max-h-72 overflow-y-auto">
                        {isSearching ? (
                            <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-xs">
                                <Loader2 size={14} className="animate-spin" /> {t("friends_tab.searching")}
                            </div>
                        ) : visibleResults.length === 0 ? (
                            <p className="p-4 text-center text-xs text-muted-foreground">{t("friends_tab.no_results")}</p>
                        ) : (
                            visibleResults.map((user) => (
                                <div key={user.id} className="p-3 flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => setProfileUser(user)}
                                        className="flex items-center gap-3 min-w-0 bg-transparent border-none cursor-pointer text-start"
                                    >
                                        <Avatar name={user.full_name || user.username} src={user.avatar_url || undefined} size="sm" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">{user.full_name || user.username}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
                                        </div>
                                    </button>
                                    {searchAction(user)}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Convites recebidos */}
            <div className="bg-card border border-border p-6 rounded-sm">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    {t("friends_tab.received_title")}
                    {received.length > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{received.length}</span>
                    )}
                </h3>
                {isLoadingReceived ? (
                    <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs"><Loader2 size={14} className="animate-spin" /> {t("common.loading")}</div>
                ) : received.length === 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">{t("friends_tab.no_received")}</p>
                ) : (
                    <div className="mt-4 divide-y divide-border border border-border rounded-sm">
                        {received.map((f) => (
                            <div key={f.id} className="p-3 flex items-center justify-between gap-3">
                                <button
                                    onClick={() => setProfileUser(f.requester)}
                                    className="flex items-center gap-3 min-w-0 bg-transparent border-none cursor-pointer text-start"
                                >
                                    <Avatar name={f.requester.full_name || f.requester.username} src={f.requester.avatar_url || undefined} size="sm" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{f.requester.full_name || f.requester.username}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">@{f.requester.username}</p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleAccept(f)}
                                        disabled={acceptMutation.isPending}
                                        title={t("friends_tab.accept")}
                                        className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer border-none disabled:opacity-50"
                                    >
                                        <Check size={12} /> {t("friends_tab.accept")}
                                    </button>
                                    <button
                                        onClick={() => handleReject(f)}
                                        disabled={rejectMutation.isPending}
                                        title={t("friends_tab.reject")}
                                        className="inline-flex items-center gap-1 bg-transparent hover:bg-destructive/10 text-destructive border border-destructive/40 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <X size={12} /> {t("friends_tab.reject")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Convites enviados */}
            {sent.length > 0 && (
                <div className="bg-card border border-border p-6 rounded-sm">
                    <h3 className="text-sm font-bold text-foreground">{t("friends_tab.sent_title")}</h3>
                    <div className="mt-4 divide-y divide-border border border-border rounded-sm">
                        {sent.map((f) => (
                            <div key={f.id} className="p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar name={f.addressee.full_name || f.addressee.username} src={f.addressee.avatar_url || undefined} size="sm" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{f.addressee.full_name || f.addressee.username}</p>
                                        <p className="text-[10px] text-muted-foreground truncate inline-flex items-center gap-1"><Clock size={10} /> {t("friends_tab.pending")}</p>
                                    </div>
                                </div>
                                {/* Sem botão de cancelar: o backend só permite DELETE de amizades ACCEPTED,
                                    pelo que um convite PENDING não pode ser cancelado pelo remetente. */}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lista de amigos */}
            <div className="bg-card border border-border p-6 rounded-sm">
                <h3 className="text-sm font-bold text-foreground">
                    {t("friends_tab.friends_title")} <span className="text-muted-foreground font-semibold">({friends.length})</span>
                </h3>
                {isLoadingFriends ? (
                    <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs"><Loader2 size={14} className="animate-spin" /> {t("common.loading")}</div>
                ) : friends.length === 0 ? (
                    <div className="mt-6 text-center py-8">
                        <Users size={32} className="mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-bold text-foreground">{t("friends_tab.no_friends")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("friends_tab.no_friends_desc")}</p>
                    </div>
                ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {friends.map((user) => (
                            <div key={user.id} className="border border-border rounded-sm p-3 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <Avatar name={user.full_name || user.username} src={user.avatar_url || undefined} size="md" />
                                        {onlineIds.has(user.id) && (
                                            <Circle size={10} className="absolute bottom-0 end-0 fill-green-500 text-green-500 bg-card rounded-full" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{user.full_name || user.username}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {onlineIds.has(user.id) ? t("friends_tab.online") : t("friends_tab.offline")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => setProfileUser(user)}
                                        title={t("friends_tab.view_profile")}
                                        className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Utilizadores Bloqueados */}
            <div className="bg-card border border-border p-6 rounded-sm">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Ban size={16} className="text-destructive" />
                    Utilizadores Bloqueados
                    {blockedUsers.length > 0 && (
                        <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full border border-destructive/20">{blockedUsers.length}</span>
                    )}
                </h3>
                {isLoadingBlocked ? (
                    <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs"><Loader2 size={14} className="animate-spin" /> {t("common.loading")}</div>
                ) : blockedUsers.length === 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">Nenhum utilizador bloqueado.</p>
                ) : (
                    <div className="mt-4 divide-y divide-border border border-border rounded-sm">
                        {blockedUsers.map((user) => (
                            <div key={user.id} className="p-3 flex items-center justify-between gap-3">
                                <button
                                    onClick={() => setProfileUser(user)}
                                    className="flex items-center gap-3 min-w-0 bg-transparent border-none cursor-pointer text-start"
                                >
                                    <Avatar name={user.full_name || user.username} src={user.avatar_url || undefined} size="sm" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{user.full_name || user.username}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleUnblock(user)}
                                    disabled={unblockMutation.isPending}
                                    className="inline-flex items-center gap-1.5 bg-transparent hover:bg-primary/10 text-primary border border-primary/40 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <ShieldCheck size={12} />
                                    Desbloquear
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Perfil público (inclui bloquear/desbloquear) */}
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
