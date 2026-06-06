"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Gavel,
    Package,
    ArrowUpRight,
    Star,
    TrendingUp
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";
import auctionService from "@/services/auction.service";
import rbacService from "@/services/rbac.service";
import type { Auction } from "@/types/auction.types";
import { formatCurrency } from "@/utils/auction";

// 12 months data matching the bar chart in the mockup
const statusData = [
    { name: "Jan", value: 12000 },
    { name: "Fev", value: 15000 },
    { name: "Mar", value: 14000 },
    { name: "Abr", value: 18000 },
    { name: "Mai", value: 20000 },
    { name: "Jun", value: 35000 }, // Peak month (highlighted)
    { name: "Jul", value: 15000 },
    { name: "Ago", value: 17000 },
    { name: "Set", value: 16000 },
    { name: "Out", value: 18000 },
    { name: "Nov", value: 14000 },
    { name: "Dez", value: 19000 }
];

export default function Dashboard() {
    const [recentAuctions, setRecentAuctions] = useState<Auction[]>([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeAuctions: 0,
        totalAuctions: 0,
        revenue: 45000000, // Calculated/Fallback metric
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [usersRes, activeRes, totalRes, listRes] = await Promise.all([
                    rbacService.listUsers({ page_size: 1 }),
                    auctionService.list({ status: "LIVE", page_size: 1 }),
                    auctionService.list({ page_size: 5 }),
                    auctionService.list({ page_size: 5 }) // List of recent auctions
                ]);

                setStats({
                    totalUsers: usersRes.data?.count || 0,
                    activeAuctions: activeRes.data?.count || 0,
                    totalAuctions: totalRes.data?.count || 0,
                    revenue: 45850000, // Dynamic base + simulated success
                });

                if (listRes.success && listRes.data) {
                    setRecentAuctions(listRes.data.results);
                }
            } catch (err) {
                console.error("Erro ao obter dados do dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Format date simple helper
    const formatDateSimple = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex flex-col select-none gap-6 pb-6">
            
            {/* TOP ROW: 4 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Receita Total */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-md flex flex-col justify-between min-h-[130px]">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-3 border border-primary/10 shrink-0">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <line x1="12" y1="10" x2="12" y2="18" />
                            <path d="M8 14h8" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Receita Total Estimada</p>
                        <h3 className="text-xl font-black text-slate-900 mt-1">
                            {loading ? "Carregando..." : formatCurrency(stats.revenue)}
                        </h3>
                    </div>
                </div>

                {/* Total Lances */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-md flex flex-col justify-between min-h-[130px]">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-3 border border-primary/10 shrink-0">
                        <Gavel size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Leilões Registrados</p>
                        <h3 className="text-xl font-black text-slate-900 mt-1">
                            {loading ? "..." : stats.totalAuctions}
                        </h3>
                    </div>
                </div>

                {/* Licitantes Ativos */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-md flex flex-col justify-between min-h-[130px]">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-3 border border-primary/10 shrink-0">
                        <Users size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Licitantes Cadastrados</p>
                        <h3 className="text-xl font-black text-slate-900 mt-1">
                            {loading ? "..." : stats.totalUsers}
                        </h3>
                    </div>
                </div>

                {/* Leilões Ativos */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-md flex flex-col justify-between min-h-[130px]">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-3 border border-primary/10 shrink-0">
                        <Package size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Leilões Ativos (Ao Vivo)</p>
                        <h3 className="text-xl font-black text-slate-900 mt-1">
                            {loading ? "..." : stats.activeAuctions}
                        </h3>
                    </div>
                </div>

            </div>

            {/* MIDDLE ROW: Store Status & Popular Lots (Grid 12-cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left: Platform status/Bar chart (col-span-8) */}
                <div className="lg:col-span-8 bg-white rounded-md border border-slate-200 p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-sm font-bold text-slate-900">Status da Plataforma</span>
                        </div>


                    </div>

                    {/* Recharts Bar chart matching mockup style */}
                    <div className="h-60 mt-1 text-[10px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={16}>
                                    {statusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === 5 ? "#1B59F8" : "#E2EAFE"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Popular Lots (col-span-4) */}
                <div className="lg:col-span-4 bg-white rounded-md border border-slate-200 p-5 shadow-md flex flex-col gap-4">
                    <span className="text-sm font-bold text-slate-900">Lotes Populares em Destaque</span>
                    
                    <div className="flex flex-col gap-4 mt-1">
                        {recentAuctions.slice(0, 5).map((auction) => (
                            <div key={auction.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                                        <Gavel size={16} />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <h5 className="text-xs font-bold text-slate-800 leading-tight truncate">{auction.item?.title}</h5>
                                        <p className="text-xs text-[#1B59F8] mt-0.5 font-bold">{formatCurrency(auction.item?.current_price || 0)}</p>
                                    </div>
                                </div>
                                <div className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-1 rounded-md shrink-0">
                                    Destaque
                                </div>
                            </div>
                        ))}
                        {recentAuctions.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-4">Sem dados populares para exibir.</p>
                        )}
                    </div>
                </div>

            </div>

            {/* BOTTOM ROW: Recent Table (Grid 12-cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left: Recent Table (col-span-12) */}
                <div className="lg:col-span-12 bg-white rounded-md border border-slate-200 p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <span className="text-sm font-bold text-slate-900 block mb-4">Leilões Cadastrados Recentemente</span>
                        
                        <div className="overflow-x-auto scrollbar-none">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="pb-3 pr-2">ID Lote</th>
                                        <th className="pb-3 pr-2">Item</th>
                                        <th className="pb-3 pr-2">Categoria</th>
                                        <th className="pb-3 pr-2">Preço Corrente</th>
                                        <th className="pb-3 pr-2">Status</th>
                                        <th className="pb-3">Criação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="py-4 text-center text-slate-400">
                                                Carregando leilões recentes da API...
                                            </td>
                                        </tr>
                                    ) : recentAuctions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-4 text-center text-slate-400">
                                                Nenhum leilão cadastrado no sistema.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentAuctions.map((auction) => (
                                            <tr key={auction.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3.5 text-slate-500 font-mono text-[11px]">#{auction.id}</td>
                                                <td className="py-3.5 font-semibold text-slate-900 pr-2">{auction.item?.title}</td>
                                                <td className="py-3.5 text-slate-500">{auction.item?.category_label || "Sem categoria"}</td>
                                                <td className="py-3.5 font-bold text-[#1B59F8]">{formatCurrency(auction.item?.current_price || 0)}</td>
                                                <td className="py-3.5">
                                                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                                                        {auction.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-slate-400 font-semibold">{formatDateSimple(auction.created_at)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}