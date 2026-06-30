import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User as UserIcon, Lock, Save, Camera } from "lucide-react";
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

interface SettingsTabProps {
  user: User;
}

export default function SettingsTab({ user }: SettingsTabProps) {
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
      toast.error("Por favor, selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
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
              toast.success("Foto de perfil carregada e atualizada com sucesso!");
            } else {
              toast.error(res.message || "Falha ao salvar a imagem no servidor.");
            }
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Ocorreu um erro ao atualizar a foto no servidor.");
          }
        } else {
          toast.success("Foto de perfil carregada com sucesso!");
        }
      } else {
        toast.error("Falha ao enviar imagem. Tente novamente.");
        setAvatarPreview(user.avatar_url || null);
      }
    } catch (err) {
      console.error("Erro no upload do avatar:", err);  
      toast.error("Ocorreu um erro ao enviar a imagem.");
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
        toast.success("Nenhuma alteração feita para salvar.");
        return;
      }

      const res = await rbacService.updateUser(user.id, payload);
      if (res.success && res.data) {
        updateUser(payload);
        toast.success("Os detalhes do seu perfil foram salvos!");
      } else {
        toast.error(res.message || "Falha ao atualizar perfil.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Ocorreu um erro ao atualizar os detalhes do perfil.");
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

      toast.success("Senha alterada com sucesso!");
      resetPasswordForm();
      setShowPasswordFields(false);
    } catch (err: any) {
      const msg = useAuthStore.getState().error || "Erro ao alterar a senha. Verifique a senha atual.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none text-foreground">
      {/* Header Info */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm text-left">
        <h2 className="text-xl font-black tracking-tight">Configurações de Conta</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Atualize seus dados pessoais, foto de perfil e senha de segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left Column: Avatar & Profile Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Foto do Perfil</span>
          
          <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
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
              <span className="text-[8px] font-bold text-white mt-1 uppercase">Mudar</span>
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
                <span key={idx} className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  {roleName || "USER"}
                </span>
              );
            }) || (
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
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
              Descartar Foto
            </button>
          )}
        </div>

        {/* Right Column: Forms */}
        <div className="space-y-6">
          {/* Personal Details Form */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
              <input type="hidden" {...registerProfile("avatar_url")} />
              
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <UserIcon className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-wider">Detalhes Pessoais</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Nome Completo</label>
                  <input
                    type="text"
                    {...registerProfile("full_name")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl bg-background text-foreground text-xs outline-none transition duration-150 ${
                      profileErrors.full_name
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Ex: João Silva"
                  />
                  {profileErrors.full_name && (
                    <p className="text-[10px] text-destructive font-semibold">{profileErrors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Endereço de E-mail</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3.5 py-2.5 border border-border bg-muted/50 text-muted-foreground rounded-xl text-xs outline-none cursor-not-allowed transition h-[38px]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Biografia</label>
                  <textarea
                    rows={4}
                    {...registerProfile("bio")}
                    placeholder="Escreva algo sobre você ou suas preferências de leilão..."
                    className={`w-full px-3.5 py-2.5 border rounded-xl bg-background text-foreground text-xs outline-none resize-none transition duration-150 ${
                      profileErrors.bio
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  />
                  {profileErrors.bio && (
                    <p className="text-[10px] text-destructive font-semibold">{profileErrors.bio.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-sm transition uppercase cursor-pointer disabled:opacity-50 border-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isProfileSubmitting ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>

          {/* Security / Password Form */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-wider">Segurança e Senha</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="text-[10px] font-extrabold text-primary hover:underline uppercase bg-transparent border-none cursor-pointer"
              >
                {showPasswordFields ? "Cancelar" : "Alterar Senha"}
              </button>
            </div>

            {showPasswordFields ? (
              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="mt-5 space-y-4 max-w-md text-left animate-in slide-in-from-top-3 duration-200"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Senha Atual</label>
                  <input
                    type="password"
                    {...registerPassword("current_password")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl bg-background text-foreground text-xs outline-none transition duration-150 ${
                      passwordErrors.current_password
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  />
                  {passwordErrors.current_password && (
                    <p className="text-[10px] text-destructive font-semibold">{passwordErrors.current_password.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Nova Senha</label>
                  <input
                    type="password"
                    {...registerPassword("new_password")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl bg-background text-foreground text-xs outline-none transition duration-150 ${
                      passwordErrors.new_password
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Mínimo de 8 caracteres"
                  />
                  {passwordErrors.new_password && (
                    <p className="text-[10px] text-destructive font-semibold">{passwordErrors.new_password.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    {...registerPassword("new_password_confirm")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl bg-background text-foreground text-xs outline-none transition duration-150 ${
                      passwordErrors.new_password_confirm
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  />
                  {passwordErrors.new_password_confirm && (
                    <p className="text-[10px] text-destructive font-semibold">{passwordErrors.new_password_confirm.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isPasswordSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 shadow-sm transition uppercase cursor-pointer disabled:opacity-50 border-none"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isPasswordSubmitting ? "Processando..." : "Atualizar Senha"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-3 text-left">
                Recomendamos alterar a sua senha periodicamente para manter a conta segura. Clique em "Alterar Senha" para atualizar.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
