"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import Avatar from "@/components/common/Avatar";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSection from "@/components/common/TableSection";
import StatsGrid, { type StatItem } from "@/components/common/StatsGrid";
import UserDetailsDrawer from "./components/UserDetailsDrawer";
import CreateUserModal from "./components/CreateUserModal";
import { statusColor } from "@/utils/user";
import {
  useUsersQuery,
  useUserQuery,
  useCreateUserMutation,
  useBanUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/hooks/useRbac";
import { type UserManaged } from "@/types/rbac.types";
import { UserStatus } from "@/types/auth.types";
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

export default function Users() {
  const queryClient = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Pagination & Count State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filters state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Helper for showing errors on the frontend
  const showError = (message: string, err: any) => {
    console.error(message, err);
    const apiMsg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Erro desconhecido";
    alert(`${message}\nDetalhes: ${apiMsg}`);
  };

  // Fetch Stats dynamically from API via parallel queries
  const { data: totalUsersRes } = useUsersQuery({ page_size: 1 });
  const { data: verifiedUsersRes } = useUsersQuery({ is_verified: true, page_size: 1 });
  const { data: bannedUsersRes } = useUsersQuery({ status: UserStatus.BANNED, page_size: 1 });
  const { data: onlineUsersRes } = useUsersQuery({ is_online: true, page_size: 1 });

  const stats = useMemo(() => ({
    total: totalUsersRes?.count || 0,
    verified: verifiedUsersRes?.count || 0,
    online: onlineUsersRes?.count || 0,
    banned: bannedUsersRes?.count || 0,
  }), [totalUsersRes, verifiedUsersRes, onlineUsersRes, bannedUsersRes]);

  // Fetch Users based on filters and pagination
  const listParams = useMemo(() => {
    const params: Record<string, any> = {
      page: currentPage,
      page_size: pageSize,
      search: search || undefined,
      status: statusFilter || undefined,
    };

    if (verificationFilter === "Verificado") {
      params.is_verified = "true";
    } else if (verificationFilter === "Pendente") {
      params.is_verified = "false";
    }

    if (roleFilter) {
      params.role = roleFilter;
    }
    return params;
  }, [currentPage, search, statusFilter, verificationFilter, roleFilter]);

  const { data: usersListData, isLoading: loading } = useUsersQuery(listParams);
  const users = usersListData?.results || [];
  const totalCount = usersListData?.count || 0;

  const { data: selectedUserData } = useUserQuery(selectedUserId || 0);
  const selectedUser = selectedUserData || null;

  // Mutations
  const createUserMutation = useCreateUserMutation();
  const banUserMutation = useBanUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  // View detailed user details drawer
  const handleViewDetails = (user: UserManaged) => {
    setSelectedUserId(user.id);
  };

  // Creation handler
  const handleCreateUserSubmit = async (formData: {
    username: string;
    email: string;
    full_name: string;
    password: string;
    bio: string;
    role: string;
  }) => {
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        bio: formData.bio || undefined,
        role_names: [formData.role],
      };

      await createUserMutation.mutateAsync(payload);
    } catch (err) {
      showError("Erro ao registrar utilizador na API.", err);
    }
    setIsCreateModalOpen(false);
  };

  const handleToggleStatus = async (userId: number, newStatus: UserStatus) => {
    try {
      await banUserMutation.mutateAsync({ id: userId, payload: { status: newStatus } });
    } catch (err) {
      showError("Erro ao alterar status do utilizador.", err);
    }
  };

  const handleToggleVerification = async (userId: number) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        payload: {
          is_verified: !targetUser.is_verified,
        },
      });
    } catch (err) {
      showError("Erro ao alterar verificação do utilizador.", err);
    }
  };

  const handleToggleActive = async (userId: number) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        payload: {
          is_active: !targetUser.is_active,
        },
      });
    } catch (err) {
      showError("Erro ao alterar atividade do utilizador.", err);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUserMutation.mutateAsync(deleteUserId);
      if (selectedUserId === deleteUserId) {
        setSelectedUserId(null);
      }
    } catch (err) {
      showError("Erro ao excluir utilizador.", err);
    }
    setDeleteUserId(null);
  };

  // Metric Stats configuration
  const statItems: StatItem[] = useMemo(() => [
    {
      label: "Total Contas",
      value: stats.total,
      icon: <UserIcon size={16} />,
      iconBgClass: "bg-primary/10",
      iconColorClass: "text-primary",
    },
    {
      label: "Contas Verificadas",
      value: stats.verified,
      icon: <UserCheck size={16} />,
      iconBgClass: "bg-green-50",
      iconColorClass: "text-green-600",
    },
    {
      label: "Utilizadores Online",
      value: stats.online,
      icon: <Radio size={16} />,
      iconBgClass: "bg-emerald-50",
      iconColorClass: "text-emerald-600",
    },
    {
      label: "Contas Banidas",
      value: stats.banned,
      icon: <ShieldAlert size={16} />,
      iconBgClass: "bg-red-50",
      iconColorClass: "text-red-600",
    },
  ], [stats]);

  // Format date helper
  const formatDateSimple = (dateStr?: string) => {
    if (!dateStr) return "-";
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
      onSearchChange={(val) => {
        setSearch(val);
        setCurrentPage(1);
      }}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      filters={{
        type: roleFilter,
        status: statusFilter,
        verification: verificationFilter,
      }}
      onFilterChange={(filterName, value) => {
        setCurrentPage(1);
        if (filterName === "type") setRoleFilter(value);
        if (filterName === "status") setStatusFilter(value);
        if (filterName === "verification") setVerificationFilter(value);
      }}
      onClearFilters={() => {
        setSearch("");
        setRoleFilter("");
        setStatusFilter("");
        setVerificationFilter("");
        setCurrentPage(1);
      }}
      filterOptions={{
        typeOptions: [
          { value: "", label: "Todos Cargos" },
          { value: "USER", label: "Licitante (USER)" },
          { value: "MONITOR", label: "Moderador (MONITOR)" },
          { value: "SUPER_ADMIN", label: "Administrador (SUPER_ADMIN)" },
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
          currentPage: currentPage,
          totalCount: totalCount,
          pageSize: pageSize,
          onPageChange: (page) => setCurrentPage(page)
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
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                  Carregando lista de utilizadores da API...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                  Nenhum utilizador encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
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
                      {user.roles && user.roles.map(role => (
                        <span key={role} className="text-[8px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                          {role}
                        </span>
                      ))}
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
                        onClick={() => handleViewDetails(user)}
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
        onClose={() => setSelectedUserId(null)}
        onToggleStatus={handleToggleStatus}
        onToggleVerification={handleToggleVerification}
        onToggleActive={handleToggleActive}
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
        message={`Tem certeza de que deseja excluir permanentemente este utilizador? Esta ação removerá a conta e todos os dados associados de forma definitiva do sistema.`}
        confirmText="Excluir Definitivamente"
        cancelText="Cancelar"
        variant="danger"
      />

    </div>
  );
}
