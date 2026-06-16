"use client";

import { useState, useEffect } from "react";
import ActionCard from "@/components/common/ActionCard";
import { useAuthStore } from "@/store/auth.store";
import { useUpdateUserMutation } from "@/hooks/useRbac";
import {
  User as UserIcon,
  Lock,
  Bell,
  Globe,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const changePassword = useAuthStore((s) => s.changePassword);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const updateProfileMutation = useUpdateUserMutation();

  const [activeTab, setActiveTab] = useState<"profile" | "platform">("profile");
  
  // Password fields
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Feedback messages
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    if (!user) return;

    try {
      const res = await updateProfileMutation.mutateAsync({
        id: user.id,
        payload: {
          full_name: fullName,
        },
      });
      if (res.success && res.data) {
        await fetchMe();
        setProfileSuccess("Perfil atualizado com sucesso!");
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError(res.message || "Erro ao atualizar o perfil.");
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || "Ocorreu um erro ao atualizar o perfil.");
    }
  };

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
      const msg = useAuthStore.getState().error || "Erro ao alterar a senha. Verifique se a senha atual está correta.";
      setPasswordError(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full select-none">
      <ActionCard
        title="Configurações"
        subtitle="Gerencie sua conta e as preferências da plataforma."
      />

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition cursor-pointer ${
              activeTab === "profile"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50/50 border border-gray-100"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Meu Perfil
          </button>
          <button
            onClick={() => setActiveTab("platform")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition cursor-pointer ${
              activeTab === "platform"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50/50 border border-gray-100"
            }`}
          >
            <Globe className="w-4 h-4" />
            Plataforma
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-white rounded-sm shadow-sm p-6 border border-gray-100">
          {activeTab === "profile" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* ACCOUNT INFO FORM */}
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  Informações da Conta
                </h3>

                {profileSuccess && (
                  <div className="bg-green-50 border border-green-100 text-green-700 text-xs p-3 rounded-sm flex items-center gap-2">
                    <CheckCircle size={14} />
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-primary outline-none transition"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-100 bg-gray-50 text-gray-400 rounded-sm text-sm outline-none cursor-not-allowed transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-xs font-bold rounded-sm hover:bg-primary/95 shadow-sm transition uppercase cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Atualizar Perfil
                  </button>
                </div>
              </form>

              {/* PASSWORD CHANGE FORM */}
              <form onSubmit={handleChangePassword} className="pt-6 border-t border-gray-100 space-y-5">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Alterar Senha
                </h3>

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-100 text-green-700 text-xs p-3 rounded-sm flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-sm flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Senha Atual</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-primary outline-none transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-primary outline-none transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      placeholder="Repita a nova senha"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-primary outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-xs font-bold rounded-sm hover:bg-primary/95 shadow-sm transition uppercase cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Alterar Senha
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* PLATFORM SETTINGS */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Segurança e Acesso
                </h3>
                
                <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-xs p-4 rounded-sm mb-4">
                  <strong>Aviso:</strong> As configurações desta seção dependem de variáveis de ambiente do sistema e são de visualização local por agora.
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Modo de Manutenção</p>
                      <p className="text-xs text-gray-500">Impedir novos lances e acessos temporariamente</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-pointer">
                      <span className="translate-x-1 inline-block h-4 w-4 rounded-full bg-white transition" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Verificação em Duas Etapas</p>
                      <p className="text-xs text-gray-500">Exigir código por e-mail no login</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary cursor-pointer">
                      <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-white transition" />
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTIFICATIONS */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Notificações do Sistema
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-sm cursor-pointer transition">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-xs text-gray-700">Notificar sobre novas denúncias críticas</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-sm cursor-pointer transition">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-xs text-gray-700">Relatórios diários de performance por e-mail</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
