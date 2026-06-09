"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, Lock, Save, CheckCircle2, AlertCircle } from "lucide-react";
import type { User } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import rbacService from "@/services/rbac.service";

interface SettingsTabProps {
  user: User;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const changePassword = useAuthStore((s) => s.changePassword);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
    }
  }, [user]);

  // Handle Edit/Update Profile Details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    try {
      const res = await rbacService.updateUser(user.id, {
        full_name: fullName,
      });
      if (res.success && res.data) {
        await fetchMe();
        setProfileSuccess("Os detalhes do seu perfil foram salvos!");
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError(res.message || "Falha ao atualizar perfil.");
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || "Ocorreu um erro ao atualizar os detalhes do perfil.");
    }
  };

  // Handle Change Password Form
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPasswordError("Todos os campos de senha são obrigatórios.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordError("A nova senha e a confirmação de senha não coincidem.");
      return;
    }

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });

      setPasswordSuccess("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err: any) {
      const msg = useAuthStore.getState().error || "Erro ao alterar a senha. Verifique a senha atual.";
      setPasswordError(msg);
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
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <h3 className="text-xs font-black text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
            <UserIcon className="w-4 h-4 text-primary animate-pulse" />
            Detalhes Pessoais
          </h3>

          {profileSuccess && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-xs p-3 rounded-sm flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-sm flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                required
              />
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
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-sm hover:bg-primary/95 shadow-sm transition uppercase cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Detalhes
            </button>
          </div>
        </form>

        {/* Password update switcher */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="text-xs font-extrabold text-primary hover:text-primary-light uppercase tracking-wider flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {showPasswordFields ? "Esconder Modificar Senha" : "Alterar Senha de Acesso"}
          </button>

          {showPasswordFields && (
            <form
              onSubmit={handleChangePassword}
              className="mt-5 space-y-4 max-w-md animate-in slide-in-from-top-2 duration-250 text-left"
            >
              {passwordSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-700 text-xs p-3 rounded-sm flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-sm flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Senha Atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                  placeholder="Mínimo de 8 caracteres"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0C1B33] text-white text-xs font-bold rounded-sm hover:bg-slate-900 shadow-sm transition uppercase cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Atualizar Senha
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
