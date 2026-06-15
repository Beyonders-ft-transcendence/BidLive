"use client";

import { useMemo } from "react";
import { LogOut, Gavel, LayoutDashboard, TrendingUp, Settings, PlusCircle } from "lucide-react";
import type { User } from "@/types/auth.types";
import Avatar from "@/components/common/Avatar";

interface UserSidebarProps {
  activeTab: "overview" | "my-auctions" | "my-bids" | "settings" | "create-auction";
  setActiveTab: (tab: "overview" | "my-auctions" | "my-bids" | "settings" | "create-auction") => void;
  user: User;
  onLogout: () => void;
}

export default function UserSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}: UserSidebarProps) {
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

  const sidebarItems = [
    { id: "overview", label: "Visão Geral", icon: <LayoutDashboard size={16} /> },
    { id: "my-auctions", label: "Meus Leilões", icon: <Gavel size={16} /> },
    { id: "create-auction", label: "Criar Leilão", icon: <PlusCircle size={16} /> },
    { id: "my-bids", label: "Meus Lances", icon: <TrendingUp size={16} /> },
    { id: "settings", label: "Configurações", icon: <Settings size={16} /> },
  ] as const;

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-5 select-none">
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
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/10"
                    : "text-white/70 hover:text-white hover:bg-white/10 font-semibold"
                }`}
              >
                <span className={isActive ? "text-white animate-pulse" : "text-white/50"}>
                  {item.icon}
                </span>
                <span className="truncate tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile brief card */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar name={user.full_name || user.username} src={user.avatar_url} size="lg" />
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
          onClick={onLogout}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors w-full text-left cursor-pointer focus:outline-none"
        >
          <LogOut size={14} />
          Terminar Sessão
        </button>
      </div>
    </aside>
  );
}
