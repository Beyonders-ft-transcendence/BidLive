"use client";

import { Bell, ChevronDown, LogOut, Globe, Moon } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const router = useRouter();
    const pathname = usePathname();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/signin");
        } catch (err) {
            console.error("Erro ao fazer logout:", err);
        }
    };

    // Map path to title dynamically
    const getPageTitle = () => {
        if (!pathname) return "Painel de Controle";
        if (pathname.includes("/dashboard")) return "Painel Geral";
        if (pathname.includes("/users")) return "Gestão de Usuários";
        if (pathname.includes("/auctions")) return "Gestão de Leilões";
        if (pathname.includes("/bids")) return "Histórico de Lances";
        if (pathname.includes("/categories")) return "Categorias";
        if (pathname.includes("/reports")) return "Denúncias e Moderação";
        if (pathname.includes("/settings")) return "Configurações";
        return "Painel de Controle";
    };

    // Calculate initials
    const initials = user?.full_name
        ? user.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "AD";

    return (
        <header className="w-full bg-[#151C2C] h-16 flex items-center justify-between px-2 select-none border-b border-slate-800 text-slate-200 z-30 shrink-0 pb-4 mb-4">
            {/* LEFT: Dynamic Page Title */}
            <div className="flex flex-col text-left">
                <span className="text-xl text-white font-black tracking-tight">
                    {getPageTitle()}
                </span>
            </div>

            {/* RIGHT: Theme, Language, Notifications, Profile & Logout */}
            <div className="flex items-center gap-4 relative">
                
                {/* Theme Switcher Toggle */}
                <button className="w-9 h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative cursor-pointer border border-transparent">
                    <Moon size={16} />
                </button>

                {/* Language Switcher */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 cursor-pointer hover:text-white transition-colors">
                    <Globe size={13} className="text-slate-400" />
                    <span>PT</span>
                    <ChevronDown size={10} className="text-slate-400" />
                </div>

                {/* Vertical Divider */}
                <span className="w-px h-5 bg-slate-800"></span>

                {/* Notification Bell */}
                <button className="w-9 h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative cursor-pointer border border-transparent">
                    <Bell size={16} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary"></span>
                </button>

                {/* Vertical Divider */}
                <span className="w-px h-5 bg-slate-800"></span>

                {/* Profile User Dropdown Toggle */}
                <div 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-800 px-2.5 py-1.5 rounded-xl transition-colors border border-transparent"
                >
                    <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30 shrink-0">
                        {initials}
                    </div>
                    <ChevronDown size={12} className="text-slate-400" />
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div className="absolute right-0 top-12 w-48 bg-[#0B0F19] border border-slate-800 rounded-xl shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2 border-b border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Logado como</p>
                            <p className="text-xs font-bold text-white truncate mt-0.5">{user?.username}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors text-left cursor-pointer font-semibold"
                        >
                            <LogOut size={14} />
                            Terminar Sessão
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}