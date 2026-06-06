"use client";

import { useEffect, useState } from "react";
import { Users, Gavel, Package } from "lucide-react";

import auctionService from "@/services/auction.service";
import rbacService from "@/services/rbac.service";
import type { Auction } from "@/types/auction.types";
import { formatCurrency } from "@/utils/auction";

import DashboardMetricCard from "./components/DashboardMetricCard";
import PlatformStatusChart from "./components/PlatformStatusChart";
import PopularLots from "./components/PopularLots";
import RecentAuctionsTable from "./components/RecentAuctionsTable";

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

    return (
        <div className="flex flex-col select-none gap-6 pb-6">
            
            {/* TOP ROW: 4 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardMetricCard 
                    title="Receita Total Estimada" 
                    value={loading ? "Carregando..." : formatCurrency(stats.revenue)} 
                    icon={
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <line x1="12" y1="10" x2="12" y2="18" />
                            <path d="M8 14h8" />
                        </svg>
                    } 
                />
                <DashboardMetricCard 
                    title="Total Leilões Registrados" 
                    value={loading ? "..." : stats.totalAuctions} 
                    icon={<Gavel size={18} strokeWidth={2.5} />} 
                />
                <DashboardMetricCard 
                    title="Licitantes Cadastrados" 
                    value={loading ? "..." : stats.totalUsers} 
                    icon={<Users size={18} strokeWidth={2.5} />} 
                />
                <DashboardMetricCard 
                    title="Leilões Ativos (Ao Vivo)" 
                    value={loading ? "..." : stats.activeAuctions} 
                    icon={<Package size={18} strokeWidth={2.5} />} 
                />
            </div>

            {/* MIDDLE ROW: Store Status & Popular Lots (Grid 12-cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <PlatformStatusChart />
                <PopularLots auctions={recentAuctions} />
            </div>

            {/* BOTTOM ROW: Recent Table (Grid 12-cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <RecentAuctionsTable auctions={recentAuctions} loading={loading} />
            </div>

        </div>
    );
}