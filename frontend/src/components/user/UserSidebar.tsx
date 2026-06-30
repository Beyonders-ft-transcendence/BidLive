import { LogOut, Gavel, LayoutDashboard, TrendingUp, PlusCircle, MessageSquare } from "lucide-react";
import type { User } from "@/shared/types/auth.types";
import Avatar from "@/components/common/Avatar";

interface UserSidebarProps {
  activeTab: "overview" | "my-auctions" | "my-bids" | "create-auction" | "chat";
  setActiveTab: (tab: "overview" | "my-auctions" | "my-bids" | "create-auction" | "chat") => void;
  user: User;
  onLogout: () => void;
}

export default function UserSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}: UserSidebarProps) {
  const sidebarItems = [
    { id: "overview", label: "Visão Geral", icon: <LayoutDashboard size={16} /> },
    { id: "my-auctions", label: "Meus Leilões", icon: <Gavel size={16} /> },
    { id: "create-auction", label: "Criar Leilão", icon: <PlusCircle size={16} /> },
    { id: "my-bids", label: "Meus Lances", icon: <TrendingUp size={16} /> },
    { id: "chat", label: "Mensagens", icon: <MessageSquare size={16} /> },
  ] as const;

  return (
    <aside className="sticky top-24 self-start hidden md:flex w-64 shrink-0 flex-col gap-6 select-none bg-card border border-border rounded-2xl p-5 shadow-sm text-foreground transition-all duration-300">
      {/* Profile summary header */}
      <div className="flex flex-col items-center text-center px-1 py-3">
        <div className="relative group cursor-pointer">
          <Avatar name={user.full_name || user.username} src={user.avatar_url} size="lg" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 scale-110 group-hover:scale-125 transition duration-300"></div>
        </div>
        
        <h3 className="text-xs font-black text-foreground mt-4 truncate max-w-full leading-tight">
          {user.full_name || user.username}
        </h3>
        <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-full mt-1">
          {user.email}
        </span>
        
        <span className="inline-block bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-3">
          {typeof user.roles?.[0] === "object" && user.roles[0] !== null
            ? (user.roles[0] as any).name || "USER"
            : (user.roles?.[0] as any) || "USER"}
        </span>
      </div>

      <hr className="border-border w-full m-0" />

      {/* Navigation menu list */}
      <nav className="flex flex-col gap-1 w-full">
        {sidebarItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer text-left border-none w-full ${
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25 scale-[1.01]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-semibold"
              }`}
            >
              <span className={isActive ? "text-primary-foreground" : "text-muted-foreground/70"}>
                {item.icon}
              </span>
              <span className="truncate tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <hr className="border-border w-full m-0" />

      {/* Logout action */}
      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full cursor-pointer focus:outline-none bg-transparent border-none"
      >
        <LogOut size={14} />
        Terminar Sessão
      </button>
    </aside>
  );
}
