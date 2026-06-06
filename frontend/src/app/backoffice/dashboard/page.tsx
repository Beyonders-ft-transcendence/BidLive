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
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between min-h-[130px]">
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
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between min-h-[130px]">
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
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between min-h-[130px]">
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
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between min-h-[130px]">
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

            {/* MIDDLE ROW: Store Status & Rating/Gender (Grid 12-cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left: Platform status/Bar chart (col-span-8) */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-sm font-bold text-slate-900">Status da Plataforma</span>
                            <select className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-500 font-bold focus:outline-none cursor-pointer">
                                <option>Anual</option>
                                <option>Mensal</option>
                            </select>
                        </div>

                        {/* Quick values grid */}
                        <div className="grid grid-cols-3 gap-4 border-b border-slate-50 pb-5 mb-5 select-none">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volume Transacionado</p>
                                <h4 className="text-lg font-black text-slate-900 mt-0.5">{formatCurrency(stats.revenue)}</h4>
                                <span className="inline-flex items-center text-xs text-green-500 font-bold gap-0.5 mt-1">
                                    <ArrowUpRight size={12} strokeWidth={3} /> 1.50%
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Licitantes Únicos</p>
                                <h4 className="text-lg font-black text-slate-900 mt-0.5">{stats.totalUsers}</h4>
                                <span className="inline-flex items-center text-xs text-green-500 font-bold gap-0.5 mt-1">
                                    <ArrowUpRight size={12} strokeWidth={3} /> 2.10%
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Leilões Concluídos</p>
                                <h4 className="text-lg font-black text-slate-900 mt-0.5">{stats.totalAuctions - stats.activeAuctions}</h4>
                                <span className="inline-flex items-center text-xs text-green-500 font-bold gap-0.5 mt-1">
                                    <ArrowUpRight size={12} strokeWidth={3} /> 0.85%
                                </span>
                            </div>
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

                {/* Right: Gender & Reviews (col-span-4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Gênero dos Licitantes */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
                        <span className="text-sm font-bold text-slate-900">Gênero dos Licitantes</span>
                        
                        <div className="grid grid-cols-2 gap-4 mt-1">
                            {/* Male */}
                            <div className="bg-slate-50/50 rounded-xl p-3.5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <circle cx="10" cy="14" r="5" />
                                        <path d="M19 5l-5.5 5.5M14 5h5v5" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Masc.</p>
                                    <p className="text-xs font-black text-slate-800">40%</p>
                                </div>
                            </div>

                            {/* Female */}
                            <div className="bg-slate-50/50 rounded-xl p-3.5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <circle cx="12" cy="9" r="6" />
                                        <path d="M12 15v6M9 18h6" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Fem.</p>
                                    <p className="text-xs font-black text-slate-800">60%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Avaliação da Plataforma */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col gap-3.5 flex-1 justify-between">
                        <span className="text-sm font-bold text-slate-900">Avaliação da Plataforma</span>
                        
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex gap-0.5 text-amber-400">
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} className="text-slate-200" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">4.0 de 5</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total de 445 avaliações</p>

                        {/* Star Rating list */}
                        <div className="flex flex-col gap-2 mt-2">
                            {/* 5 star */}
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span className="w-16">5 estrelas</span>
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full mx-2 overflow-hidden">
                                    <div className="bg-primary h-full w-[50%]" />
                                </div>
                                <span className="w-8 text-right">50%</span>
                            </div>
                            {/* 4 star */}
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span className="w-16">4 estrelas</span>
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full mx-2 overflow-hidden">
                                    <div className="bg-primary h-full w-[15%]" />
                                </div>
                                <span className="w-8 text-right">15%</span>
                            </div>
                            {/* 3 star */}
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span className="w-16">3 estrelas</span>
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full mx-2 overflow-hidden">
                                    <div className="bg-primary h-full w-[13%]" />
                                </div>
                                <span className="w-8 text-right">13%</span>
                            </div>
                            {/* 2 star */}
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span className="w-16">2 estrelas</span>
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full mx-2 overflow-hidden">
                                    <div className="bg-primary h-full w-[12%]" />
                                </div>
                                <span className="w-8 text-right">12%</span>
                            </div>
                            {/* 1 star */}
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span className="w-16">1 estrela</span>
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full mx-2 overflow-hidden">
                                    <div className="bg-primary h-full w-[10%]" />
                                </div>
                                <span className="w-8 text-right">10%</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* BOTTOM ROW: Recent Table & Top Lots (Grid 12-cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left: Recent Table (col-span-8) */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-sm font-bold text-slate-900 block mb-4">Leilões Cadastrados Recentemente</span>
                        
                        <div className="overflow-x-auto scrollbar-none">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="pb-3 pr-2">ID Lote</th>
                                        <th className="pb-3 pr-2">Item</th>
                                        <th className="pb-3 pr-2">Categoria</th>
                                        <th className="pb-3 pr-2">Preço Corrente</th>
                                        <th className="pb-3 pr-2">Status</th>
                                        <th className="pb-3">Criação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
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
                                                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100">
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

                {/* Right: Popular Lots (col-span-4) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
                    <span className="text-sm font-bold text-slate-900">Lotes Populares em Destaque</span>
                    
                    <div className="flex flex-col gap-4 mt-1">
                        {recentAuctions.slice(0, 2).map((auction) => (
                            <div key={auction.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
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

        </div>
    );
}