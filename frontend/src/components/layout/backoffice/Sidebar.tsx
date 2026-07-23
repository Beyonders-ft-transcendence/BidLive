import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  LogOut,
  Gavel,
  ShieldAlert,
  X
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import Logo from "@/assets/images/logo2.png";
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { name: t('backoffice_sidebar.dashboard'), path: '/backoffice', icon: LayoutDashboard },
    { name: t('backoffice_sidebar.users'), path: '/backoffice/users', icon: Users },
    { name: t('backoffice_sidebar.reports'), path: '/backoffice/reports', icon: ShieldAlert },
    { name: t('backoffice_sidebar.auctions'), path: '/backoffice/auctions', icon: Gavel },
    { name: t('backoffice_sidebar.roles'), path: '/backoffice/roles', icon: ShieldCheck },
  ];

  return (
    <aside className={`
      w-64 h-screen bg-black text-zinc-400 flex flex-col fixed left-0 top-0 border-r border-zinc-800 z-40
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
        <Link to="/backoffice" className="flex items-center gap-2 transition-opacity hover:opacity-80" onClick={() => window.innerWidth < 768 && onClose()}>
          <img src={Logo} alt="BidLive Admin" className="h-6 object-contain" />
        </Link>
        <button 
          onClick={onClose}
          className="md:hidden p-2 text-zinc-400 hover:text-zinc-100"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase mb-3 px-3">{t('backoffice_sidebar.platform')}</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/backoffice' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 768 && onClose()}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                ? 'bg-zinc-800 text-zinc-50'
                : 'hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
            >
              <Icon size={16} className={`shrink-0 ${isActive ? 'text-zinc-50' : 'text-zinc-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors group"
        >
          <LogOut size={16} />
          {t('backoffice_sidebar.logout')}
        </button>
      </div>
    </aside>
  );
}
