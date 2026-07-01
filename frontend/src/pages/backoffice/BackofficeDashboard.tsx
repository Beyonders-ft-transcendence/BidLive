import { Link } from 'react-router-dom';
import Container from '@/components/layout/backoffice/Container';
import { usePlatformStatsQuery, useAdminReportsQuery } from '@/hooks/useAdmin';
import { useAuthStore } from '@/shared/stores/auth.store';
import Avatar from '@/components/common/Avatar';
import { 
  Users, 
  Gavel, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Calendar as CalendarIcon, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

export default function BackofficeDashboard() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = usePlatformStatsQuery();
  const { data: reports = [], isLoading: isLoadingReports } = useAdminReportsQuery('OPEN');

  // Format active role name
  const roleName = typeof user?.roles?.[0] === 'object' 
    ? (user.roles[0] as any).name 
    : user?.roles?.[0] || 'SUPER_ADMIN';

  // Get active reports preview (limit to 3)
  const pendingReports = reports.slice(0, 3);

  // Define calendar properties
  const today = new Date();
  const daysOfWeek = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const monthName = today.toLocaleString('pt-PT', { month: 'long' });
  const yearName = today.getFullYear();
  const currentDay = today.getDate();

  // Generate calendar days (mocking a mini-grid for current month segment)
  const calendarDays = [28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];

  // Helper for bidding activity scale
  const maxBidsCount = stats?.bids_activity?.bids_per_hour_last_24h?.reduce((max, item) => Math.max(max, item.count), 1) || 1;

  return (
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-3 space-y-6">
          {/* Admin Profile Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 relative group">
            {/* Banner/Header Cover */}
            <div className="h-28 bg-gradient-to-r from-primary/30 to-purple-600/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>
            
            {/* Avatar & Basic Info */}
            <div className="px-6 pb-6 relative flex flex-col items-center -mt-10">
              <div className="ring-4 ring-card rounded-full overflow-hidden shadow-lg mb-3 bg-background">
                <Avatar name={user?.full_name || 'Admin'} src={user?.avatar_url} size="lg" />
              </div>
              <h3 className="font-extrabold text-foreground text-center text-lg leading-tight">{user?.full_name}</h3>
              <p className="text-xs text-muted-foreground text-center">@{user?.username}</p>
              
              <span className="mt-2.5 px-3 py-0.5 text-[10px] font-black tracking-wider bg-primary/10 text-primary rounded-full uppercase border border-primary/20">
                {roleName}
              </span>
              
              {/* Profile Small Stats */}
              <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/60 text-center">
                <div>
                  <div className="text-xl font-black text-foreground">
                    {stats?.active_users?.online_now ?? 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Online Agora</div>
                </div>
                <div>
                  <div className="text-xl font-black text-foreground">
                    {reports.length}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Denúncias</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ações Rápidas</h4>
            <div className="grid grid-cols-1 gap-2">
              <Link 
                to="/backoffice/users" 
                className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted border border-border hover:border-primary/30 rounded-xl text-xs font-semibold text-foreground transition-all duration-200"
              >
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                  <Users size={16} />
                </div>
                <span>Gerir Utilizadores</span>
              </Link>

              <Link 
                to="/backoffice/reports" 
                className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted border border-border hover:border-primary/30 rounded-xl text-xs font-semibold text-foreground transition-all duration-200"
              >
                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg shrink-0">
                  <ShieldAlert size={16} />
                </div>
                <span>Resolver Denúncias</span>
              </Link>
            </div>
          </div>

          {/* Analytics Top Event Types */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Eventos do Sistema</h4>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5 animate-pulse">
                    <div className="h-3 w-20 bg-muted rounded"></div>
                    <div className="h-2 w-full bg-muted rounded"></div>
                  </div>
                ))
              ) : stats?.top_event_types && stats.top_event_types.length > 0 ? (
                stats.top_event_types.map((event, idx) => {
                  const maxCount = stats.top_event_types[0]?.count || 1;
                  const pct = Math.max(10, Math.round((event.count / maxCount) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-foreground truncate max-w-[130px]" title={event.event_type}>
                          {event.event_type}
                        </span>
                        <span className="text-muted-foreground">{event.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Sem eventos agregados.</p>
              )}
            </div>
          </div>
        </div>

        {/* ================= MIDDLE COLUMN ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Users Horizontal List ("Just for you" style) */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Atividade Recente</h4>
              <span className="text-[10px] font-black text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                {stats?.active_users?.online_now ?? 0} online
              </span>
            </div>
            
            {/* Horizontal avatars */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {/* Admin Avatar first */}
              <div className="flex flex-col items-center shrink-0 space-y-1">
                <div className="relative p-0.5 rounded-full ring-2 ring-primary/40 ring-offset-2 ring-offset-background">
                  <Avatar name={user?.full_name || 'Admin'} src={user?.avatar_url} size="md" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
                </div>
                <span className="text-[10px] font-bold text-foreground truncate w-12 text-center">Tu</span>
              </div>

              {/* Sample members to simulate the Community view */}
              <div className="flex flex-col items-center shrink-0 space-y-1 opacity-75">
                <Avatar name="Carlos Silva" size="md" />
                <span className="text-[10px] font-medium text-foreground truncate w-12 text-center">Carlos</span>
              </div>
              <div className="flex flex-col items-center shrink-0 space-y-1 opacity-75">
                <Avatar name="Ana Costa" size="md" />
                <span className="text-[10px] font-medium text-foreground truncate w-12 text-center">Ana</span>
              </div>
              <div className="flex flex-col items-center shrink-0 space-y-1 opacity-75">
                <Avatar name="Pedro Pinto" size="md" />
                <span className="text-[10px] font-medium text-foreground truncate w-12 text-center">Pedro</span>
              </div>
              <div className="flex flex-col items-center shrink-0 space-y-1 opacity-75">
                <Avatar name="Maria Santos" size="md" />
                <span className="text-[10px] font-medium text-foreground truncate w-12 text-center">Maria</span>
              </div>
            </div>
          </div>

          {/* Feed style: Active Reports Feed */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Denúncias Pendentes</h4>
              <Link to="/backoffice/reports" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Ver Todas <ExternalLink size={12} />
              </Link>
            </div>

            {isLoadingReports ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-muted rounded"></div>
                      <div className="h-3 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="h-10 w-full bg-muted rounded"></div>
                </div>
              ))
            ) : pendingReports.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                <CheckSquare className="mx-auto text-green-500/30 mb-2" size={32} />
                <p className="text-sm font-semibold">Tudo limpo! Nenhuma denúncia aberta de momento.</p>
              </div>
            ) : (
              pendingReports.map((report) => (
                <div key={report.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 space-y-4">
                  {/* Reporter header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={report.reporter.full_name} src={report.reporter.avatar_url} size="md" />
                      <div>
                        <h5 className="font-bold text-sm text-foreground">{report.reporter.full_name}</h5>
                        <p className="text-xs text-muted-foreground">@{report.reporter.username}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase">
                      {report.reason}
                    </span>
                  </div>

                  {/* Target details */}
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border/30">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Conteúdo Denunciado</div>
                    <p className="text-xs font-semibold text-foreground">
                      Elemento: <span className="text-primary font-bold">{report.target_type}</span> (ID: {report.target_id})
                    </p>
                    {report.description && (
                      <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">
                        "{report.description}"
                      </p>
                    )}
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Clock size={12} /> {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Link 
                        to="/backoffice/reports" 
                        className="py-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition-colors"
                      >
                        Avaliar
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Conversion Metrics & Engagement Rate */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Estatísticas de Conversão</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Metric 1 */}
              <div className="bg-muted/30 p-4 rounded-xl border border-border/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Conversão de Leilões</span>
                  <span className="text-2xl font-black text-foreground mt-1 block">
                    {stats?.conversion_metrics?.auction_conversion_rate_percentage ?? 0}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-1 block">Relação Vendidos vs Terminados</span>
                </div>
                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                  <Gavel size={20} />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-muted/30 p-4 rounded-xl border border-border/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Engagement de Licitantes</span>
                  <span className="text-2xl font-black text-foreground mt-1 block">
                    {stats?.conversion_metrics?.bidder_engagement_rate_percentage ?? 0}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-1 block">Licitadores ativos vs Registados</span>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mini Calendar Widget */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <CalendarIcon className="text-primary" size={16} />
              <span className="text-xs font-bold text-foreground capitalize">{monthName} de {yearName}</span>
            </div>
            
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-2 text-center">
              {daysOfWeek.map((d, idx) => (
                <span key={idx} className="text-[9px] font-bold text-muted-foreground">{d}</span>
              ))}
              {calendarDays.slice(0, 28).map((day, idx) => {
                const isCurrent = day === currentDay && idx > 2; // Simple condition for mock
                return (
                  <span 
                    key={idx} 
                    className={`text-xs font-semibold py-1 rounded-md ${
                      isCurrent 
                        ? 'bg-primary text-primary-foreground font-black' 
                        : 'text-foreground/80 hover:bg-muted/50 cursor-pointer'
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Bidding Activity Hour-by-Hour (Tailwind pure CSS graph) */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lances nas últimas 24h</h4>
              <Activity size={14} className="text-primary" />
            </div>

            {/* Barchart Wrapper */}
            <div className="h-32 flex items-end justify-between gap-1 pt-4 border-b border-border pb-2 px-1">
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-muted animate-pulse rounded-t h-12"></div>
                ))
              ) : stats?.bids_activity?.bids_per_hour_last_24h && stats.bids_activity.bids_per_hour_last_24h.length > 0 ? (
                stats.bids_activity.bids_per_hour_last_24h.map((item, idx) => {
                  const barHeight = Math.max(4, Math.round((item.count / maxBidsCount) * 80));
                  const hourLabel = item.hour ? new Date(item.hour).getHours() + 'h' : '';
                  return (
                    <div 
                      key={idx} 
                      className="flex-1 bg-primary/20 hover:bg-primary rounded-t transition-all group relative cursor-pointer"
                      style={{ height: `${barHeight}px` }}
                    >
                      {/* Tooltip */}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                        {item.count} lance(s) @ {hourLabel}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-[10px] text-muted-foreground pb-4">Sem lances registados.</div>
              )}
            </div>
            
            <div className="flex justify-between text-[9px] font-bold text-muted-foreground px-1">
              <span>Há 24h</span>
              <span>Agora</span>
            </div>
          </div>

          {/* Active Moderator/Team members */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Moderadores Online</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Avatar name="Super Admin" size="sm" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-background rounded-full"></span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Tu</h5>
                    <p className="text-[9px] text-muted-foreground">SUPER_ADMIN</p>
                  </div>
                </div>
                <ShieldCheck size={14} className="text-primary" />
              </div>

              {/* Sample moderator */}
              <div className="flex items-center justify-between opacity-80">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Avatar name="Mod Carlos" size="sm" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-background rounded-full"></span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Carlos Silva</h5>
                    <p className="text-[9px] text-muted-foreground">MODERATOR</p>
                  </div>
                </div>
                <ShieldCheck size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </Container>
  );
}
