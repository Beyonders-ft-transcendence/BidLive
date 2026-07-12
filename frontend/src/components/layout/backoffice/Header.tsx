import { useLocation } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import Avatar from '@/components/common/Avatar';
import { useNotificationsQuery } from '@/hooks/useNotification';
import { useNotificationRealtime } from '@/hooks/useNotificationRealtime';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { t } = useTranslation();

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
    if (path === '/backoffice') return t('backoffice_header.dashboard');
    if (path.includes('/users')) return t('backoffice_header.users');
    if (path.includes('/roles')) return t('backoffice_header.roles');
    if (path.includes('/auctions')) return t('backoffice_header.auctions');
    if (path.includes('/domains')) return t('backoffice_header.domains');
    return t('backoffice_header.admin');
  };

  return (
    <header className="h-16 bg-black border-b border-zinc-800 sticky top-0 z-30 flex items-center justify-between px-6">
      
      {/* Breadcrumbs / Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500 font-medium">{t('backoffice_header.admin_title')}</span>
        <ChevronRight size={14} className="text-zinc-600 rtl:rotate-180" />
        <span className="font-semibold text-zinc-100">{getPageTitle()}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        <LanguageSwitcher />

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
          <div className="hidden md:flex flex-col items-end text-xs rtl:items-start">
            <span className="font-medium text-zinc-200">{user?.full_name || t('backoffice_header.super_admin')}</span>
            <span className="text-zinc-500">
              {typeof user?.roles?.[0] === 'object' ? (user.roles[0] as any).name : user?.roles?.[0] || t('backoffice_header.role_admin')}
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
