"use client";

import Avatar from "@/components/common/Avatar";
import SideDrawer from "@/components/common/SideDrawer";
import { statusColor } from "@/utils/user";
import {
  ShieldAlert,
  Mail,
  Calendar,
  Trash2,
  Compass,
  Activity,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { type UserManaged } from "@/types/rbac.types";
import { UserStatus } from "@/types/auth.types";

interface UserDetailsDrawerProps {
  user: UserManaged | null;
  onClose: () => void;
  onToggleStatus: (userId: number, status: UserStatus) => void;
  onToggleVerification: (userId: number) => void;
  onToggleActive: (userId: number) => void;
  onDeleteClick: (userId: number) => void;
}

export default function UserDetailsDrawer({
  user,
  onClose,
  onToggleStatus,
  onToggleVerification,
  onToggleActive,
  onDeleteClick,
}: UserDetailsDrawerProps) {
  if (!user) return null;

  // Drawer Title Slot
  const drawerTitle = (
    <>
      <Avatar name={user.full_name || user.username} size="lg" />
      <div>
        <h3 className="font-black text-sm text-gray-950 leading-tight">
          {user.full_name || user.username}
        </h3>
        <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mt-0.5 block">
          ID: {user.id} (@{user.username})
        </span>
      </div>
    </>
  );

  // Drawer Footer Slot
  const drawerFooter = (
    <>
      {user.status !== UserStatus.SUSPENDED ? (
        <button
          onClick={() => onToggleStatus(user.id, UserStatus.SUSPENDED)}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center focus:outline-none"
        >
          Suspender Conta
        </button>
      ) : (
        <button
          onClick={() => onToggleStatus(user.id, UserStatus.ACTIVE)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center focus:outline-none"
        >
          Ativar Conta
        </button>
      )}

      {user.status !== UserStatus.BANNED && (
        <button
          onClick={() => onToggleStatus(user.id, UserStatus.BANNED)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center focus:outline-none"
        >
          Banir Acesso
        </button>
      )}

      <button
        onClick={() => onDeleteClick(user.id)}
        className="w-10 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center rounded-sm transition-colors cursor-pointer focus:outline-none"
      >
        <Trash2 size={14} />
      </button>
    </>
  );

  // Parse dates nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Sem registo";
    try {
      return new Date(dateStr).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SideDrawer isOpen={true} onClose={onClose} title={drawerTitle} footer={drawerFooter}>
      {/* Account Status Flags */}
      {!user.is_active && (
        <div className="bg-red-50 border border-red-100 rounded-sm p-3 flex gap-2 text-red-700">
          <ShieldAlert size={16} className="shrink-0 text-red-500" />
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-wider">Conta Inativa</h5>
            <p className="text-[9px] mt-0.5 text-red-600 leading-relaxed">
              Esta conta de utilizador está desativada no sistema. Lances e autenticação estão bloqueados.
            </p>
          </div>
        </div>
      )}

      {/* Status & Verification togglers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50/50 border border-gray-100 rounded-sm p-3 text-center flex flex-col items-center justify-center">
          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Estado da Conta</span>
          <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase mt-1.5 ${statusColor(user.status)}`}>
            {user.status}
          </span>
        </div>
        <div className="bg-gray-50/50 border border-gray-100 rounded-sm p-3 text-center flex flex-col items-center justify-center">
          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Verificação de E-mail</span>
          <button
            type="button"
            onClick={() => onToggleVerification(user.id)}
            className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase mt-1.5 border transition-all cursor-pointer focus:outline-none ${
              user.is_verified
                ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
            }`}
          >
            {user.is_verified ? "Verificado" : "Pendente"}
          </button>
        </div>
      </div>

      {/* Basic Contact Info */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-1">
          Informações Básicas
        </span>
        <div className="grid grid-cols-1 gap-2 text-[10px]">
          <div className="flex items-center gap-2.5">
            <Mail size={12} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{user.email}</span>
          </div>
          {user.bio && (
            <div className="flex gap-2.5 items-start">
              <Compass size={12} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-gray-600 leading-relaxed italic">{user.bio}</p>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-gray-400 font-medium">Registado em: {formatDate(user.created_at)}</span>
          </div>
          {user.updated_at && (
            <div className="flex items-center gap-2.5">
              <Activity size={12} className="text-gray-400" />
              <span className="text-gray-400 font-medium">Última atualização: {formatDate(user.updated_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Online Status & Connection */}
      <div className="flex flex-col gap-2.5 bg-gray-50/50 border border-gray-100 rounded-sm p-3.5">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
          Sessão & Conexão
        </span>
        <div className="grid grid-cols-2 gap-3 text-[10px] mt-1">
          <div>
            <span className="text-[8px] text-gray-400 font-bold block uppercase">Conexão Atual</span>
            <span className={`inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-sm mt-0.5 uppercase ${
              user.is_online ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
            }`}>
              {user.is_online ? "Online" : "Offline"}
            </span>
          </div>
          <div>
            <span className="text-[8px] text-gray-400 font-bold block uppercase">Status de Atividade</span>
            <button
              onClick={() => onToggleActive(user.id)}
              className="flex items-center gap-1 mt-0.5 text-gray-600 hover:text-primary transition-colors focus:outline-none"
            >
              {user.is_active ? (
                <>
                  <ToggleRight size={18} className="text-primary" />
                  <span className="text-[9px] font-bold text-primary uppercase">Ativa</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={18} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Inativa</span>
                </>
              )}
            </button>
          </div>
          {user.last_seen && (
            <div className="col-span-2 mt-2 pt-2 border-t border-gray-100/60">
              <span className="text-[8px] text-gray-400 font-bold block uppercase">Última vez visto (last_seen)</span>
              <span className="text-gray-600 font-semibold">{formatDate(user.last_seen)}</span>
            </div>
          )}
        </div>
      </div>

      {/* RBAC details */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-1">
          Papéis / Roles (RBAC)
        </span>
        <div className="flex flex-wrap gap-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <span key={role} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[8px] font-bold uppercase rounded-sm">
                {role}
              </span>
            ))
          ) : (
            <span className="text-[9px] text-gray-400 italic">Nenhum papel atribuído.</span>
          )}
        </div>
      </div>
    </SideDrawer>
  );
}
