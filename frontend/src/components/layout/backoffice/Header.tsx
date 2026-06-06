"use client";

import { Search, Bell, ChevronDown, LogOut, Globe } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/signin");
        } catch (err) {
            console.error("Erro ao fazer logout:", err);
        }
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
        <header className="w-full bg-white h-16 flex items-center justify-between px-2 select-none border-b border-slate-100 text-slate-800 z-30 shrink-0 pb-4 mb-4">
            {/* LEFT: Greeting Message */}
            <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-900 leading-tight">
                    Olá, {user?.full_name?.split(" ")[0] || "Administrador"}! 👋
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Painel de Controle
                </span>
            </div>

            {/* MIDDLE: Modern Search Bar */}
            <div className="relative w-80 max-w-xs md:max-w-md hidden sm:block">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-sans"
                />
            </div>

            {/* RIGHT: Language, Notifications, Profile & Logout */}
            <div className="flex items-center gap-4 relative">
                {/* Language Switcher */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 cursor-pointer hover:text-slate-800 transition-colors">
                    <Globe size={13} className="text-slate-400" />
                    <span>PT</span>
                    <ChevronDown size={10} className="text-slate-400" />
                </div>

                {/* Vertical Divider */}
                <span className="w-px h-5 bg-slate-100"></span>

                {/* Notification Bell */}
                <button className="w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors relative cursor-pointer border border-transparent">
                    <Bell size={16} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                </button>

                {/* Vertical Divider */}
                <span className="w-px h-5 bg-slate-100"></span>

                {/* Profile User Dropdown Toggle */}
                <div 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 px-2.5 py-1.5 rounded-xl transition-colors border border-transparent"
                >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                        {initials}
                    </div>
                    <ChevronDown size={12} className="text-slate-400" />
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div className="absolute right-0 top-12 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2 border-b border-slate-50">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Logado como</p>
                            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{user?.username}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-slate-50 hover:text-red-600 transition-colors text-left cursor-pointer font-semibold"
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