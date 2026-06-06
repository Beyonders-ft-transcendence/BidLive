"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gavel,
  TrendingUp,
  Users,
  Tag,
  AlertCircle,
  Settings,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getIsActive = (href: string) => {
    if (href === "/backoffice/dashboard") {
      return pathname === href || pathname === "/backoffice";
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    {
      label: "Painel Geral",
      href: "/backoffice/dashboard",
      icon: <LayoutDashboard size={14} />
    },
    {
      label: "Gestão de Usuários",
      href: "/backoffice/users",
      icon: <Users size={14} />
    },
    {
      label: "Leilões",
      href: "/backoffice/auctions",
      icon: <Gavel size={14} />
    },
    {
      label: "Histórico de Lances",
      href: "/backoffice/bids",
      icon: <TrendingUp size={14} />
    },
    {
      label: "Categorias",
      href: "/backoffice/categories",
      icon: <Tag size={14} />
    },
    {
      label: "Denúncias & Moderação",
      href: "/backoffice/reports",
      icon: <AlertCircle size={14} />
    },
    {
      label: "Configurações",
      href: "/backoffice/settings",
      icon: <Settings size={14} />
    }
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-100 flex flex-col justify-between select-none shrink-0 h-[calc(100vh-56px)] sticky top-14 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none">
        {/* Toggle Collapse Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50 bg-gray-50/50 min-h-[37px]">
          {!isCollapsed && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
              Administração
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer mx-auto md:mr-0 focus:outline-none"
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isCollapsed ? <ChevronsRight size={12} /> : <ChevronsLeft size={12} />}
          </button>
        </div>

        {/* Menu Navigation List */}
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => {
            const active = getIsActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs transition-all duration-150 group ${
                  active
                    ? "bg-primary text-white font-bold border-l-2 border-primary-light"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={`shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Details */}
      {!isCollapsed ? (
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-1 text-[9px] text-gray-400 font-bold select-none shrink-0">
          <span className="hover:text-gray-600 transition-colors">info@bidlive.co.ao</span>
          <span className="text-gray-300 font-normal">© 2026, BidLive Tech Inc. v5.12</span>
        </div>
      ) : (
        <div className="py-4 border-t border-gray-100 flex justify-center bg-gray-50/50 shrink-0">
          <span className="text-[9px] text-gray-300 font-normal">v5.12</span>
        </div>
      )}
    </aside>
  );
}