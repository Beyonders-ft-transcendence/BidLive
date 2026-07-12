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
    <aside className="w-64 h-screen bg-[#0f172a] text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800 shadow-2xl z-40 transition-all duration-300">
      <div className="h-16 flex items-center justify-center border-b border-slate-800/50 bg-[#0f172a]/80 backdrop-blur-md">
        <Link to="/backoffice" className="flex items-center gap-2 transition-transform hover:scale-105">
          <img src={Logo} alt="BidLive Admin" className="h-7 object-contain opacity-90" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-4 px-2">Gestão Plataforma</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/backoffice' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></span>
              )}
              <Icon size={18} className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Sair
        </button>
      </div>
    </aside>
  );
}
