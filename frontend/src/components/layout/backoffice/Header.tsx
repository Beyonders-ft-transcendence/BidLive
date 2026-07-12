import { useLocation } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import Avatar from '@/components/common/Avatar';
import { useNotificationsQuery } from '@/hooks/useNotification';
import { useNotificationRealtime } from '@/hooks/useNotificationRealtime';

export default function Header() {
  const location = useLocation();
  const { user } = useAuthStore();

  // Ativa a conexão WS para receber notificações em tempo real
  useNotificationRealtime();

  // Consulta as notificações para obter o contador
  const { data: notificationsData } = useNotificationsQuery();
  const notificationsList = Array.isArray(notificationsData) 
    ? notificationsData 
    : (notificationsData as any)?.results || (notificationsData as any)?.data?.results || [];
    
  const unreadCount = notificationsList.filter((n: any) => !n.is_read).length;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/backoffice') return 'Dashboard';
    if (path.includes('/users')) return 'Gestão de Utilizadores';
    if (path.includes('/roles')) return 'Perfis e Permissões';
    if (path.includes('/auctions')) return 'Leilões Ativos';
    if (path.includes('/domains')) return 'Domínios';
    return 'Administração';
  };

  return (
    <header className="h-16 bg-black border-b border-zinc-800 sticky top-0 z-30 flex items-center justify-between px-6">
      
      {/* Breadcrumbs / Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500 font-medium">BidLive Admin</span>
        <ChevronRight size={14} className="text-zinc-600" />
        <span className="font-semibold text-zinc-100">{getPageTitle()}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <button className="relative p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[14px] h-[14px] bg-red-600 text-white text-[9px] font-bold rounded-full px-1 border-2 border-black">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-zinc-800 mx-2"></div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-xs">
            <span className="font-medium text-zinc-200">{user?.full_name || 'Super Admin'}</span>
            <span className="text-zinc-500">
              {typeof user?.roles?.[0] === 'object' ? (user.roles[0] as any).name : user?.roles?.[0] || 'Administrador'}
            </span>
          </div>
          <div className="rounded-full ring-1 ring-zinc-800">
            <Avatar name={user?.full_name || 'Admin'} src={user?.avatar_url} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
