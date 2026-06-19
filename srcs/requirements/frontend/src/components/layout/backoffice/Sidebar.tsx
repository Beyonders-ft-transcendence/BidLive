"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Gavel,
  TrendingUp,
  Users,
  Tag,
  AlertCircle,
  Settings,
  LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const getIsActive = (href: string) => {
    if (href === "/backoffice/dashboard") {
      return pathname === href || pathname === "/backoffice";
    }
    return pathname.startsWith(href);
  };

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

  const navItems = [
    {
      label: "Painel Geral",
      href: "/backoffice/dashboard",
      icon: <LayoutDashboard size={16} />
    },
    {
      label: "Gestão de Usuários",
      href: "/backoffice/users",
      icon: <Users size={16} />
    },
    {
      label: "Leilões",
      href: "/backoffice/auctions",
      icon: <Gavel size={16} />
    },
    {
      label: "Histórico de Lances",
      href: "/backoffice/bids",
      icon: <TrendingUp size={16} />
    },
    {
      label: "Categorias",
      href: "/backoffice/categories",
      icon: <Tag size={16} />
    },
    {
      label: "Denúncias & Moderação",
      href: "/backoffice/reports",
      icon: <AlertCircle size={16} />
    },
    {
      label: "Configurações",
      href: "/backoffice/settings",
      icon: <Settings size={16} />
    }
  ];

  return (
    <div className="flex flex-col h-full w-60 shrink-0 select-none pb-2">
      {/* Dark Sidebar Card */}
      <div className="flex-1 bg-[#0B0F19] border border-slate-800 rounded-[24px] p-5 flex flex-col overflow-hidden shadow-lg relative">
        {/* Subtle accent glow */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top: Logo & Title */}
        <div className="flex items-center gap-2.5 mb-8 px-1.5 pt-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shrink-0">
            <Gavel size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white leading-none">BidLive</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Backoffice</span>
          </div>
        </div>

        {/* Middle: Nav Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-none relative z-10">
          {navItems.map((item) => {
            const active = getIsActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs transition-all duration-200 group ${
                  active
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold"
                }`}
              >
                <span className={`shrink-0 ${active ? "text-white" : "text-slate-500 group-hover:text-primary"}`}>
                  {item.icon}
                </span>
                <span className="truncate tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Profile card & Logout */}
      <div className="mt-5 flex flex-col gap-3 px-2">
        {/* Profile card */}
        <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30 shrink-0">
            {initials}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-bold text-white truncate leading-tight">
              {user?.full_name || "Super Admin"}
            </span>
            <span className="text-[9px] text-slate-500 font-bold truncate">
              {user?.email || "admin@bidlive.co.ao"}
            </span>
          </div>
        </div>

        {/* Logout Link */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors py-1 px-1 cursor-pointer w-full text-left focus:outline-none"
        >
          <LogOut size={14} />
          LOG OUT
        </button>

        {/* Copyright */}
        <span className="text-[9px] text-slate-600 font-semibold select-none px-1">
          © bidlive.com 2026
        </span>
      </div>
    </div>
  );
}