import React from 'react';
import Container from '@/components/layout/backoffice/Container';
import { usePlatformStatsQuery } from '@/hooks/useAdmin';
import { Users, Gavel, DollarSign, Activity, TrendingUp } from 'lucide-react';

export default function BackofficeDashboard() {
  const { data: stats, isLoading, isError } = usePlatformStatsQuery();

  return (
    <Container>
      <div className="flex flex-col gap-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <StatCard 
            title="Total de Utilizadores" 
            value={stats?.total_users ?? '-'} 
            icon={Users} 
            trend="+12% este mês"
            trendUp={true}
            isLoading={isLoading} 
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          
          <StatCard 
            title="Leilões Ativos" 
            value={stats?.active_auctions ?? '-'} 
            icon={Activity}
            trend="+2 nas últimas 24h"
            trendUp={true}
            isLoading={isLoading} 
            color="text-green-500"
            bg="bg-green-500/10"
          />

          <StatCard 
            title="Total de Leilões" 
            value={stats?.total_auctions ?? '-'} 
            icon={Gavel} 
            trend="Consistente"
            trendUp={true}
            isLoading={isLoading} 
            color="text-purple-500"
            bg="bg-purple-500/10"
          />

          <StatCard 
            title="Volume / Lances" 
            value={stats?.total_bids ?? '-'} 
            icon={TrendingUp} 
            trend="Alta atividade"
            trendUp={true}
            isLoading={isLoading} 
            color="text-orange-500"
            bg="bg-orange-500/10"
          />

        </div>
        
        {/* Further Content could go here, like charts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
             <span className="text-muted-foreground font-medium">Gráfico de Atividade (Em breve)</span>
           </div>
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
             <span className="text-muted-foreground font-medium">Atividade Recente (Em breve)</span>
           </div>
        </div>

      </div>
    </Container>
  );
}

// Subcomponent for Stats
function StatCard({ title, value, icon: Icon, trend, trendUp, isLoading, color, bg }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity ${color.replace('text', 'bg')}`}></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <div className={`p-2 rounded-lg ${bg} ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      
      <div className="relative z-10">
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
        ) : (
          <div className="text-3xl font-black text-foreground">{value}</div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium relative z-10">
        <span className={trendUp ? 'text-green-500' : 'text-red-500'}>{trend}</span>
      </div>
    </div>
  );
}
