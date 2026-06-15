"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { User as UserIcon, Lock, Save } from "lucide-react";
import type { User } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import rbacService from "@/services/rbac.service";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "@/schema/user.schema";

interface SettingsTabProps {
  user: User;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const changePassword = useAuthStore((s) => s.changePassword);

  const [showPasswordFields, setShowPasswordFields] = useState(false);

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
    }
  }, [user, setProfileValue]);

  // Handle Profile Update submit
  const onProfileSubmit = async (data: UpdateProfileInput) => {
    try {
      const res = await rbacService.updateUser(user.id, {
        full_name: data.full_name,
        avatar_url: data.avatar_url || "",
        bio: data.bio || "",
      });
      if (res.success && res.data) {
        await fetchMe();
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Configurações do Perfil</h2>
        <p className="text-xs text-gray-400 mt-1 font-normal">
          Gerencie suas credenciais, nome público e informações de segurança.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
        {/* Information update form */}
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
          <h3 className="text-xs font-black text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
            <UserIcon className="w-4 h-4 text-primary animate-pulse" />
            Detalhes Pessoais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Nome Completo</label>
              <input
                type="text"
                {...registerProfile("full_name")}
                className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                  profileErrors.full_name
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-gray-200 focus:ring-1 focus:ring-primary"
                }`}
              />
              {profileErrors.full_name && (
                <p className="text-[10px] text-red-500 font-semibold">{profileErrors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Endereço de E-mail</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-100 bg-gray-50 text-gray-400 rounded-sm text-xs outline-none cursor-not-allowed transition"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">URL do Avatar</label>
              <input
                type="text"
                {...registerProfile("avatar_url")}
                placeholder="https://exemplo.com/avatar.jpg"
                className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                  profileErrors.avatar_url
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-gray-200 focus:ring-1 focus:ring-primary"
                }`}
              />
              {profileErrors.avatar_url && (
                <p className="text-[10px] text-red-500 font-semibold">{profileErrors.avatar_url.message}</p>
              )}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Biografia</label>
              <textarea
                rows={3}
                {...registerProfile("bio")}
                placeholder="Fale um pouco sobre si..."
                className={`w-full px-3 py-2 border rounded-sm text-xs outline-none resize-none transition ${
                  profileErrors.bio
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-gray-200 focus:ring-1 focus:ring-primary"
                }`}
              />
              {profileErrors.bio && (
                <p className="text-[10px] text-red-500 font-semibold">{profileErrors.bio.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isProfileSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-sm hover:bg-primary/95 shadow-sm transition uppercase cursor-pointer disabled:opacity-50 animate-fade-in"
            >
              <Save className="w-3.5 h-3.5" />
              {isProfileSubmitting ? "Salvando..." : "Salvar Detalhes"}
            </button>
          </div>
        </form>

        {/* Password update switcher */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="text-xs font-extrabold text-primary hover:text-primary-light uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            {showPasswordFields ? "Esconder Modificar Senha" : "Alterar Senha de Acesso"}
          </button>

          {showPasswordFields && (
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="mt-5 space-y-4 max-w-md animate-in slide-in-from-top-2 duration-250 text-left"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Senha Atual</label>
                <input
                  type="password"
                  {...registerPassword("current_password")}
                  className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                    passwordErrors.current_password
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-200 focus:ring-1 focus:ring-primary"
                  }`}
                />
                {passwordErrors.current_password && (
                  <p className="text-[10px] text-red-500 font-semibold">{passwordErrors.current_password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nova Senha</label>
                <input
                  type="password"
                  {...registerPassword("new_password")}
                  className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                    passwordErrors.new_password
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-200 focus:ring-1 focus:ring-primary"
                  }`}
                  placeholder="Mínimo de 8 caracteres"
                />
                {passwordErrors.new_password && (
                  <p className="text-[10px] text-red-500 font-semibold">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Confirmar Nova Senha</label>
                <input
                  type="password"
                  {...registerPassword("new_password_confirm")}
                  className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                    passwordErrors.new_password_confirm
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-200 focus:ring-1 focus:ring-primary"
                  }`}
                />
                {passwordErrors.new_password_confirm && (
                  <p className="text-[10px] text-red-500 font-semibold">{passwordErrors.new_password_confirm.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0C1B33] text-white text-xs font-bold rounded-sm hover:bg-slate-900 shadow-sm transition uppercase cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isPasswordSubmitting ? "Processando..." : "Atualizar Senha"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
