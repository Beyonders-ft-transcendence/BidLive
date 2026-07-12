import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Gavel,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import Logo from "@/assets/images/logo2.png"; // Assuming logo2 is the dark theme / light text logo

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/backoffice', icon: LayoutDashboard },
    { name: 'Domínios', path: '/backoffice/domains', icon: Globe },
    { name: 'Utilizadores', path: '/backoffice/users', icon: Users },
    { name: 'Denúncias', path: '/backoffice/reports', icon: ShieldAlert },
    { name: 'Leilões (Admin)', path: '/backoffice/auctions', icon: Gavel },
    { name: 'Perfis & Acessos', path: '/backoffice/roles', icon: ShieldCheck },
    { name: 'Configurações', path: '/backoffice/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-black text-zinc-400 flex flex-col fixed left-0 top-0 border-r border-zinc-800 z-40">
      <div className="h-16 flex items-center justify-center border-b border-zinc-800">
        <Link to="/backoffice" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={Logo} alt="BidLive Admin" className="h-6 object-contain" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase mb-3 px-3">Plataforma</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/backoffice' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
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
          Sair
        </button>
      </div>
    </aside>
  );
}
