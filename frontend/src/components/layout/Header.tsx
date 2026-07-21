import Logo2 from "@/assets/images/logo2.png";
import Logo from "@/assets/images/logo.png";
import { useState, useEffect } from "react";
import { Sun, Moon, ChevronDown, Menu, X, Bell, CheckCircle2, Globe, MessageCircle, ShieldCheck } from "lucide-react";
import { getTheme, setTheme as setGlobalTheme, type Theme } from "@/shared/utils/themes.utils";
import { Link } from "react-router-dom";
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
    const [theme, setCurrentTheme] = useState<Theme>("light");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);

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

    const handleToggleTheme = () => {
        const isDark = document.documentElement.classList.contains("dark");
        const newTheme = isDark ? "light" : "dark";
        setGlobalTheme(newTheme);
        setCurrentTheme(newTheme);
    };

    const isDarkTheme = theme === "dark" || document.documentElement.classList.contains("dark");

    return (
        <>
        <header className="sticky top-0 z-50 w-full flex flex-col">
            <div className="bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
                <nav className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src={isDarkTheme ? Logo2 : Logo} alt="BidLive Logo" className="h-8 sm:h-9 object-contain" />
                    </Link>

                    {/* Right Side: Links + Actions (Desktop) */}
                    <div className="hidden md:flex items-center gap-6 justify-end flex-1">

                        {/* Nav Links */}
                        <nav className="flex items-center gap-6 text-sm font-bold text-foreground/70">
                            <Link to="/" className="relative hover:text-primary transition-colors group">
                                {t("header.home")}
                                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
                            </Link>
                            <Link to="/leiloes" className="relative hover:text-primary transition-colors group">
                                {t("header.auctions")}
                                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
                            </Link>
                        </nav>

                    {isAuthenticated && (
                        <div className="flex items-center gap-2 h-full">
                            {/* Chat Button */}
                            <Link 
                                to="/user?tab=chat" 
                                className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                                title="Chat"
                            >
                                <MessageCircle size={20} />
                            </Link>
                            
                            {/* Notifications */}
                            <div className="relative group flex items-center h-full">
                                <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer border-none bg-transparent">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                                )}
                            </button>
                            
                            <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <div className="w-80 bg-card border border-border rounded-md shadow-lg overflow-hidden flex flex-col max-h-[400px]">
                                    <div className="p-3 border-b border-border flex items-center justify-between bg-muted/50">
                                        <span className="text-xs font-bold uppercase tracking-wider">{t("nav.notifications")}</span>
                                        {unreadCount > 0 && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-sm font-bold">{t("nav.unread", { count: unreadCount })}</span>}
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-muted-foreground">
                                                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-xs">{t("nav.noNotifications")}</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {notifications.slice(0, 10).map((notif: any) => (
                                                    <div key={notif.id} className={`p-3 transition-colors ${notif.is_read ? "bg-background" : "bg-primary/5"}`}>
                                                        <div className="flex gap-3">
                                                            <div className="mt-0.5 text-primary shrink-0">
                                                                <Bell size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs text-foreground mb-1 ${notif.is_read ? "font-medium" : "font-bold"}`}>{notif.title}</p>
                                                                <p className="text-[10px] text-muted-foreground line-clamp-2">{notif.content}</p>
                                                                <p className="text-[9px] text-muted-foreground mt-1 font-mono">{new Date(notif.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            {!notif.is_read && (
                                                                <button 
                                                                    onClick={() => markReadMutation.mutate(notif.id)}
                                                                    className="shrink-0 p-1 text-muted-foreground hover:text-green-500 transition-colors cursor-pointer border-none bg-transparent"
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
                            </div>
                        </div>
                        </div>
                    )}

                        {/* Language */}
                        <LanguageSwitcher />

                        {/* Theme toggle */}
                        <button onClick={handleToggleTheme} title={t("header.theme")} className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer border-none bg-transparent">
                            {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {isAuthenticated && user ? (
                            <button
                                onClick={() => setIsUserDrawerOpen(true)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-muted transition-all duration-200 border border-border bg-card shadow-sm"
                            >
                                <Avatar name={user.full_name || user.username} src={user.avatar_url} size="sm" />
                                <span className="hidden lg:inline text-xs font-bold text-foreground">
                                    {user.full_name || user.username}
                                </span>
                            </button>
                        ) : (
                            <Link to="/signin" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md text-sm font-bold transition-all shadow-sm shadow-primary/20 text-center uppercase tracking-wider">
                                {t("header.login_register")}
                            </Link>
                        )}
                    </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-2">
                    <button onClick={handleToggleTheme} title={t("header.theme")} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        {theme === "dark" || document.documentElement.classList.contains("dark") ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-foreground">
                        <Menu size={24} />
                    </button>
                </div>
            </nav>
            </div>
        </header>

        {/* Mobile Menu Side Drawer */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[60] flex justify-end md:hidden">
                {/* Backdrop overlay */}
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Drawer */}
                <div className="relative w-[85%] max-w-sm h-full bg-background shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <span className="font-bold text-base uppercase tracking-wider">{t("header.menu")}</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-foreground rounded-md hover:bg-muted transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto space-y-5 flex-1 text-left">
                        {/* Main Site Links */}
                        <nav className="flex flex-col gap-1 font-medium text-foreground">
                            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest px-2 mb-1">
                                Navegação
                            </span>
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary px-3 py-2 rounded-md hover:bg-muted text-xs font-bold transition-colors">
                                {t("header.home")}
                            </Link>
                            <Link to="/leiloes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary px-3 py-2 rounded-md hover:bg-muted text-xs font-bold transition-colors">
                                {t("header.auctions")}
                            </Link>
                        </nav>

                        {/* Authenticated User Menu Section */}
                        {isAuthenticated && user && (
                            <div className="pt-3 border-t border-border space-y-1">
                                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest px-2 mb-1 block">
                                    Minha Conta & Dashboard
                                </span>
                                
                                <Link 
                                    to="/user?tab=overview" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                >
                                    Visão Geral
                                </Link>

                                <Link 
                                    to="/user?tab=profile" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                >
                                    Meu Perfil
                                </Link>

                                <Link 
                                    to="/user?tab=my-auctions" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                >
                                    Meus Leilões
                                </Link>

                                <Link 
                                    to="/user?tab=create-auction" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-primary font-bold transition-colors"
                                >
                                    + Criar Novo Leilão
                                </Link>

                                <Link 
                                    to="/user?tab=my-bids" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                >
                                    Meus Lances
                                </Link>

                                <Link 
                                    to="/user?tab=favorites" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                >
                                    Favoritos
                                </Link>

                                <Link 
                                    to="/user?tab=live-stream" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                >
                                    Transmissões ao Vivo
                                </Link>

                                <Link 
                                    to="/user?tab=chat" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageCircle size={16} className="text-primary" />
                                        <span>Chat & Mensagens</span>
                                    </div>
                                </Link>

                                <Link 
                                    to="/user?tab=friends" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                >
                                    Amigos
                                </Link>

                                {(user.roles?.some((r: any) => (typeof r === "string" ? r : r?.name) === "SUPER_ADMIN" || (typeof r === "string" ? r : r?.name) === "MONITOR")) && (
                                    <Link 
                                        to="/backoffice" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold mt-2 transition-colors"
                                    >
                                        <ShieldCheck size={16} />
                                        Painel Backoffice
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Mobile Language Selection */}
                        <div className="pt-3 border-t border-border">
                            <p className="text-muted-foreground text-xs font-bold mb-2 flex items-center gap-2"><Globe size={14} /> {t("header.language")}</p>
                            <div className="flex gap-2">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => { i18n.changeLanguage(lang.code); setIsMobileMenuOpen(false); }}
                                        className={`flex-1 py-1 text-xs font-bold rounded border ${currentLang === lang.code ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}
                                    >
                                        {lang.code.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-border mt-auto bg-card flex flex-col gap-3">
                        {isAuthenticated && user ? (
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); setIsUserDrawerOpen(true); }}
                                className="flex items-center justify-between w-full p-3 rounded-md hover:bg-muted text-left border border-border bg-background shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar name={user.full_name || user.username} src={user.avatar_url} size="md" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-foreground truncate leading-tight">{user.full_name || user.username}</span>
                                        <span className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</span>
                                    </div>
                                </div>
                                <ChevronDown size={16} className="-rotate-90 text-muted-foreground shrink-0" />
                            </button>
                        ) : (
                            <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md text-xs font-bold uppercase transition-colors shadow-sm text-center">
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
