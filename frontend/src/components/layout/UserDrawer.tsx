import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { UserRole } from "@/shared/types/auth.types";
import SideDrawer from "../common/SideDrawer";
import Avatar from "../common/Avatar";
import { 
  LogOut, 
  Gavel, 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  PlusCircle, 
  MessageSquare,
  ShieldCheck
} from "lucide-react";

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDrawer({ isOpen, onClose }: UserDrawerProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate("/");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  const navigateToTab = (tab: string) => {
    onClose();
    navigate(`/user?tab=${tab}`);
  };

  if (!user) return null;

  const hasRole = (roleName: string) => {
    if (!user.roles) return false;
    return user.roles.some((r: any) => {
      if (typeof r === "string") return r === roleName;
      if (typeof r === "object" && r !== null) return r.name === roleName;
      return false;
    });
  };

  const isAdminOrMonitor = hasRole(UserRole.SUPER_ADMIN) || hasRole(UserRole.MONITOR);

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <span className="font-bold text-sm text-foreground uppercase tracking-wider">Minha Conta</span>
        </div>
      }
      footer={
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-sm rounded-sm transition-colors cursor-pointer border-none"
        >
          <LogOut size={16} />
          Sair da Conta
        </button>
      }
    >
      {/* User Info Brief */}
      <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-md border border-border">
        <Avatar name={user.full_name || user.username} src={user.avatar_url} size="lg" />
        <div className="flex flex-col text-left min-w-0">
          <span className="text-sm font-bold text-foreground truncate leading-tight">
            {user.full_name || user.username}
          </span>
          <span className="text-xs text-muted-foreground truncate mt-0.5">
            {user.email}
          </span>
          <span className="inline-block w-fit px-1.5 py-0.5 rounded-[4px] bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-wider mt-1.5">
            {hasRole(UserRole.SUPER_ADMIN) ? "Administrador" : hasRole(UserRole.MONITOR) ? "Moderador" : "Licitante"}
          </span>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 px-1">Plataforma</span>

        {isAdminOrMonitor && (
          <button
            onClick={() => { onClose(); navigate("/backoffice/dashboard"); }}
            className="flex items-center gap-3.5 px-4 py-3 rounded-md text-xs font-bold transition-all duration-200 text-left bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 cursor-pointer"
          >
            <ShieldCheck size={16} />
            <span>Painel do Backoffice</span>
          </button>
        )}

        <button
          onClick={() => navigateToTab("overview")}
          className="flex items-center gap-3.5 px-4 py-3 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 text-left cursor-pointer border-none bg-transparent"
        >
          <LayoutDashboard size={16} className="text-muted-foreground/75" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => navigateToTab("my-auctions")}
          className="flex items-center gap-3.5 px-4 py-3 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 text-left cursor-pointer border-none bg-transparent"
        >
          <Gavel size={16} className="text-muted-foreground/75" />
          <span>Meus Leilões</span>
        </button>

        <button
          onClick={() => navigateToTab("create-auction")}
          className="flex items-center gap-3.5 px-4 py-3 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 text-left cursor-pointer border-none bg-transparent"
        >
          <PlusCircle size={16} className="text-muted-foreground/75" />
          <span>Criar Leilão</span>
        </button>

        <button
          onClick={() => navigateToTab("my-bids")}
          className="flex items-center gap-3.5 px-4 py-3 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 text-left cursor-pointer border-none bg-transparent"
        >
          <TrendingUp size={16} className="text-muted-foreground/75" />
          <span>Meus Lances</span>
        </button>

        <button
          onClick={() => navigateToTab("chat")}
          className="flex items-center gap-3.5 px-4 py-3 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 text-left cursor-pointer border-none bg-transparent"
        >
          <MessageSquare size={16} className="text-muted-foreground/75" />
          <span>Mensagens</span>
        </button>

        <button
          onClick={() => navigateToTab("settings")}
          className="flex items-center gap-3.5 px-4 py-3 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 text-left cursor-pointer border-none bg-transparent"
        >
          <Settings size={16} className="text-muted-foreground/75" />
          <span>Configurações do Perfil</span>
        </button>
      </div>
    </SideDrawer>
  );
}
