import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { UserRole } from "@/shared/types/auth.types";
import SideDrawer from "../common/SideDrawer";
import { useTranslation } from "react-i18next";
import { 
  LogOut, 
  Gavel, 
  LayoutDashboard, 
  TrendingUp, 
  PlusCircle, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDrawer({ isOpen, onClose }: UserDrawerProps) {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate("/");
    } catch (err) {
      console.error(t('user_drawer.logout_error'), err);
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
      title: t('user_drawer.overview'),
      subtitle: t('user_drawer.overview_subtitle'),
      icon: <LayoutDashboard size={14} />,
      action: () => navigateToTab("overview")
    },
    {
      id: "my-auctions",
      title: t('user_drawer.my_auctions'),
      subtitle: t('user_drawer.my_auctions_subtitle'),
      icon: <Gavel size={14} />,
      action: () => navigateToTab("my-auctions")
    },
    {
      id: "my-bids",
      title: t('user_drawer.my_bids'),
      subtitle: t('user_drawer.my_bids_subtitle'),
      icon: <TrendingUp size={14} />,
      action: () => navigateToTab("my-bids")
    },
    {
      id: "create-auction",
      title: t('user_drawer.create_auction'),
      subtitle: t('user_drawer.create_auction_subtitle'),
      icon: <PlusCircle size={14} />,
      action: () => navigateToTab("create-auction")
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
          <span className="font-bold text-sm text-foreground uppercase tracking-wider">{t('user_drawer.my_account')}</span>
        </div>
      }
      footer={
        <div className="w-full text-center text-[9px] text-muted-foreground font-semibold uppercase tracking-wider py-1">
          BidLive v1.0 • {t('user_drawer.footer_version')}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 text-left items-start h-full">
        
        {/* LEFT COLUMN */}
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
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{t('user_drawer.account_level')}</span>
              <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-wider w-fit mt-0.5">
                {hasRole(UserRole.SUPER_ADMIN) ? t('user_drawer.role_admin') : hasRole(UserRole.MONITOR) ? t('user_drawer.role_moderator') : t('user_drawer.role_bidder')}
              </span>
            </div>

            {/* Email Contact info */}
            <div className="space-y-1 pt-3 border-t border-border/50 text-left">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">{t('user_drawer.email_label')}</span>
              <span className="text-xs text-foreground font-bold truncate block">{user.email}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 flex-1 min-w-0">
          
          {/* Identity */}
          <div className="text-left">
            <h3 className="text-lg font-black tracking-tight text-foreground">{user.full_name || user.username}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">@{user.username}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {isAdminOrMonitor ? (
              <button
                onClick={() => {
                  onClose();
                  navigate("/backoffice");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-sm shadow-sm transition uppercase cursor-pointer border-none"
              >
                {t('user_drawer.panel_admin')}
              </button>
            ) : (
              <button
                onClick={() => navigateToTab("overview")}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-sm shadow-sm transition uppercase cursor-pointer border-none"
              >
                {t('user_drawer.overview')}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold rounded-sm transition cursor-pointer"
            >
              <LogOut size={13} />
              {t('user_drawer.logout')}
            </button>
          </div>

          {/* Bio text */}
          <div className="text-left">
            <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-border pl-3">
              {user.bio || t('user_drawer.no_bio')}
            </p>
          </div>

          {/* Platform Navigation Options */}
          <div className="space-y-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block text-left">{t('user_drawer.quick_nav')}</span>
            
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
                      <h4 className="text-xs font-bold text-primary group-hover:underline">{t('user_drawer.panel_backoffice')}</h4>
                      <p className="text-[9px] text-primary/80 mt-0.5">{t('user_drawer.panel_backoffice_subtitle')}</p>
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
