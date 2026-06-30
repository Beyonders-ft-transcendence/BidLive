import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { UserRole } from "@/shared/types/auth.types";
import SideDrawer from "../common/SideDrawer";
import { 
  LogOut, 
  Gavel, 
  LayoutDashboard, 
  TrendingUp, 
  PlusCircle, 
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Users,
  ShieldAlert
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

  const navItems = [
    {
      id: "overview",
      title: "Visão Geral",
      subtitle: "Centro de comando e perfil",
      icon: <LayoutDashboard size={14} />,
      action: () => navigateToTab("overview")
    },
    {
      id: "my-auctions",
      title: "Meus Leilões",
      subtitle: "Gerir lotes criados e rascunhos",
      icon: <Gavel size={14} />,
      action: () => navigateToTab("my-auctions")
    },
    {
      id: "my-bids",
      title: "Meus Lances",
      subtitle: "Histórico de lances e lotes ganhos",
      icon: <TrendingUp size={14} />,
      action: () => navigateToTab("my-bids")
    },
    {
      id: "create-auction",
      title: "Criar Novo Leilão",
      subtitle: "Cadastrar um novo item para venda",
      icon: <PlusCircle size={14} />,
      action: () => navigateToTab("create-auction")
    },
    {
      id: "chat",
      title: "Mensagens",
      subtitle: "Conversar com vendedores/compradores",
      icon: <MessageSquare size={14} />,
      action: () => navigateToTab("chat")
    },
    {
      id: "friends",
      title: "Rede de Amigos",
      subtitle: "Gerir amizades e ligações",
      icon: <Users size={14} />,
      action: () => navigateToTab("friends")
    },
    {
      id: "reports",
      title: "Minhas Denúncias",
      subtitle: "Acompanhar estado das denúncias",
      icon: <ShieldAlert size={14} />,
      action: () => navigateToTab("reports")
    }
  ];

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <span className="font-bold text-sm text-foreground uppercase tracking-wider">Minha Conta</span>
        </div>
      }
      footer={
        <div className="w-full text-center text-[9px] text-muted-foreground font-semibold uppercase tracking-wider py-1">
          BidLive v1.0 • Plataforma de Leilões Ao Vivo
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 text-left items-start h-full">
        
        {/* LEFT COLUMN: Profile Details Card (Inspired by mockup left column) */}
        <div className="space-y-5 w-full shrink-0">
          <div className="w-full aspect-[4/5] bg-muted border border-border rounded-sm overflow-hidden relative group shadow-sm">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-4xl uppercase select-none">
                {user.full_name?.slice(0, 2).toUpperCase() || user.username?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-1">
            {/* Account Role */}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Nível de Conta</span>
              <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-wider w-fit mt-0.5">
                {hasRole(UserRole.SUPER_ADMIN) ? "Administrador" : hasRole(UserRole.MONITOR) ? "Moderador" : "Licitante"}
              </span>
            </div>

            {/* Email Contact info */}
            <div className="space-y-1 pt-3 border-t border-border/50 text-left">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Endereço de Email</span>
              <span className="text-xs text-foreground font-bold truncate block">{user.email}</span>
            </div>

            {/* Platform stats */}
            <div className="space-y-1.5 pt-3 border-t border-border/50 text-left">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Redes Sociais</span>
              <div className="flex gap-1.5">
                {["ln", "tw", "ig"].map((soc) => (
                  <span
                    key={soc}
                    className="w-6 h-6 rounded-sm bg-muted/60 border border-border/60 hover:border-primary hover:text-primary transition flex items-center justify-center text-[10px] font-bold text-muted-foreground cursor-pointer uppercase"
                  >
                    {soc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Identity, Description & Action/Navigation List (Inspired by mockup right column) */}
        <div className="space-y-6 flex-1 min-w-0">
          
          {/* Identity */}
          <div className="text-left">
            <h3 className="text-lg font-black tracking-tight text-foreground">{user.full_name || user.username}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">@{user.username}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigateToTab("overview")}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-sm shadow-sm transition uppercase cursor-pointer border-none"
            >
              Visão Geral
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold rounded-sm transition cursor-pointer"
            >
              <LogOut size={13} />
              Terminar Sessão
            </button>
          </div>

          {/* Bio text */}
          <div className="text-left">
            <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-border pl-3">
              {user.bio || "Este usuário não preencheu uma biografia na sua conta do BidLive."}
            </p>
          </div>

          {/* Platform Navigation Options (JobHuntly Experience List Style) */}
          <div className="space-y-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block text-left">Navegação Rápida</span>
            
            <div className="space-y-2">
              {isAdminOrMonitor && (
                <button
                  onClick={() => { onClose(); navigate("/backoffice/dashboard"); }}
                  className="w-full flex items-center justify-between p-3 bg-primary/5 border border-primary/15 hover:bg-primary/10 rounded-sm transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-primary group-hover:underline">Painel Backoffice</h4>
                      <p className="text-[9px] text-primary/80 mt-0.5">Administração global do portal</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-primary/70 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 bg-muted/20 border border-border/40 hover:bg-muted/40 hover:border-border rounded-sm transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-background border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/20 shrink-0 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </SideDrawer>
  );
}
