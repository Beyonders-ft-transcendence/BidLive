import Logo2 from "@/assets/images/logo2.png";
import Logo from "@/assets/images/logo.png";
import { useState, useEffect } from "react";
import { Sun, Moon, ChevronDown, Menu, X, Globe, Bell, CheckCircle2 } from "lucide-react";
import { getTheme, setTheme as setGlobalTheme, type Theme } from "@/shared/utils/themes.utils";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import Avatar from "../common/Avatar";
import UserDrawer from "./UserDrawer";
import { useNotificationsQuery, useMarkNotificationReadMutation } from "@/hooks/useNotification";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";

export default function Header() {
    const [theme, setCurrentTheme] = useState<Theme>("light");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
    const [language, setLanguage] = useState("PT"); // PT, EN, AR

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

    return (
        <>
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
            <nav className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src={theme === "dark" || document.documentElement.classList.contains("dark") ? Logo2 : Logo} alt="BidLive Logo" className="h-8 object-contain" />
                </Link>

                {/* Middle Section: Nav Links & Search (Desktop) */}
                <div className="hidden md:flex items-center gap-8 flex-1 justify-center px-4">
                    <nav className="flex items-center gap-8 text-sm font-semibold text-foreground/70">
                        <Link to="/" className="relative hover:text-primary transition-colors group">
                            Início
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </Link>
                        <Link to="/leiloes" className="relative hover:text-primary transition-colors group">
                            Leilões
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </Link>
                    </nav>
                </div>

                {/* Right Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    
                    {/* Language Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors h-full py-2 text-sm font-medium">
                            <Globe size={18} />
                            {language}
                            <ChevronDown size={14} />
                        </button>
                        <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="w-32 bg-card border border-border rounded-md shadow-lg overflow-hidden flex flex-col py-1">
                                <button onClick={() => setLanguage("PT")} className="px-4 py-2 hover:bg-muted text-sm text-left transition-colors text-foreground">Português</button>
                                <button onClick={() => setLanguage("EN")} className="px-4 py-2 hover:bg-muted text-sm text-left transition-colors text-foreground">Inglês</button>
                                <button onClick={() => setLanguage("AR")} className="px-4 py-2 hover:bg-muted text-sm text-left transition-colors text-foreground">Árabe</button>
                            </div>
                        </div>
                    </div>
 
                    <button onClick={handleToggleTheme} title="Mudar Tema" className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer border-none bg-transparent">
                        {theme === "dark" || document.documentElement.classList.contains("dark") ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {isAuthenticated && (
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
                                        <span className="text-xs font-bold uppercase tracking-wider">Notificações</span>
                                        {unreadCount > 0 && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-sm font-bold">{unreadCount} novas</span>}
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-muted-foreground">
                                                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-xs">Sem notificações</p>
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
                                                                    title="Marcar como lida"
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
                    )}

                    {isAuthenticated && user ? (
                        <button 
                            onClick={() => setIsUserDrawerOpen(true)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-muted transition-all duration-200 border border-border bg-card"
                        >
                            <Avatar name={user.full_name || user.username} src={user.avatar_url} size="sm" />
                            <span className="hidden lg:inline text-xs font-bold text-foreground">
                                {user.full_name || user.username}
                            </span>
                        </button>
                    ) : (
                        <Link to="/signin" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-sm text-sm font-medium transition-colors shadow-sm text-center">
                            Registrar / Entrar
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-2">
                    <button onClick={handleToggleTheme} title="Mudar Tema" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        {theme === "dark" || document.documentElement.classList.contains("dark") ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-foreground">
                        <Menu size={24} />
                    </button>
                </div>
            </nav>
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
                <div className="relative w-[80%] max-w-sm h-full bg-background shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <span className="font-semibold text-lg">Menu</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-foreground rounded-md hover:bg-muted transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-4 overflow-y-auto space-y-6 flex-1">

                        <nav className="flex flex-col gap-2 font-medium text-foreground">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary py-3 border-b border-border/50">Início</Link>
                            <Link to="/leiloes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary py-3 border-b border-border/50">Leilões</Link>
                            
                            {/* Mobile Language Selection */}
                            <div className="py-4 border-b border-border/50">
                                <p className="text-muted-foreground text-sm mb-3 flex items-center gap-2"><Globe size={16} /> Idioma</p>
                                <div className="flex gap-2">
                                    <button onClick={() => { setLanguage("PT"); setIsMobileMenuOpen(false); }} className={`flex-1 py-1.5 text-sm rounded border ${language === "PT" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}>PT</button>
                                    <button onClick={() => { setLanguage("EN"); setIsMobileMenuOpen(false); }} className={`flex-1 py-1.5 text-sm rounded border ${language === "EN" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}>EN</button>
                                    <button onClick={() => { setLanguage("AR"); setIsMobileMenuOpen(false); }} className={`flex-1 py-1.5 text-sm rounded border ${language === "AR" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}>AR</button>
                                </div>
                            </div>
                        </nav>
                    </div>

                    <div className="p-4 border-t border-border mt-auto bg-card">
                        {isAuthenticated && user ? (
                            <button 
                                onClick={() => { setIsMobileMenuOpen(false); setIsUserDrawerOpen(true); }}
                                className="flex items-center justify-between w-full p-2.5 rounded-md hover:bg-muted text-left border border-border bg-background"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar name={user.full_name || user.username} src={user.avatar_url} size="md" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground leading-tight">{user.full_name || user.username}</span>
                                        <span className="text-[10px] text-muted-foreground mt-0.5">{user.email}</span>
                                    </div>
                                </div>
                                <ChevronDown size={16} className="-rotate-90 text-muted-foreground" />
                            </button>
                        ) : (
                            <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold transition-colors shadow-sm text-center">
                                Registrar / Entrar
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