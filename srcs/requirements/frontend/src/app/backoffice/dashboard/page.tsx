"use client";

import { useMemo } from "react";
import { Users, Gavel, Package } from "lucide-react";

import { useAuctionsQuery } from "@/hooks/useAuction";
import { useUsersQuery } from "@/hooks/useRbac";
import type { Auction } from "@/types/auction.types";
import { formatCurrency } from "@/utils/auction";

import DashboardMetricCard from "./components/DashboardMetricCard";
import PlatformStatusChart from "./components/PlatformStatusChart";
import PopularLots from "./components/PopularLots";
import RecentAuctionsTable from "./components/RecentAuctionsTable";

export default function Dashboard() {
    const { data: usersData, isLoading: loadingUsers } = useUsersQuery({ page_size: 1 });
    const { data: activeAuctionsData, isLoading: loadingActive } = useAuctionsQuery({ status: "LIVE", page_size: 1 });
    const { data: recentAuctionsData, isLoading: loadingRecent } = useAuctionsQuery({ page_size: 5 });

    const loading = loadingUsers || loadingActive || loadingRecent;

    const stats = useMemo(() => ({
        totalUsers: usersData?.count || 0,
        activeAuctions: activeAuctionsData?.count || 0,
        totalAuctions: recentAuctionsData?.count || 0,
        revenue: 45850000,
    }), [usersData, activeAuctionsData, recentAuctionsData]);

    const recentAuctions = recentAuctionsData?.results || [];

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