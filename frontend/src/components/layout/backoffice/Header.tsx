import { useLocation } from 'react-router-dom';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import Avatar from '@/components/common/Avatar';

export default function Header() {
  const location = useLocation();
  const { user } = useAuthStore();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/backoffice') return 'Dashboard';
    if (path.includes('/users')) return 'Gestão de Utilizadores';
    if (path.includes('/roles')) return 'Perfis e Permissões';
    if (path.includes('/auctions')) return 'Leilões Ativos';
    return 'Administração';
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30 flex items-center justify-between px-6 transition-all duration-300">
      
      {/* Breadcrumbs / Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground font-medium">BidLive Admin</span>
        <ChevronRight size={14} className="text-muted-foreground/50" />
        <span className="font-bold text-foreground">{getPageTitle()}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        
        {/* Simple Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Pesquisa global..." 
            className="pl-9 pr-4 py-1.5 text-xs bg-muted/50 border border-border rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all w-48 focus:w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </button>

        <div className="w-px h-6 bg-border mx-1"></div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-xs">
            <span className="font-bold text-foreground leading-tight">{user?.full_name || 'Super Admin'}</span>
            <span className="text-primary font-medium">
              {typeof user?.roles?.[0] === 'object' ? (user.roles[0] as any).name : user?.roles?.[0] || 'Administrador'}
            </span>
          </div>
          <div className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background rounded-full">
            <Avatar name={user?.full_name || 'Admin'} src={user?.avatar_url} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
