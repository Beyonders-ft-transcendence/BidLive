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
    HelpCircle
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { href: "/backoffice/dashboard", icon: LayoutDashboard, label: "Painel" },
        { href: "/backoffice/auctions", icon: Gavel, label: "Leilões" },
        { href: "/backoffice/bids", icon: TrendingUp, label: "Lances" },
        { href: "/backoffice/users", icon: "Users", label: "Licitantes" },
        { href: "/backoffice/categories", icon: "Tag", label: "Categorias" },
        { href: "/backoffice/reports", icon: "AlertCircle", label: "Denúncias" }
    ];

    const getIsActive = (href: string) => {
        if (href === "/backoffice/dashboard") {
            return pathname === href || pathname === "/backoffice";
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-100 flex flex-col justify-between z-30 select-none">
            <div className="flex flex-col flex-1">
                {/* Logo Stack similar to mockup */}
                <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-50 shrink-0">
                    <svg className="h-6 w-6 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
                    </svg>
                    <span className="text-lg font-black tracking-tight text-gray-900">BidLive</span>
                </div>

                {/* Primary Nav Links */}
                <nav className="flex flex-col gap-1 px-3 py-6">
                    {menuItems.map((item) => {
                        const isActive = getIsActive(item.href);
                        let Icon;
                        if (item.icon === "Users") Icon = Users;
                        else if (item.icon === "Tag") Icon = Tag;
                        else if (item.icon === "AlertCircle") Icon = AlertCircle;
                        else Icon = item.icon as any;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                    isActive
                                        ? "bg-primary/5 text-primary border-l-4 border-primary pl-3"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 pl-4"
                                }`}
                            >
                                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Admin Tools */}
            <div className="flex flex-col gap-1 px-3 py-6 border-t border-gray-50">
                <Link
                    href="/backoffice/settings"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        getIsActive("/backoffice/settings")
                            ? "bg-primary/5 text-primary border-l-4 border-primary pl-3"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 pl-4"
                    }`}
                >
                    <Settings size={16} />
                    Configurações
                </Link>
                <button
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 pl-4 text-left w-full cursor-pointer"
                >
                    <HelpCircle size={16} />
                    Ajuda
                </button>
            </div>
        </aside>
    );
}