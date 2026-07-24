import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Container from '@/components/layout/backoffice/Container';
import { useTranslation } from 'react-i18next';
import { usePlatformStatsQuery, useAdminReportsQuery } from "@/hooks/useAdmin";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/shared/stores/auth.store";
import { 
  Users, ShieldAlert, Gavel, TrendingUp, AlertTriangle, 
  ArrowUpRight, Activity, UserCheck, Shield
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BackofficeDashboard() {
  const { t } = useTranslation();
  useDocumentTitle(t('backoffice_header.dashboard', 'Dashboard Backoffice'));

  const user = useAuthStore((state) => state.user);
  const permissions = usePermissions();

  const { data: stats, isLoading: loadingStats } = usePlatformStatsQuery();
  const { data: openReports } = useAdminReportsQuery('OPEN');

  const openReportsCount = openReports ? openReports.length : 0;
  const onlineNow = stats?.active_users?.online_now || 0;
  const activeLastHour = stats?.active_users?.active_last_hour || 0;
  const conversionRate = stats?.conversion_metrics?.auction_conversion_rate_percentage || 0;
  const engagementRate = stats?.conversion_metrics?.bidder_engagement_rate_percentage || 0;
  const totalEnded = stats?.conversion_metrics?.total_ended_auctions || 0;
  const totalSold = stats?.conversion_metrics?.sold_auctions || 0;

  return (
    <Container>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {t('backoffice.welcome', 'Painel de Gestão Backoffice')}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                permissions.isSuperAdmin 
                  ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}>
                {permissions.isSuperAdmin ? 'Super Admin' : 'Monitor'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('backoffice.welcome_desc', 'Monitorização em tempo real do ecossistema BidLive')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-muted-foreground">{t('backoffice.logged_as', 'Utilizador')}:</span>
            <span className="font-bold text-foreground">{user?.username}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Live Users */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-xs hover:border-primary/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('backoffice.metrics_online_now', 'Utilizadores Online')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">
                {loadingStats ? "—" : onlineNow}
              </span>
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-0.5">
                <Activity size={12} />
                {activeLastHour} {t('backoffice.last_hour', 'na última hora')}
              </span>
            </div>
          </div>

          {/* Card 2: Open Reports */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-xs hover:border-destructive/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('backoffice.metrics_open_reports', 'Denúncias Abertas')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">
                {openReportsCount}
              </span>
              <Link 
                to="/backoffice/reports" 
                className="text-[11px] text-red-500 font-semibold hover:underline flex items-center gap-0.5"
              >
                {t('backoffice.review_now', 'Revisar agora')} <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card 3: Sold Auctions */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-xs hover:border-primary/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('backoffice.metrics_sold_auctions', 'Leilões Concluídos')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                <Gavel size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">
                {loadingStats ? "—" : totalSold}
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {totalEnded} {t('backoffice.total_ended', 'encerrados')}
              </span>
            </div>
          </div>

          {/* Card 4: Conversion Rate */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-xs hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('backoffice.metrics_conversion', 'Taxa de Conversão')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">
                {loadingStats ? "—" : `${conversionRate}%`}
              </span>
              <span className="text-[11px] text-amber-500 font-semibold">
                {engagementRate}% {t('backoffice.engagement', 'engajamento')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Access Modules */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            {t('backoffice.quick_modules', 'Módulos Administrativos')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Module 1: Gestão de Utilizadores */}
            <Link 
              to="/backoffice/users"
              className="bg-card border border-border p-5 rounded-xl hover:border-primary transition-all flex items-start gap-4 shadow-xs group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <UserCheck size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                  {t('backoffice.mod_users', 'Gestão de Utilizadores')}
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {t('backoffice.mod_users_desc', 'Gerir contas, aplicar suspensões e definir perfis de utilizador.')}
                </p>
              </div>
            </Link>

            {/* Module 2: Moderção & Denúncias */}
            <Link 
              to="/backoffice/reports"
              className="bg-card border border-border p-5 rounded-xl hover:border-destructive transition-all flex items-start gap-4 shadow-xs group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <ShieldAlert size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                  {t('backoffice.mod_reports', 'Moderação de Denúncias')}
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {t('backoffice.mod_reports_desc', 'Analisar relatos de abuso, spam e violações de termos.')}
                </p>
              </div>
            </Link>

            {/* Module 3: Controlo RBAC */}
            {permissions.isSuperAdmin && (
              <Link 
                to="/backoffice/roles"
                className="bg-card border border-border p-5 rounded-xl hover:border-purple-500 transition-all flex items-start gap-4 shadow-xs group"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Shield size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                    {t('backoffice.mod_rbac', 'Perfis e Permissões (RBAC)')}
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t('backoffice.mod_rbac_desc', 'Configurar permissões granulares e funções do sistema.')}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
