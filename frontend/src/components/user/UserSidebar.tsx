import { LogOut, Gavel, LayoutDashboard, TrendingUp,
  PlusCircle, MessageSquare, Heart, Radio, UserCog, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { User } from "@/shared/types/auth.types";

interface UserSidebarProps {
  activeTab: "overview" | "profile" | "my-auctions" | "my-bids" | "create-auction" | "chat" | "friends" | "auction-detail" | "favorites" | "live-stream" | "reports";
  setActiveTab: (tab: "overview" | "profile" | "my-auctions" | "my-bids" | "create-auction" | "chat" | "friends" | "auction-detail" | "favorites" | "live-stream" | "reports") => void;
  user: User;
  onLogout: () => void;
}

export default function UserSidebar({
  activeTab,
  setActiveTab,
  onLogout,
}: UserSidebarProps) {
  const { t } = useTranslation();

  const sidebarItems = [
    { id: "overview", label: t('user_dashboard.overview'), icon: <LayoutDashboard size={16} /> },
    { id: "profile", label: t('user_dashboard.profile'), icon: <UserCog size={16} /> },
    { id: "my-auctions", label: t('user_dashboard.my_auctions'), icon: <Gavel size={16} /> },
    { id: "create-auction", label: t('user_dashboard.create_auction'), icon: <PlusCircle size={16} /> },
    { id: "my-bids", label: t('user_dashboard.my_bids'), icon: <TrendingUp size={16} /> },
    { id: "favorites", label: t('user_dashboard.favorites'), icon: <Heart size={16} /> },
    { id: "live-stream", label: t('user_dashboard.live_stream'), icon: <Radio size={16} /> },
    { id: "friends", label: t('user_dashboard.friends'), icon: <Users size={16} /> },
    { id: "chat", label: t('user_dashboard.chat'), icon: <MessageSquare size={16} /> },
  ] as const;

  return (
    <aside className="sticky top-24 self-start hidden md:flex w-64 shrink-0 flex-col gap-6 select-none bg-card border border-border rounded-sm p-5 shadow-sm text-foreground transition-all duration-300">

      {/* Navigation menu list */}
      <nav className="flex flex-col gap-1 w-full">
        {sidebarItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-sm text-xs transition-all duration-200 cursor-pointer text-left border-none w-full ${
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
        className="flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full cursor-pointer focus:outline-none bg-transparent border-none"
      >
        <LogOut size={14} />
        Terminar Sessão
      </button>
    </aside>
  );
}
