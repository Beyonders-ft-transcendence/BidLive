import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Gavel, TrendingUp, FileText, CheckCircle2, PlusCircle, User as UserIcon, Lock, Save, Camera } from "lucide-react";
import StatsGrid from "@/components/common/StatsGrid";
import type { Auction } from "@/shared/types/auction.types";
import type { User } from "@/shared/types/auth.types";
import { useAuthStore } from "@/shared/stores/auth.store";
import rbacService from "@/services/rbac.service";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "@/shared/schema/user.schema";
import { uploadImageToCloudinary } from "@/shared/utils/cloudinary.utils";
import { formatCurrency, auctionStatusColor, getAuctionStatusLabel } from "@/shared/utils/auction.utils";


interface OverviewTabProps {
  user: User;
  metrics: {
    totalCreated: number;
    activeCreated: number;
    wonCount: number;
    participatingCount: number;
  };
  loadingAuctions: boolean;
  myAuctions: Auction[];
  loadingAll: boolean;
  allAuctions: Auction[];
  onCreateNewClick: () => void;
  onViewAllAuctionsClick: () => void;
  onViewAllBidsClick: () => void;
}

export default function OverviewTab({
  user,
  metrics,
  loadingAuctions,
  myAuctions,
  loadingAll,
  allAuctions,
  onCreateNewClick,
  onViewAllAuctionsClick,
  onViewAllBidsClick,
}: OverviewTabProps) {
  const { t } = useTranslation();

  const updateUser = useAuthStore((s) => s.updateUser);
  const changePassword = useAuthStore((s) => s.changePassword);

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile Form Hook
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: "",
      avatar_url: "",
      bio: "",
    },
  });

  // Password Form Hook
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirm: "",
    },
  });

  // Set default profile name, avatar and bio
  useEffect(() => {
    if (user) {
      setProfileValue("full_name", user.full_name || "");
      setProfileValue("avatar_url", user.avatar_url || "");
      setProfileValue("bio", user.bio || "");
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user, setProfileValue]);

  // Handle file selection and Cloudinary upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t('overview_tab.toast_select_image'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('overview_tab.toast_image_max_size'));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploadingAvatar(true);

    try {
      const uploadedUrl = await uploadImageToCloudinary(file);
      if (uploadedUrl) {
        setProfileValue("avatar_url", uploadedUrl);
        setAvatarPreview(uploadedUrl);
        
        if (user?.id) {
          try {
            const res = await rbacService.updateUser(user.id, { avatar_url: uploadedUrl });
            if (res.success) {
              updateUser({ avatar_url: uploadedUrl });
              toast.success(t('overview_tab.toast_avatar_updated'));
            } else {
              toast.error(res.message || t('overview_tab.toast_avatar_save_fail'));
            }
          } catch (err: any) {
            toast.error(err?.response?.data?.message || t('overview_tab.toast_avatar_update_error'));
          }
        } else {
          toast.success(t('overview_tab.toast_avatar_uploaded'));
        }
      } else {
        toast.error(t('overview_tab.toast_upload_fail'));
        setAvatarPreview(user.avatar_url || null);
      }
    } catch (err) {
      console.error("Erro no upload do avatar:", err);  
      toast.error(t('overview_tab.toast_upload_error'));
      setAvatarPreview(user.avatar_url || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Profile Update submit
  const onProfileSubmit = async (data: UpdateProfileInput) => {
    try {
      const payload: any = {};
      
      if (data.full_name !== user.full_name) {
        payload.full_name = data.full_name;
      }
      if (data.avatar_url && data.avatar_url !== user.avatar_url) {
        payload.avatar_url = data.avatar_url;
      }
      if (data.bio !== user.bio && (data.bio !== "" || user.bio)) {
        payload.bio = data.bio || "";
      }

      if (Object.keys(payload).length === 0) {
        toast.success(t('overview_tab.toast_no_changes'));
        return;
      }

      const res = await rbacService.updateUser(user.id, payload);
      if (res.success && res.data) {
        updateUser(payload);
        toast.success(t('overview_tab.toast_profile_saved'));
      } else {
        toast.error(res.message || t('overview_tab.toast_profile_update_fail'));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('overview_tab.toast_profile_update_error'));
    }
  };

  // Handle Change Password submit
  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm,
      });

      toast.success(t('overview_tab.toast_password_changed'));
      resetPasswordForm();
      setShowPasswordFields(false);
    } catch (err: any) {
      const msg = useAuthStore.getState().error || t('overview_tab.toast_password_error');
      toast.error(msg);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start animate-in fade-in slide-in-from-bottom-3 duration-300 select-none text-foreground w-full">
      
      {/* LEFT COLUMN: PERFIL & SETTINGS FORM (Inspired by JobHuntly Applicant Details left column) */}
      <div className="space-y-6 w-full shrink-0">
        
        {/* Profile Card & Avatar Upload */}
        <div className="bg-card border border-border rounded-sm p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('overview_tab.profile_photo')}</span>
          
          <div className="relative group w-24 h-24 rounded-full overflow-hidden border border-primary/20 shadow-sm">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl uppercase">
                {user.full_name?.slice(0, 2).toUpperCase() || user.username?.slice(0, 2).toUpperCase()}
              </div>
            )}
            
            {/* Upload Overlay */}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300">
              <Camera className="w-5 h-5 text-white" />
              <span className="text-[8px] font-bold text-white mt-1 uppercase">{t('overview_tab.change_photo')}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>

            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="space-y-1 w-full min-w-0">
            <h4 className="text-xs font-black truncate">{user.full_name || user.username}</h4>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 w-full">
            {user.roles?.map((role: any, idx: number) => {
              const roleName = typeof role === "object" && role !== null ? role.name : role;
              return (
                <span key={idx} className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider">
                  {roleName || "USER"}
                </span>
              );
            }) || (
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider">
                USER
              </span>
            )}
          </div>

          {avatarPreview && avatarPreview !== user.avatar_url && (
            <button
              type="button"
              onClick={() => {
                setAvatarPreview(user.avatar_url || null);
                setProfileValue("avatar_url", user.avatar_url || "");
              }}
              className="text-[10px] font-bold text-destructive hover:underline bg-transparent border-none cursor-pointer uppercase tracking-wider"
            >
              {t('overview_tab.discard_photo')}
            </button>
          )}
        </div>

        {/* Edit Info Form */}
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm text-left">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <input type="hidden" {...registerProfile("avatar_url")} />
            
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <UserIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">{t('overview_tab.personal_data')}</span>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">{t('overview_tab.full_name')}</label>
                <input
                  type="text"
                  {...registerProfile("full_name")}
                  className={`w-full px-3 py-2 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                    profileErrors.full_name
                      ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                      : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                  placeholder="Ex: João Silva"
                />
                {profileErrors.full_name && (
                  <p className="text-[9px] text-destructive font-semibold">{profileErrors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">{t('overview_tab.bio')}</label>
                <textarea
                  rows={3}
                  {...registerProfile("bio")}
                  placeholder={t('overview_tab.bio_placeholder')}
                  className={`w-full px-3 py-2 border rounded-sm bg-background text-foreground text-xs outline-none resize-none transition duration-150 ${
                    profileErrors.bio
                      ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                      : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                />
                {profileErrors.bio && (
                  <p className="text-[9px] text-destructive font-semibold">{profileErrors.bio.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-sm shadow-sm transition uppercase cursor-pointer disabled:opacity-50 border-none"
              >
                <Save className="w-3.5 h-3.5" />
                {isProfileSubmitting ? "Salvando..." : "Salvar Perfil"}
              </button>
            </div>
          </form>
        </div>

        {/* Security / Password Form */}
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm text-left">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">{t('overview_tab.change_password')}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowPasswordFields(!showPasswordFields);
                if (showPasswordFields) resetPasswordForm();
              }}
              className="text-[9px] font-extrabold text-primary hover:underline uppercase bg-transparent border-none cursor-pointer"
            >
              {showPasswordFields ? t('overview_tab.close') : t('overview_tab.change')}
            </button>
          </div>

          {showPasswordFields ? (
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="mt-4 space-y-3.5 animate-in slide-in-from-top-3 duration-200"
            >
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">{t('overview_tab.current_password')}</label>
                <input
                  type="password"
                  {...registerPassword("current_password")}
                  className={`w-full px-3 py-2 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                    passwordErrors.current_password
                      ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                      : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                />
                {passwordErrors.current_password && (
                  <p className="text-[9px] text-destructive font-semibold">{passwordErrors.current_password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">{t('overview_tab.new_password')}</label>
                <input
                  type="password"
                  {...registerPassword("new_password")}
                  className={`w-full px-3 py-2 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                    passwordErrors.new_password
                      ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                      : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                  placeholder={t('overview_tab.min_chars')}
                />
                {passwordErrors.new_password && (
                  <p className="text-[9px] text-destructive font-semibold">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">{t('overview_tab.confirm_password')}</label>
                <input
                  type="password"
                  {...registerPassword("new_password_confirm")}
                  className={`w-full px-3 py-2 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                    passwordErrors.new_password_confirm
                      ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                      : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                />
                {passwordErrors.new_password_confirm && (
                  <p className="text-[9px] text-destructive font-semibold">{passwordErrors.new_password_confirm.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-sm shadow-sm transition uppercase cursor-pointer disabled:opacity-50 border-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isPasswordSubmitting ? t('overview_tab.saving') : t('overview_tab.change_password')}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
              {t('overview_tab.security')}
            </p>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: ACTIVITY & DASHBOARD (Inspired by JobHuntly tab contents pane) */}
      <div className="space-y-6 min-w-0 flex-1">
        
        {/* Welcome header card */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/15 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-black tracking-tight truncate">{t('overview_tab.welcome', { name: user.full_name || user.username })}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-normal leading-relaxed">{t('overview_tab.welcome_desc')}</p>
          </div>
          <button
            onClick={onCreateNewClick}
            className="flex items-center justify-center shrink-0 gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-lg shadow-md shadow-primary/20 transition uppercase cursor-pointer border-none whitespace-nowrap w-full md:w-auto"
          >
            <PlusCircle size={16} />
            {t('overview_tab.create_first')}
          </button>
        </div>

        {/* Stats Grid */}
        <StatsGrid
          items={[
            { label: t('overview_tab.created_auctions'), value: metrics.totalCreated, icon: <Gavel size={16} /> },
            { label: t('overview_tab.active_auctions'), value: metrics.activeCreated, icon: <TrendingUp size={16} /> },
            { label: t('overview_tab.participating_auctions'), value: metrics.participatingCount, icon: <FileText size={16} /> },
            { label: t('overview_tab.won_auctions'), value: metrics.wonCount, icon: <CheckCircle2 size={16} /> },
          ]}
          columns={4}
        />

        {/* Recent Created Auctions (Full Width) */}
        <div className="bg-card border border-border rounded-sm p-5 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2.5">
            <span className="text-xs font-black uppercase tracking-wider">{t('overview_tab.recent_auctions')}</span>
            <button
              onClick={onViewAllAuctionsClick}
              className="text-[10px] font-bold text-primary hover:underline uppercase bg-transparent border-none cursor-pointer"
            >
              {t('overview_tab.view_all')}
            </button>
          </div>

          <div className="space-y-3">
            {loadingAuctions ? (
              <p className="text-center text-xs text-muted-foreground py-8">{t('overview_tab.loading')}</p>
            ) : myAuctions.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">{t('overview_tab.no_auctions')}</p>
            ) : (
              myAuctions.slice(0, 4).map((auc) => (
                <div
                  key={auc.id}
                  className="flex justify-between items-center p-3.5 bg-muted/30 hover:bg-muted/50 rounded-sm transition-colors border border-border/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-sm bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                      <Gavel size={12} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate leading-snug">
                        {auc.item?.title}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                        {auc.item?.category_label || t('my_auctions_tab.no_category')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-primary font-mono">
                      {formatCurrency(auc.item?.current_price || 0, true)}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-sm text-[7px] font-bold uppercase mt-1 ${auctionStatusColor(
                        auc.status
                      )}`}
                    >
                      {getAuctionStatusLabel(auc.status, t)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bidding Summary Panel (Full Width) */}
        <div className="bg-card border border-border rounded-sm p-5 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2.5">
            <span className="text-xs font-black uppercase tracking-wider">{t('overview_tab.bidding_history')}</span>
            <button
              onClick={onViewAllBidsClick}
              className="text-[10px] font-bold text-primary hover:underline uppercase bg-transparent border-none cursor-pointer"
            >
              {t('overview_tab.view_all')}
            </button>
          </div>

          <div className="space-y-3">
            {loadingAll ? (
              <p className="text-center text-xs text-muted-foreground py-8">{t('overview_tab.loading')}</p>
            ) : allAuctions.filter((a) => a.winner === user.id).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <TrendingUp size={24} className="opacity-40 animate-pulse mb-2" />
                <p className="text-xs">{t('overview_tab.no_bids')}</p>
              </div>
            ) : (
              allAuctions
                .filter((a) => a.winner === user.id)
                .slice(0, 4)
                .map((auc) => (
                  <div
                    key={auc.id}
                    className="flex justify-between items-center p-3.5 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-sm transition-colors border border-emerald-500/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shrink-0">
                        <CheckCircle2 size={12} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate leading-snug">
                          {auc.item?.title}
                        </span>
                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                          {t('overview_tab.winner_label')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-emerald-600 font-mono">
                        {formatCurrency(auc.item?.current_price || 0, true)}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[7px] font-bold uppercase rounded-sm mt-1">
                        {t('overview_tab.won_label')}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
