import Logo2 from "@/assets/images/logo2.png";
import Logo from "@/assets/images/logo.png";
import { useState, useEffect, useRef } from "react";
import {
  Sun, Moon, ChevronDown, ChevronRight, Menu, X, Bell, CheckCircle2,
  Globe, MessageSquareText, ShieldCheck, Plus, Gavel, LayoutDashboard,
  UserCog, TrendingUp, Heart, Radio, Users, Sparkles
} from "lucide-react";
import { getTheme, setTheme as setGlobalTheme, type Theme } from "@/shared/utils/themes.utils";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import Avatar from "../common/Avatar";
import UserDrawer from "./UserDrawer";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useNotificationsQuery, useMarkNotificationReadMutation } from "@/hooks/useNotification";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";
import { useTranslation } from "react-i18next";
import { LANGUAGES, baseLanguage } from "@/i18n/languages";

export default function Header() {
    const { t, i18n } = useTranslation();
    const currentLang = baseLanguage(i18n.language);
    const location = useLocation();
    const [theme, setCurrentTheme] = useState<Theme>("light");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const { data: notificationsResponse } = useNotificationsQuery();
    const markReadMutation = useMarkNotificationReadMutation();
    useNotificationRealtime();

    const notifications = Array.isArray(notificationsResponse)
        ? notificationsResponse
        : Array.isArray((notificationsResponse as any)?.data)
            ? (notificationsResponse as any).data
            : (notificationsResponse as any)?.results || (notificationsResponse as any)?.data?.results || [];

    const unreadCount = notifications.filter((n: any) => !n.is_read).length;

    useEffect(() => {
        setCurrentTheme(getTheme());
    }, []);

    // Close notification panel on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifPanel(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleTheme = () => {
        const isDark = document.documentElement.classList.contains("dark");
        const newTheme = isDark ? "light" : "dark";
        setGlobalTheme(newTheme);
        setCurrentTheme(newTheme);
    };

    const isDarkTheme = theme === "dark" || document.documentElement.classList.contains("dark");

    const isActivePath = (path: string) => location.pathname === path;

    const hasAdminRole = user?.roles?.some((r: any) =>
        (typeof r === "string" ? r : r?.name) === "SUPER_ADMIN" ||
        (typeof r === "string" ? r : r?.name) === "MONITOR"
    );

    return (
        <>
        <header className="sticky top-0 z-50 w-full">
            <div className="bg-background/70 backdrop-blur-xl border-b border-border/60">
                <nav className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img src={isDarkTheme ? Logo2 : Logo} alt="BidLive" className="h-7 object-contain" />
                    </Link>

                    {/* Center: Nav Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-1 ml-10">
                        <Link
                            to="/"
                            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                                isActivePath("/")
                                    ? "text-foreground bg-muted"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                        >
                            {t("header.home")}
                        </Link>
                        <Link
                            to="/leiloes"
                            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                                isActivePath("/leiloes")
                                    ? "text-foreground bg-muted"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                        >
                            {t("header.auctions")}
                        </Link>
                    </div>

                    {/* Right Side: Actions (Desktop) */}
                    <div className="hidden md:flex items-center gap-1 ml-auto">

                        {/* Create Auction CTA */}
                        {isAuthenticated && (
                            <Link
                                to="/user?tab=create-auction"
                                className="flex items-center gap-1.5 px-3 py-1.5 mr-1 text-[13px] font-medium text-foreground bg-muted/60 hover:bg-muted border border-border/50 rounded-md transition-all"
                            >
                                <Plus size={14} strokeWidth={2} />
                                <span className="hidden lg:inline">Criar Leilão</span>
                            </Link>
                        )}

                        {/* Separator */}
                        {isAuthenticated && (
                            <div className="w-px h-5 bg-border/60 mx-1" />
                        )}

                        {isAuthenticated && (
                            <>
                                {/* Chat */}
                                <Link
                                    to="/user?tab=chat"
                                    className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    title="Mensagens"
                                >
                                    <MessageSquareText size={18} strokeWidth={1.75} />
                                </Link>

                                {/* Notifications */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={() => setShowNotifPanel(!showNotifPanel)}
                                        className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer border-none bg-transparent"
                                    >
                                        <Bell size={18} strokeWidth={1.75} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background" />
                                        )}
                                    </button>

                                    {showNotifPanel && (
                                        <div className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[420px] animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                                            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                                                <span className="text-[13px] font-semibold text-foreground">{t("nav.notifications")}</span>
                                                {unreadCount > 0 && (
                                                    <span className="text-[11px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="overflow-y-auto flex-1">
                                                {notifications.length === 0 ? (
                                                    <div className="py-10 text-center text-muted-foreground">
                                                        <Bell size={20} className="mx-auto mb-2 opacity-40" />
                                                        <p className="text-xs">{t("nav.noNotifications")}</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-border">
                                                        {notifications.slice(0, 10).map((notif: any) => (
                                                            <div
                                                                key={notif.id}
                                                                className={`px-4 py-3 transition-colors hover:bg-muted/40 ${
                                                                    notif.is_read ? "" : "bg-blue-500/[0.03]"
                                                                }`}
                                                            >
                                                                <div className="flex gap-3 items-start">
                                                                    <div className={`mt-0.5 shrink-0 ${notif.is_read ? "text-muted-foreground" : "text-blue-500"}`}>
                                                                        <Sparkles size={14} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`text-[13px] text-foreground leading-snug ${notif.is_read ? "" : "font-medium"}`}>
                                                                            {notif.title}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notif.content}</p>
                                                                        <p className="text-[11px] text-muted-foreground/60 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                                                                    </div>
                                                                    {!notif.is_read && (
                                                                        <button
                                                                            onClick={() => markReadMutation.mutate(notif.id)}
                                                                            className="shrink-0 p-1 text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer border-none bg-transparent"
                                                                            title={t("nav.markRead")}
                                                                        >
                                                                            <CheckCircle2 size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Language */}
                        <LanguageSwitcher />

                        {/* Theme toggle */}
                        <button
                            onClick={handleToggleTheme}
                            title={t("header.theme")}
                            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer border-none bg-transparent"
                        >
                            {isDarkTheme ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
                        </button>

                        {/* Separator */}
                        <div className="w-px h-5 bg-border/60 mx-1" />

                        {/* User / Login */}
                        {isAuthenticated && user ? (
                            <button
                                onClick={() => setIsUserDrawerOpen(true)}
                                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-muted/60 transition-all duration-150 cursor-pointer border-none bg-transparent"
                            >
                                <Avatar name={user.full_name || user.username} src={user.avatar_url} size="sm" />
                                <ChevronDown size={14} className="text-muted-foreground" />
                            </button>
                        ) : (
                            <Link
                                to="/signin"
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-foreground text-background hover:opacity-90 rounded-md text-[13px] font-medium transition-all text-center"
                            >
                                {t("header.login_register")}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Right Area */}
                    <div className="flex md:hidden items-center gap-0.5">
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/user?tab=chat"
                                    className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <MessageSquareText size={18} strokeWidth={1.75} />
                                </Link>
                                <button
                                    onClick={() => setShowNotifPanel(!showNotifPanel)}
                                    className="relative p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
                                >
                                    <Bell size={18} strokeWidth={1.75} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background" />
                                    )}
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleToggleTheme}
                            title={t("header.theme")}
                            className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
                        >
                            {isDarkTheme ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 rounded-md text-foreground hover:bg-muted/50 transition-colors cursor-pointer border-none bg-transparent"
                        >
                            <Menu size={20} strokeWidth={1.75} />
                        </button>
                    </div>
                </nav>
            </div>
        </header>

        {/* ─── Mobile Drawer ─────────────────────────────────────────────── */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[60] flex justify-end md:hidden">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                <div className="relative w-[85%] max-w-xs h-full bg-background flex flex-col shadow-2xl">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
                        <img src={isDarkTheme ? Logo2 : Logo} alt="BidLive" className="h-6 object-contain" />
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-left">

                        {/* Navigation */}
                        <span className="block px-3 pb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            Navegação
                        </span>
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                                isActivePath("/") ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}>
                            {t("header.home")}
                        </Link>
                        <Link to="/leiloes" onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                                isActivePath("/leiloes") ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}>
                            {t("header.auctions")}
                        </Link>

                        {/* Authenticated Links */}
                        {isAuthenticated && user && (
                            <>
                                <div className="my-3 h-px bg-border" />
                                <span className="block px-3 pb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Dashboard
                                </span>

                                {([
                                    { to: "/user?tab=overview", label: "Visão Geral", icon: <LayoutDashboard size={15} /> },
                                    { to: "/user?tab=profile", label: "Meu Perfil", icon: <UserCog size={15} /> },
                                    { to: "/user?tab=my-auctions", label: "Meus Leilões", icon: <Gavel size={15} /> },
                                    { to: "/user?tab=my-bids", label: "Meus Lances", icon: <TrendingUp size={15} /> },
                                    { to: "/user?tab=favorites", label: "Favoritos", icon: <Heart size={15} /> },
                                    { to: "/user?tab=live-stream", label: "Transmissões", icon: <Radio size={15} /> },
                                    { to: "/user?tab=chat", label: "Mensagens", icon: <MessageSquareText size={15} /> },
                                    { to: "/user?tab=friends", label: "Amigos", icon: <Users size={15} /> },
                                ] as const).map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-muted-foreground/60">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}

                                {/* Create Auction CTA */}
                                <Link
                                    to="/user?tab=create-auction"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2.5 mx-1 mt-2 px-3 py-2.5 rounded-md text-[13px] font-semibold text-foreground bg-muted border border-border/60 hover:bg-muted/80 transition-colors"
                                >
                                    <Plus size={15} strokeWidth={2} />
                                    Criar Novo Leilão
                                </Link>

                                {/* Admin Panel */}
                                {hasAdminRole && (
                                    <Link
                                        to="/backoffice"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 mx-1 mt-1 px-3 py-2.5 rounded-md text-[13px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500/10 transition-colors"
                                    >
                                        <ShieldCheck size={15} />
                                        Painel Backoffice
                                        <ChevronRight size={14} className="ml-auto opacity-40" />
                                    </Link>
                                )}
                            </>
                        )}

                        {/* Language */}
                        <div className="my-3 h-px bg-border" />
                        <span className="block px-3 pb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {t("header.language")}
                        </span>
                        <div className="flex gap-1.5 px-3">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => { i18n.changeLanguage(lang.code); setIsMobileMenuOpen(false); }}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                                        currentLang === lang.code
                                            ? "bg-foreground text-background border-foreground"
                                            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 bg-transparent"
                                    }`}
                                >
                                    {lang.code.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="px-4 py-4 border-t border-border shrink-0">
                        {isAuthenticated && user ? (
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); setIsUserDrawerOpen(true); }}
                                className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-muted text-left transition-colors cursor-pointer border-none bg-transparent"
                            >
                                <Avatar name={user.full_name || user.username} src={user.avatar_url} size="md" />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-[13px] font-semibold text-foreground truncate">{user.full_name || user.username}</span>
                                    <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
                                </div>
                                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                            </button>
                        ) : (
                            <Link
                                to="/signin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center w-full px-4 py-2.5 bg-foreground text-background rounded-md text-[13px] font-medium transition-all hover:opacity-90"
                            >
                                {t("header.login_register")}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        )}

        <UserDrawer isOpen={isUserDrawerOpen} onClose={() => setIsUserDrawerOpen(false)} />
        </>
    );
}
