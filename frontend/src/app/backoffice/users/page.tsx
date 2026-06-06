"use client";

import { useMemo, useState } from "react";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import Avatar from "@/components/common/Avatar";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSection from "@/components/common/TableSection";
import StatsGrid, { type StatItem } from "@/components/common/StatsGrid";
import UserDetailsDrawer from "./components/UserDetailsDrawer";
import CreateUserModal from "./components/CreateUserModal";
import { statusColor } from "@/utils/user";
import { type User, UserStatus, UserRole } from "@/types/auth.types";
import {
  Eye,
  Ban,
  Trash2,
  BadgeCheck,
  X,
  User as UserIcon,
  Unlock,
  Radio,
  ShieldAlert,
  UserCheck
} from "lucide-react";

const initialUsersData: User[] = [
  {
    id: 1001,
    email: "ana@email.com",
    username: "anasilva",
    full_name: "Ana Silva",
    avatar_url: null,
    bio: "Licitante ativa no BidLive.",
    is_verified: true,
    status: UserStatus.ACTIVE,
    is_online: true,
    last_seen: "2026-06-06T20:42:00Z",
    last_login_ip: "192.168.1.5",
    is_active: true,
    is_staff: false,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    roles: [UserRole.USER],
    permissions: ["bid.create", "auction.view"],
    created_at: "2025-01-12T08:00:00Z",
    updated_at: "2026-06-06T20:42:00Z",
  },
  {
    id: 1002,
    email: "contato@novaera.co.ao",
    username: "novaera",
    full_name: "Empresa Nova Era Lda",
    avatar_url: null,
    bio: "Parceiro comercial institucional.",
    is_verified: false,
    status: UserStatus.SUSPENDED,
    is_online: false,
    last_seen: "2026-06-05T22:18:00Z",
    last_login_ip: "192.168.10.42",
    is_active: true,
    is_staff: false,
    is_deleted: false,
    failed_login_attempts: 3,
    locked_until: null,
    roles: [UserRole.USER],
    permissions: ["bid.create", "auction.view"],
    created_at: "2025-02-03T14:30:00Z",
    updated_at: "2026-06-05T22:18:00Z",
  },
  {
    id: 1003,
    email: "carlos@email.com",
    username: "carlosmendes",
    full_name: "Carlos Mendes",
    avatar_url: null,
    bio: "Investidor privado e colecionador.",
    is_verified: true,
    status: UserStatus.BANNED,
    is_online: false,
    last_seen: "2026-05-30T15:00:00Z",
    last_login_ip: "196.223.2.14",
    is_active: false,
    is_staff: false,
    is_deleted: false,
    failed_login_attempts: 7,
    locked_until: "2026-06-30T15:00:00Z",
    roles: [UserRole.USER],
    permissions: [],
    created_at: "2025-03-21T09:15:00Z",
    updated_at: "2026-05-30T15:00:00Z",
  },
  {
    id: 1004,
    email: "edmilson.sousa@gmail.com",
    username: "edmilson_sousa",
    full_name: "Edmilson de Sousa",
    avatar_url: null,
    bio: "Novo utilizador registado.",
    is_verified: false,
    status: UserStatus.ACTIVE,
    is_online: true,
    last_seen: "2026-06-06T21:02:00Z",
    last_login_ip: "10.0.2.15",
    is_active: true,
    is_staff: false,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    roles: [UserRole.USER],
    permissions: ["bid.create", "auction.view"],
    created_at: "2025-04-18T11:00:00Z",
    updated_at: "2026-06-06T21:02:00Z",
  },
  {
    id: 1005,
    email: "geral@angolaleiloes.ao",
    username: "angolaleiloes",
    full_name: "Angola Leilões Lda",
    avatar_url: null,
    bio: "Moderador certificado de leilões locais.",
    is_verified: true,
    status: UserStatus.ACTIVE,
    is_online: false,
    last_seen: "2026-06-06T19:00:00Z",
    last_login_ip: "192.168.0.1",
    is_active: true,
    is_staff: true,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    roles: [UserRole.MONITOR, UserRole.USER],
    permissions: ["bid.create", "auction.view", "auction.moderate"],
    created_at: "2025-05-05T10:00:00Z",
    updated_at: "2026-06-06T19:00:00Z",
  }
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsersData);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        String(user.id).includes(search);

      // Role filter check (handles staff check or roles list check)
      const matchRole = roleFilter
        ? roleFilter === "STAFF"
          ? user.is_staff
          : user.roles.includes(roleFilter as UserRole)
        : true;

      const matchStatus = statusFilter ? user.status === statusFilter : true;
      const matchVerification =
        verificationFilter === ""
          ? true
          : verificationFilter === "Verificado"
            ? user.is_verified
            : !user.is_verified;

      return matchSearch && matchRole && matchStatus && matchVerification;
    });
  }, [users, search, roleFilter, statusFilter, verificationFilter]);

  // Metric Stats configuration
  const statItems: StatItem[] = useMemo(() => [
    {
      label: "Total Contas",
      value: users.length,
      icon: <UserIcon size={16} />,
      iconBgClass: "bg-primary/10",
      iconColorClass: "text-primary",
    },
    {
      label: "Contas Verificadas",
      value: users.filter(u => u.is_verified).length,
      icon: <UserCheck size={16} />,
      iconBgClass: "bg-green-50",
      iconColorClass: "text-green-600",
    },
    {
      label: "Utilizadores Online",
      value: users.filter(u => u.is_online).length,
      icon: <Radio size={16} />,
      iconBgClass: "bg-emerald-50",
      iconColorClass: "text-emerald-600",
    },
    {
      label: "Contas Banidas",
      value: users.filter(u => u.status === UserStatus.BANNED).length,
      icon: <ShieldAlert size={16} />,
      iconBgClass: "bg-red-50",
      iconColorClass: "text-red-600",
    },
  ], [users]);

  // Creation handler
  const handleCreateUserSubmit = (formData: {
    username: string;
    email: string;
    full_name: string;
    password: string;
    bio: string;
    is_verified: boolean;
    is_staff: boolean;
    status: UserStatus;
  }) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1001;
    const newUserObj: User = {
      id: newId,
      email: formData.email,
      username: formData.username,
      full_name: formData.full_name,
      avatar_url: null,
      bio: formData.bio,
      is_verified: formData.is_verified,
      status: formData.status,
      is_online: false,
      last_seen: new Date().toISOString(),
      last_login_ip: null,
      is_active: true,
      is_staff: formData.is_staff,
      is_deleted: false,
      failed_login_attempts: 0,
      locked_until: null,
      roles: formData.is_staff ? [UserRole.MONITOR, UserRole.USER] : [UserRole.USER],
      permissions: formData.is_staff ? ["bid.create", "auction.view", "auction.moderate"] : ["bid.create", "auction.view"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUsers([newUserObj, ...users]);
    setIsCreateModalOpen(false);
  };

  const handleToggleStatus = (userId: number, newStatus: UserStatus) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleToggleVerification = (userId: number) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, is_verified: !u.is_verified } : u))
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, is_verified: !prev.is_verified } : null);
    }
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    setUsers(prev => prev.filter(u => u.id !== deleteUserId));
    if (selectedUser && selectedUser.id === deleteUserId) {
      setSelectedUser(null);
    }
    setDeleteUserId(null);
  };

  // Format date helper
  const formatDateSimple = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Filters slot
  const filtersSlot = (
    <TableFilters
      search={search}
      onSearchChange={setSearch}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      filters={{
        type: roleFilter,
        status: statusFilter,
        verification: verificationFilter,
      }}
      onFilterChange={(filterName, value) => {
        if (filterName === "type") setRoleFilter(value);
        if (filterName === "status") setStatusFilter(value);
        if (filterName === "verification") setVerificationFilter(value);
      }}
      onClearFilters={() => {
        setSearch("");
        setRoleFilter("");
        setStatusFilter("");
        setVerificationFilter("");
      }}
      filterOptions={{
        typeOptions: [
          { value: "", label: "Todos Cargos" },
          { value: "STAFF", label: "Administrador / Staff" },
          { value: UserRole.MONITOR, label: "Monitor / Moderador" },
          { value: UserRole.USER, label: "Licitante / Usuário Comum" },
        ],
        statusOptions: [
          { value: "", label: "Todos Estados" },
          { value: UserStatus.ACTIVE, label: "Ativo" },
          { value: UserStatus.SUSPENDED, label: "Suspenso" },
          { value: UserStatus.BANNED, label: "Banido" },
        ],
      }}
    />
  );

  return (
    <div className="flex flex-col gap-5 p-1 select-none">
      
      {/* HEADER SECTION */}
      <ActionCard
        title="Gestão de Usuários"
        subtitle="Administre licitantes, verifique contas administrativas, configure suspensões preventivas e bloqueie acessos no backoffice."
        buttonLabel="Criar Novo Usuário"
        buttonVariant="primary"
        onButtonClick={() => setIsCreateModalOpen(true)}
      />

      {/* STATS OVERVIEW CARDS */}
      <StatsGrid items={statItems} columns={4} />

      {/* REUSABLE TABLE SECTION CONTAINER */}
      <TableSection
        filters={filtersSlot}
        entityName="utilizadores"
        pagination={{
          currentPage: 1,
          totalCount: filteredUsers.length,
          pageSize: 10,
          onPageChange: () => {}
        }}
      >
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
              <th className="p-3">ID / Usuário</th>
              <th className="py-3">Email</th>
              <th className="py-3">Cargo / Papel</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-center">Verificação</th>
              <th className="py-3">Registo</th>
              <th className="py-3 text-right pr-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[10px] text-gray-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                  Nenhum utilizador encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name || user.username} size="md" />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-950 text-xs leading-tight">
                          {user.full_name || user.username}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider font-mono">
                          ID: {user.id} (@{user.username}) {user.is_online && <span className="ml-1 text-emerald-500 bg-emerald-50 px-1 rounded-sm">Online</span>}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="font-medium text-gray-800">{user.email}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map(role => (
                        <span key={role} className="text-[8px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                          {role}
                        </span>
                      ))}
                      {user.is_staff && (
                        <span className="text-[8px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-sm">
                          STAFF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${statusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-center">
                      {user.is_verified ? (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-sm font-bold text-[8px] uppercase">
                          <BadgeCheck size={10} />
                          <span>Verificado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded-sm font-bold text-[8px] uppercase">
                          <X size={10} />
                          <span>Pendente</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-gray-400 font-bold">{formatDateSimple(user.created_at)}</td>
                  <td className="py-3 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedUser(user)}
                        title="Ver Detalhes"
                        className="p-1.5 rounded-sm hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-gray-100 bg-white"
                      >
                        <Eye size={12} />
                      </button>
                      
                      {user.status !== UserStatus.SUSPENDED ? (
                        <button
                          onClick={() => handleToggleStatus(user.id, UserStatus.SUSPENDED)}
                          title="Suspender Conta"
                          className="p-1.5 rounded-sm hover:bg-amber-50 text-amber-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                        >
                          <Ban size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(user.id, UserStatus.ACTIVE)}
                          title="Reativar Conta"
                          className="p-1.5 rounded-sm hover:bg-green-50 text-green-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                        >
                          <Unlock size={12} />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteUserId(user.id)}
                        title="Excluir Usuário"
                        className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableSection>

      {/* DETAIL SIDE PANEL */}
      <UserDetailsDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleStatus={handleToggleStatus}
        onToggleVerification={handleToggleVerification}
        onDeleteClick={setDeleteUserId}
      />

      {/* CREATE NEW USER MODAL */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateUser={handleCreateUserSubmit}
      />

      {/* REUSABLE CONFIRMATION MODAL FOR DELETIONS */}
      <ConfirmModal
        isOpen={deleteUserId !== null}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Confirmar Exclusão de Conta"
        message={`Tem certeza de que deseja excluir permanentemente o utilizador "${
          users.find(u => u.id === deleteUserId)?.full_name || users.find(u => u.id === deleteUserId)?.username
        }"? Esta ação removerá a conta e todos os dados associados de forma definitiva do sistema.`}
        confirmText="Excluir Definitivamente"
        cancelText="Cancelar"
        variant="danger"
      />

    </div>
  );
}
