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
    HelpCircle,
    Wallet,
    Package,
    ChevronDown,
    ChevronRight,
    ChevronsLeft
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const getIsActive = (href: string) => {
        if (href === "/backoffice/dashboard") {
            return pathname === href || pathname === "/backoffice";
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-60 bg-white border-r border-gray-100 flex flex-col justify-between select-none shrink-0 h-[calc(100vh-56px)] sticky top-14 overflow-y-auto">
            <div className="flex flex-col flex-1">
                {/* Sub-header inside sidebar */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Painel Principal</span>
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <ChevronsLeft size={12} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="flex flex-col gap-0.5 p-2.5">
                    
                    {/* Collapsible active group: Painel & Leilões */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-sm bg-primary/5 text-primary text-xs font-bold border-l-2 border-primary">
                            <div className="flex items-center gap-2.5">
                                <Gavel size={14} className="text-primary" />
                                <span>Painel & Leilões</span>
                            </div>
                            <ChevronDown size={12} className="text-primary/70" />
                        </div>

                        {/* Nested Sub-links */}
                        <div className="flex flex-col pl-9 pr-2 py-1 gap-1 text-[11px] text-gray-500">
                            <Link
                                href="/backoffice/dashboard"
                                className={`py-1.5 hover:text-gray-900 transition-colors font-semibold ${
                                    getIsActive("/backoffice/dashboard") ? "text-primary font-bold" : ""
                                }`}
                            >
                                Painel Geral
                            </Link>
                            <Link href="/backoffice/auctions" className="py-1.5 hover:text-gray-900 transition-colors font-medium">
                                Leilões Ativos
                            </Link>
                            <Link href="/backoffice/bids" className="py-1.5 hover:text-gray-900 transition-colors font-medium">
                                Lotes Cadastrados
                            </Link>
                            <Link href="/backoffice/users" className="py-1.5 hover:text-gray-900 transition-colors font-medium">
                                Licitantes Registados
                            </Link>
                            <Link href="/backoffice/categories" className="py-1.5 hover:text-gray-900 transition-colors font-medium">
                                Categorias Ativas
                            </Link>
                            <Link href="/backoffice/reports" className="py-1.5 hover:text-gray-900 transition-colors font-medium">
                                Denúncias Recebidas
                            </Link>
                        </div>
                    </div>

                    {/* Collapsible inactive group: Gestão Financeira */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-sm text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition-colors mt-0.5">
                        <div className="flex items-center gap-2.5">
                            <Wallet size={14} className="text-gray-400" />
                            <span>Gestão Financeira</span>
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                    </div>

                    {/* Collapsible inactive group: Usuários e Controlo */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-sm text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition-colors">
                        <div className="flex items-center gap-2.5">
                            <Users size={14} className="text-gray-400" />
                            <span>Controlo Usuários</span>
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                    </div>

                    {/* Collapsible inactive group: Inventário Lotes */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-sm text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition-colors">
                        <div className="flex items-center gap-2.5">
                            <Package size={14} className="text-gray-400" />
                            <span>Inventário Lotes</span>
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                    </div>

                    {/* Collapsible inactive group: Relatórios */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-sm text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition-colors">
                        <div className="flex items-center gap-2.5">
                            <TrendingUp size={14} className="text-gray-400" />
                            <span>Relatórios e Métricas</span>
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                    </div>

                    {/* Collapsible inactive group: Configurações */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-sm text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition-colors">
                        <div className="flex items-center gap-2.5">
                            <Settings size={14} className="text-gray-400" />
                            <span>Configurações</span>
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                    </div>

                </div>
            </div>

            {/* Bottom Contact & Version Info */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-1 text-[9px] text-gray-400 font-bold select-none shrink-0">
                <span className="hover:text-gray-600 transition-colors">info@bidlive.co.ao</span>
                <span>(244) 923-456-789</span>
                <span className="text-gray-300 font-normal mt-1">© 2026, BidLive Tech Inc. v5.10</span>
            </div>
        </aside>
    );
}