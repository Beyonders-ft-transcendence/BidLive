"use client";

import Avatar from "@/components/common/Avatar";
import SideDrawer from "@/components/common/SideDrawer";
import { statusColor } from "@/utils/user";
import {
  ShieldAlert,
  Building2,
  MapPin,
  Gavel,
  Trophy,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Plus
} from "lucide-react";
import { type UserData, type UserStatus } from "../page";

interface UserDetailsDrawerProps {
  user: UserData | null;
  onClose: () => void;
  onToggleStatus: (userId: string, status: UserStatus) => void;
  onToggleVerification: (userId: string) => void;
  onDeleteClick: (userId: string) => void;
}

export default function UserDetailsDrawer({
  user,
  onClose,
  onToggleStatus,
  onToggleVerification,
  onDeleteClick,
}: UserDetailsDrawerProps) {
  if (!user) return null;

  // Drawer Title Slot
  const drawerTitle = (
    <>
      <Avatar name={user.name} size="lg" />
      <div>
        <h3 className="font-black text-sm text-gray-950 leading-tight">{user.name}</h3>
        <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mt-0.5 block">{user.id}</span>
      </div>
    </>
  );

  // Drawer Footer Slot
  const drawerFooter = (
    <>
      {user.status !== "Suspenso" ? (
        <button
          onClick={() => onToggleStatus(user.id, "Suspenso")}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center"
        >
          Suspender Conta
        </button>
      ) : (
        <button
          onClick={() => onToggleStatus(user.id, "Ativo")}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center"
        >
          Ativar Conta
        </button>
      )}

      {user.status !== "Bloqueado" && (
        <button
          onClick={() => onToggleStatus(user.id, "Bloqueado")}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center"
        >
          Bloquear Acesso
        </button>
      )}

      <button
        onClick={() => onDeleteClick(user.id)}
        className="w-10 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center rounded-sm transition-colors cursor-pointer"
      >
        <Trash2 size={14} />
      </button>
    </>
  );

  return (
    <SideDrawer isOpen={true} onClose={onClose} title={drawerTitle} footer={drawerFooter}>
      {/* Account Status Flags & Risks Banner */}
      {user.suspicious && (
        <div className="bg-red-50 border border-red-100 rounded-sm p-3 flex gap-2 text-red-700 animate-pulse">
          <ShieldAlert size={16} className="shrink-0 text-red-500" />
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-wider">Alerta de Fraude & Risco</h5>
            <p className="text-[9px] mt-0.5 text-red-600 leading-relaxed">
              Este utilizador foi sinalizado com comportamento suspeito (lances repetitivos ou múltiplos registros associados). Recomendado cautela.
            </p>
          </div>
        </div>
      )}

      {/* Status & Verification togglers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50/50 border border-gray-100 rounded-sm p-3 text-center flex flex-col items-center">
          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Estado da Conta</span>
          <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase mt-1.5 ${statusColor(user.status)}`}>
            {user.status}
          </span>
        </div>
        <div className="bg-gray-50/50 border border-gray-100 rounded-sm p-3 text-center flex flex-col items-center">
          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Verificação BI/NIF</span>
          <button
            type="button"
            onClick={() => onToggleVerification(user.id)}
            className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase mt-1.5 border transition-all cursor-pointer ${
              user.verified
                ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
            }`}
          >
            {user.verified ? "Aprovado" : "Pendente"}
          </button>
        </div>
      </div>

      {/* Basic Contact Info */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-1">Informações Básicas</span>
        <div className="grid grid-cols-1 gap-2 text-[10px]">
          <div className="flex items-center gap-2.5">
            <Mail size={12} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{user.email}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={12} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{user.phone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin size={12} className="text-gray-400" />
            <span className="font-medium text-gray-600 leading-tight">
              {user.street}, {user.city} - {user.region}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-gray-400 font-medium">Registado em {user.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Company Details (Only Juridical) */}
      {user.type === "Pessoa Jurídica" && user.company && (
        <div className="flex flex-col gap-2.5 bg-blue-50/20 border border-blue-50/50 rounded-sm p-3.5">
          <span className="text-[9px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Building2 size={12} />
            <span>Registro Corporativo (Empresa)</span>
          </span>
          <div className="grid grid-cols-2 gap-3 text-[10px] mt-1">
            <div>
              <span className="text-[8px] text-gray-400 font-bold block uppercase">Razão Social</span>
              <span className="font-bold text-gray-800">{user.company.name}</span>
            </div>
            <div>
              <span className="text-[8px] text-gray-400 font-bold block uppercase">NIF / Documento</span>
              <span className="font-mono font-bold text-gray-800">{user.company.document}</span>
            </div>
            <div>
              <span className="text-[8px] text-gray-400 font-bold block uppercase">Sector Actividade</span>
              <span className="font-semibold text-gray-700">{user.company.industry}</span>
            </div>
            <div>
              <span className="text-[8px] text-gray-400 font-bold block uppercase">Status Documentação</span>
              <span className="inline-flex items-center gap-1 text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm mt-0.5">
                {user.company.verificationStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Activity Stats */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-1">Atividade Operacional</span>
        <div className="grid grid-cols-3 gap-3 mt-1">
          <div className="bg-gray-50 rounded-sm p-2 text-center flex flex-col items-center justify-center">
            <Gavel size={14} className="text-gray-400 mb-1" />
            <span className="text-xs font-black text-gray-900">{user.bids}</span>
            <span className="text-[7px] text-gray-400 font-bold uppercase mt-0.5">Lances</span>
          </div>
          <div className="bg-gray-50 rounded-sm p-2 text-center flex flex-col items-center justify-center">
            <Plus size={14} className="text-gray-400 mb-1" />
            <span className="text-xs font-black text-gray-900">{user.auctionsCreated}</span>
            <span className="text-[7px] text-gray-400 font-bold uppercase mt-0.5">Criados</span>
          </div>
          <div className="bg-gray-50 rounded-sm p-2 text-center flex flex-col items-center justify-center">
            <Trophy size={14} className="text-gray-400 mb-1" />
            <span className="text-xs font-black text-gray-900">{user.auctionsWon}</span>
            <span className="text-[7px] text-gray-400 font-bold uppercase mt-0.5">Arremates</span>
          </div>
        </div>
      </div>

      {/* Risk Audit Stats */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-1">Auditoria de Segurança</span>
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="flex items-center justify-between bg-gray-50/50 rounded-sm p-2.5 border border-gray-100">
            <span className="font-semibold text-gray-600">Total de Denúncias</span>
            <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] ${user.reports > 0 ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
              {user.reports}
            </span>
          </div>
          <div className="flex items-center justify-between bg-gray-50/50 rounded-sm p-2.5 border border-gray-100">
            <span className="font-semibold text-gray-600">Múltiplas Contas</span>
            <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] ${user.multipleAccounts ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
              {user.multipleAccounts ? "SIM" : "NÃO"}
            </span>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
}
