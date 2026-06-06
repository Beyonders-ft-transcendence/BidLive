"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Gavel,
    Tag,
    TrendingUp,
    AlertCircle,
    Settings,
    Sun,
    Moon,
    HelpCircle,
    LogOut
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const items = [
        { href: "/backoffice/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/backoffice/users", icon: Users, label: "Usuários" },
        { href: "/backoffice/auctions", icon: Gavel, label: "Leilões" },
        { href: "/backoffice/categories", icon: Tag, label: "Categorias" },
        { href: "/backoffice/bids", icon: TrendingUp, label: "Lances" },
        { href: "/backoffice/reports", icon: AlertCircle, label: "Denúncias" },
        { href: "/backoffice/settings", icon: Settings, label: "Configurações" }
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-white border-r border-gray-100 flex flex-col justify-between items-center py-6 z-30 select-none">
            {/* Top: Light/Dark Mode Mock Toggles */}
            <div className="flex flex-col gap-1.5 items-center">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-amber-500 bg-amber-50 shadow-sm transition-all duration-300">
                    <Sun size={15} strokeWidth={2.5} />
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-300">
                    <Moon size={15} />
                </button>
            </div>

            {/* Middle: Navigation Icons */}
            <nav className="flex flex-col gap-3.5 my-auto">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 relative group ${
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/25"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                            
                            {/* Hover tooltip */}
                            <span className="absolute left-[78px] bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: Support & Signout */}
            <div className="flex flex-col gap-3.5 items-center">
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-300 relative group">
                    <HelpCircle size={16} />
                    <span className="absolute left-[78px] bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
                        Ajuda & Suporte
                    </span>
                </button>
                <Link
                    href="/signin"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300 relative group"
                >
                    <LogOut size={16} />
                    <span className="absolute left-[78px] bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
                        Sair
                    </span>
                </Link>
            </div>
        </aside>
    );
}