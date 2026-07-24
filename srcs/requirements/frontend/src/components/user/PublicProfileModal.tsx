import { useState, useEffect } from "react";
import { X, Gavel, Shield, Ban, ShieldCheck, Loader2, UserMinus, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import socialService from "@/services/social.service";
import {
    useBlockUserMutation,
    useUnblockUserMutation,
    useBlockedUsersQuery,
    useFriendsQuery,
    useRemoveFriendMutation,
} from "@/hooks/useSocial";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useBlockedStore } from "@/shared/stores/blocked.store";
import type { PublicUser } from "@/shared/types/social.types";

interface PublicProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
}

export default function PublicProfileModal({
    isOpen,
    onClose,
    userId,
    username,
    fullName,
    avatarUrl,
}: PublicProfileModalProps) {
    const { t } = useTranslation();
    const currentUser = useAuthStore((s) => s.user);
    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState<any>(null);

    const addBlocked = useBlockedStore((s) => s.addBlocked);
    const removeBlocked = useBlockedStore((s) => s.removeBlocked);
    
    // Queries do Backend
    const { data: blockedResponse } = useBlockedUsersQuery();
    const { data: friendsResponse } = useFriendsQuery();

    const blockedUsers: PublicUser[] = Array.isArray(blockedResponse) ? blockedResponse : ((blockedResponse as any)?.data || []);
    const friends: PublicUser[] = Array.isArray(friendsResponse) ? friendsResponse : ((friendsResponse as any)?.data || []);

    const isApiBlocked = blockedUsers.some((u) => u.id === userId);
    const isFriend = friends.some((u) => u.id === userId);

    const storeSaysBlocked = useBlockedStore((s) => s.isBlocked(currentUser?.id, userId));
    const [isBlocked, setIsBlocked] = useState(isApiBlocked || storeSaysBlocked);
    const [confirmingBlock, setConfirmingBlock] = useState(false);
    const [confirmingUnblock, setConfirmingUnblock] = useState(false);
    const [confirmingRemoveFriend, setConfirmingRemoveFriend] = useState(false);

    const blockMutation = useBlockUserMutation();
    const unblockMutation = useUnblockUserMutation();
    const removeFriendMutation = useRemoveFriendMutation();
    const isMutating = blockMutation.isPending || unblockMutation.isPending || removeFriendMutation.isPending;

    useEffect(() => {
        setIsBlocked(isApiBlocked || storeSaysBlocked);
    }, [isApiBlocked, storeSaysBlocked, userId]);

    useEffect(() => {
        if (!isOpen) {
            setDetails(null);
            setConfirmingBlock(false);
            setConfirmingUnblock(false);
            return;
        }

        const fetchUserDetails = async () => {
            setIsLoading(true);
            try {
                // Tentativa de obter detalhes públicos do utilizador
                const res = await socialService.getUserProfile(userId);
                setDetails(res.data);
            } catch (error) {
                console.error("Erro ao carregar detalhes do utilizador:", error);
                // Não mostramos erro ao utilizador, apenas usamos as props básicas
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [isOpen, userId]);

    // Sincroniza o estado de bloqueio com a memória local ao abrir/trocar de perfil
    useEffect(() => {
        if (isOpen) setIsBlocked(storeSaysBlocked);
    }, [isOpen, userId, storeSaysBlocked]);

    const displayName = details?.full_name || fullName || username;

    const handleBlock = () => {
        blockMutation.mutate({ user_id: userId }, {
            onSuccess: (res) => {
                if (res.success) {
                    setIsBlocked(true);
                    if (currentUser) addBlocked(currentUser.id, userId);
                    toast.success(t("public_profile.block_success", { name: displayName }));
                } else {
                    toast.error(res.message || t("public_profile.block_error"));
                }
            },
            onError: (error: any) => {
                const detail = error?.response?.data?.errors?.detail || error?.response?.data?.message || "";
                // O backend responde 400 se o utilizador já estava bloqueado —
                // nesse caso atualizamos o estado em vez de mostrar erro.
                if (typeof detail === "string" && detail.toLowerCase().includes("bloqueado")) {
                    setIsBlocked(true);
                    if (currentUser) addBlocked(currentUser.id, userId);
                    toast.info(t("public_profile.already_blocked", { name: displayName }));
                } else {
                    toast.error(t("public_profile.block_error"));
                }
            },
        });
        setConfirmingBlock(false);
    };

    const handleUnblock = () => {
        unblockMutation.mutate({ user_id: userId }, {
            onSuccess: (res) => {
                if (res.success) {
                    setIsBlocked(false);
                    if (currentUser) removeBlocked(currentUser.id, userId);
                    toast.success(t("public_profile.unblock_success", { name: displayName }));
                } else {
                    toast.error(res.message || t("public_profile.unblock_error"));
                }
            },
            onError: () => toast.error(t("public_profile.unblock_error")),
        });
        setConfirmingUnblock(false);
    };

    const handleRemoveFriend = () => {
        removeFriendMutation.mutate(userId, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(t("friends_tab.friend_removed", { name: displayName }));
                } else {
                    toast.error(res.message || t("friends_tab.generic_error"));
                }
            },
            onError: () => toast.error(t("friends_tab.generic_error")),
        });
        setConfirmingRemoveFriend(false);
    };

    if (!isOpen) return null;

    const isSelf = currentUser?.id === userId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-20 cursor-pointer"
                >
                    <X size={18} />
                </button>

                <div className="relative h-24 bg-gradient-to-r from-primary/80 to-primary flex justify-center">
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-full p-1 bg-card border border-border shadow-lg">
                        <Avatar
                            name={displayName}
                            src={details?.avatar_url || avatarUrl}
                            size="lg"
                        />
                    </div>
                </div>

                <div className="pt-14 pb-6 px-6 text-center">
                    <h3 className="text-xl font-bold text-foreground">
                        {displayName}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground mt-0.5">
                        @{details?.username || username}
                    </p>

                    <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                            <Shield size={10} /> {t("public_profile.verified")}
                        </span>
                        {isFriend && !isBlocked && (
                            <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                                <UserCheck size={10} /> {t("friends_tab.already_friends")}
                            </span>
                        )}
                        {isBlocked && (
                            <span className="inline-flex items-center gap-1 bg-destructive/10 text-destructive px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                                <Ban size={10} /> {t("public_profile.blocked_badge")}
                            </span>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <div className="bg-muted border border-border rounded-lg py-3 px-8 flex flex-col items-center justify-center">
                            <Gavel size={16} className="text-muted-foreground mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("public_profile.member_since")}</span>
                            <span className="text-sm font-semibold text-foreground">
                                {details?.date_joined ? new Date(details.date_joined).getFullYear() : new Date().getFullYear()}
                            </span>
                        </div>
                    </div>

                    {/* Bloquear / desbloquear / remover amizade — nunca para o próprio perfil */}
                    {!isSelf && (
                        <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2.5">
                            {/* Remover amizade (se forem amigos) */}
                            {isFriend && !isBlocked && (
                                confirmingRemoveFriend ? (
                                    <div className="flex flex-col gap-2 p-2.5 bg-muted/40 rounded-sm border border-border">
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Tens a certeza que desejas remover <strong>{displayName}</strong> da tua lista de amigos?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirmingRemoveFriend(false)}
                                                className="flex-1 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted border border-border rounded-sm uppercase cursor-pointer bg-background"
                                            >
                                                {t("common.cancel")}
                                            </button>
                                            <button
                                                onClick={handleRemoveFriend}
                                                disabled={isMutating}
                                                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm uppercase cursor-pointer border-none disabled:opacity-50"
                                            >
                                                {isMutating ? <Loader2 size={12} className="animate-spin" /> : <UserMinus size={12} />}
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmingRemoveFriend(true)}
                                        disabled={isMutating}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-transparent hover:bg-destructive/10 text-destructive border border-destructive/30 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <UserMinus size={14} /> Remover Amizade
                                    </button>
                                )
                            )}

                            {isBlocked ? (
                                confirmingUnblock ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {t("public_profile.unblock_confirm_desc", { name: displayName })}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirmingUnblock(false)}
                                                className="flex-1 px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted border border-border rounded-sm uppercase cursor-pointer bg-background"
                                            >
                                                {t("common.cancel")}
                                            </button>
                                            <button
                                                onClick={handleUnblock}
                                                disabled={isMutating}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm uppercase cursor-pointer border-none disabled:opacity-50"
                                            >
                                                {isMutating ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                                                {t("public_profile.unblock_confirm")}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmingUnblock(true)}
                                        disabled={isMutating}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-transparent hover:bg-muted text-foreground border border-border px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <ShieldCheck size={14} />
                                        {t("public_profile.unblock")}
                                    </button>
                                )
                            ) : confirmingBlock ? (
                                <div className="flex flex-col gap-2">
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {t("public_profile.block_confirm_desc", { name: displayName })}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConfirmingBlock(false)}
                                            className="flex-1 px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted border border-border rounded-sm uppercase cursor-pointer bg-background"
                                        >
                                            {t("common.cancel")}
                                        </button>
                                        <button
                                            onClick={handleBlock}
                                            disabled={isMutating}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm uppercase cursor-pointer border-none disabled:opacity-50"
                                        >
                                            {isMutating ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                                            {t("public_profile.block_confirm")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmingBlock(true)}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-transparent hover:bg-destructive/10 text-destructive border border-destructive/40 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    <Ban size={14} /> {t("public_profile.block")}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-card/50 flex items-center justify-center backdrop-blur-sm z-30">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
