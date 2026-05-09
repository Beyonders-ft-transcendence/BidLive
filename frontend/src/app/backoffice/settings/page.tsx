"use client";

import ActionCard from "@/components/common/ActionCard";
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"profile" | "platform">("profile");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-4xl mx-auto w-full">
      <ActionCard
        title="Configurações"
        subtitle="Gerencie sua conta e as preferências da plataforma"
        buttonLabel="Salvar Tudo"
        onButtonClick={() => alert("Configurações salvas com sucesso!")}
      />

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" />
            Meu Perfil
          </button>
          <button
            onClick={() => setActiveTab("platform")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition ${
              activeTab === "platform"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Globe className="w-4 h-4" />
            Plataforma
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-white rounded-sm shadow-sm p-6">
          {activeTab === "profile" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* ACCOUNT INFO */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Informações da Conta
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nome Completo</label>
                    <input
                      type="text"
                      defaultValue="Super Admin"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">E-mail</label>
                    <input
                      type="email"
                      defaultValue="admin@bidlive.co.ao"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* PASSWORD CHANGE */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Alterar Senha
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Senha Atual</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nova senha"
                        className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-sm hover:bg-blue-700 shadow-sm transition uppercase">
                  <Save className="w-3.5 h-3.5" />
                  Atualizar Perfil
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* PLATFORM SETTINGS */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Segurança e Acesso
                </h3>
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
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer">
                      <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-white transition" />
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTIFICATIONS */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Notificações do Sistema
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-sm cursor-pointer transition">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                    <span className="text-xs text-gray-700">Notificar sobre novas denúncias críticas</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-sm cursor-pointer transition">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
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

