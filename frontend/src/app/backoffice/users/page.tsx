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
import {
  Eye,
  Ban,
  Trash2,
  BadgeCheck,
  X,
  User,
  AlertTriangle,
  CheckCircle2,
  Unlock
} from "lucide-react";

export type UserType = "Pessoa Física" | "Pessoa Jurídica";
export type UserStatus = "Ativo" | "Suspenso" | "Bloqueado";

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  status: UserStatus;
  verified: boolean;
  createdAt: string;
  lastActivity: string;
  region: string;
  city: string;
  street: string;
  bids: number;
  auctionsCreated: number;
  auctionsWon: number;
  suspicious: boolean;
  reports: number;
  multipleAccounts: boolean;
  company?: {
    name: string;
    document: string;
    industry: string;
    verificationStatus: string;
  };
}

const initialUsersData: UserData[] = [
  {
    id: "USR-1001",
    name: "Ana Silva",
    email: "ana@email.com",
    phone: "+244 923 000 001",
    type: "Pessoa Física",
    status: "Ativo",
    verified: true,
    createdAt: "12 Jan 2025",
    lastActivity: "Hoje, 10:42",
    region: "Luanda",
    city: "Talatona",
    street: "Rua 12, Bloco C",
    bids: 42,
    auctionsCreated: 3,
    auctionsWon: 8,
    suspicious: false,
    reports: 0,
    multipleAccounts: false,
  },
  {
    id: "USR-1002",
    name: "Empresa Nova Era",
    email: "contato@novaera.co.ao",
    phone: "+244 923 000 002",
    type: "Pessoa Jurídica",
    status: "Suspenso",
    verified: false,
    createdAt: "03 Fev 2025",
    lastActivity: "Ontem, 22:18",
    region: "Benguela",
    city: "Lobito",
    street: "Av. Comercial, N. 104",
    bids: 12,
    auctionsCreated: 18,
    auctionsWon: 4,
    suspicious: true,
    reports: 3,
    multipleAccounts: true,
    company: {
      name: "Nova Era Comércio",
      document: "500223991LA",
      industry: "Comércio Geral",
      verificationStatus: "Pendente",
    },
  },
  {
    id: "USR-1003",
    name: "Carlos Mendes",
    email: "carlos@email.com",
    phone: "+244 923 000 003",
    type: "Pessoa Física",
    status: "Bloqueado",
    verified: true,
    createdAt: "21 Mar 2025",
    lastActivity: "7 dias atrás",
    region: "Huíla",
    city: "Lubango",
    street: "Rua Central, N. 8",
    bids: 90,
    auctionsCreated: 1,
    auctionsWon: 12,
    suspicious: true,
    reports: 7,
    multipleAccounts: false,
  },
  {
    id: "USR-1004",
    name: "Edmilson de Sousa",
    email: "edmilson.sousa@gmail.com",
    phone: "+244 934 888 111",
    type: "Pessoa Física",
    status: "Ativo",
    verified: false,
    createdAt: "18 Abr 2025",
    lastActivity: "Hoje, 14:02",
    region: "Luanda",
    city: "Viana",
    street: "Estrada de Catete, Km 12",
    bids: 8,
    auctionsCreated: 0,
    auctionsWon: 1,
    suspicious: false,
    reports: 1,
    multipleAccounts: false,
  },
  {
    id: "USR-1005",
    name: "Angola Leilões Lda",
    email: "geral@angolaleiloes.ao",
    phone: "+244 222 444 888",
    type: "Pessoa Jurídica",
    status: "Ativo",
    verified: true,
    createdAt: "05 Mai 2025",
    lastActivity: "Há 2 horas",
    region: "Luanda",
    city: "Ingombota",
    street: "Rua Major Kanhangulo",
    bids: 154,
    auctionsCreated: 42,
    auctionsWon: 29,
    suspicious: false,
    reports: 0,
    multipleAccounts: false,
    company: {
      name: "Angola Leilões Limitada",
      document: "740129841LU",
      industry: "Serviços & Bens",
      verificationStatus: "Aprovado",
    },
  }
];

export default function Users() {
  const [users, setUsers] = useState<UserData[]>(initialUsersData);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search);

      const matchType = typeFilter ? user.type === typeFilter : true;
      const matchStatus = statusFilter ? user.status === statusFilter : true;
      const matchVerification =
        verificationFilter === ""
          ? true
          : verificationFilter === "Verificado"
            ? user.verified
            : !user.verified;

      return matchSearch && matchType && matchStatus && matchVerification;
    });
  }, [users, search, typeFilter, statusFilter, verificationFilter]);

  // Metric Stats configuration
  const statItems: StatItem[] = useMemo(() => [
    {
      label: "Total Contas",
      value: users.length,
      icon: <User size={16} />,
      iconBgClass: "bg-primary/10",
      iconColorClass: "text-primary",
    },
    {
      label: "Contas Verificadas",
      value: users.filter(u => u.verified).length,
      icon: <CheckCircle2 size={16} />,
      iconBgClass: "bg-green-50",
      iconColorClass: "text-green-600",
    },
    {
      label: "Casos Suspeitos",
      value: users.filter(u => u.suspicious).length,
      icon: <AlertTriangle size={16} />,
      iconBgClass: "bg-amber-50",
      iconColorClass: "text-amber-600",
    },
    {
      label: "Usuários Bloqueados",
      value: users.filter(u => u.status === "Bloqueado").length,
      icon: <Ban size={16} />,
      iconBgClass: "bg-red-50",
      iconColorClass: "text-red-600",
    },
  ], [users]);

  // Creation handler
  const handleCreateUserSubmit = (formData: {
    name: string;
    email: string;
    phone: string;
    type: UserType;
    status: UserStatus;
    verified: boolean;
    region: string;
    city: string;
    street: string;
    companyName?: string;
    companyDoc?: string;
    companyIndustry?: string;
  }) => {
    const newId = `USR-${1000 + users.length + 1}`;
    const newUserObj: UserData = {
      id: newId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: formData.type,
      status: formData.status,
      verified: formData.verified,
      createdAt: new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" }),
      lastActivity: "Registado agora",
      region: formData.region,
      city: formData.city || "Luanda",
      street: formData.street || "Rua Central",
      bids: 0,
      auctionsCreated: 0,
      auctionsWon: 0,
      suspicious: false,
      reports: 0,
      multipleAccounts: false,
      ...(formData.type === "Pessoa Jurídica" && {
        company: {
          name: formData.companyName || formData.name,
          document: formData.companyDoc || "ISENTO",
          industry: formData.companyIndustry || "Comércio Geral",
          verificationStatus: formData.verified ? "Aprovado" : "Pendente",
        }
      })
    };

    setUsers([newUserObj, ...users]);
    setIsCreateModalOpen(false);
  };

  const handleToggleStatus = (userId: string, newStatus: UserStatus) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleToggleVerification = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextVerified = !u.verified;
          return {
            ...u,
            verified: nextVerified,
            ...(u.company && {
              company: {
                ...u.company,
                verificationStatus: nextVerified ? "Aprovado" : "Pendente"
              }
            })
          };
        }
        return u;
      })
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => {
        if (!prev) return null;
        const nextVerified = !prev.verified;
        return {
          ...prev,
          verified: nextVerified,
          ...(prev.company && {
            company: {
              ...prev.company,
              verificationStatus: nextVerified ? "Aprovado" : "Pendente"
            }
          })
        };
      });
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

  // Filters slot
  const filtersSlot = (
    <TableFilters
      search={search}
      onSearchChange={setSearch}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      filters={{
        type: typeFilter,
        status: statusFilter,
        verification: verificationFilter,
      }}
      onFilterChange={(filterName, value) => {
        if (filterName === "type") setTypeFilter(value);
        if (filterName === "status") setStatusFilter(value);
        if (filterName === "verification") setVerificationFilter(value);
      }}
      onClearFilters={() => {
        setSearch("");
        setTypeFilter("");
        setStatusFilter("");
        setVerificationFilter("");
      }}
      filterOptions={{
        typeOptions: [
          { value: "", label: "Todos" },
          { value: "Pessoa Física", label: "Pessoa Física" },
          { value: "Pessoa Jurídica", label: "Pessoa Jurídica" },
        ],
        statusOptions: [
          { value: "", label: "Todos" },
          { value: "Ativo", label: "Ativo" },
          { value: "Suspenso", label: "Suspenso" },
          { value: "Bloqueado", label: "Bloqueado" },
        ],
      }}
    />
  );

  return (
    <div className="flex flex-col gap-5 p-1 select-none">
      
      {/* HEADER SECTION */}
      <ActionCard
        title="Gestão de Usuários"
        subtitle="Administre licitantes, verifique identidades corporativas e configure bloqueios e suspensões preventivas."
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
              <th className="py-3">Email / Contacto</th>
              <th className="py-3">Tipo</th>
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
                      <Avatar name={user.name} size="md" />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-950 text-xs leading-tight">{user.name}</span>
                        <span className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider font-mono">
                          {user.id} {user.suspicious && <span className="ml-1 text-red-500 bg-red-50 px-1 rounded-sm">Risco</span>}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{user.email}</span>
                      <span className="text-[8px] text-gray-400 mt-0.5 font-bold">{user.phone}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-gray-500">{user.type}</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${statusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-center">
                      {user.verified ? (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-sm font-bold text-[8px] uppercase">
                          <BadgeCheck size={10} />
                          <span>Verificado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded-sm font-bold text-[8px] uppercase">
                          <X size={10} />
                          <span>Não Verif.</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-gray-400 font-bold">{user.createdAt}</td>
                  <td className="py-3 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedUser(user)}
                        title="Ver Detalhes"
                        className="p-1.5 rounded-sm hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-gray-100 bg-white"
                      >
                        <Eye size={12} />
                      </button>
                      
                      {user.status !== "Suspenso" ? (
                        <button
                          onClick={() => handleToggleStatus(user.id, "Suspenso")}
                          title="Suspender Conta"
                          className="p-1.5 rounded-sm hover:bg-amber-50 text-amber-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                        >
                          <Ban size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(user.id, "Ativo")}
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
          users.find(u => u.id === deleteUserId)?.name
        }"? Esta ação removerá a conta e todos os dados associados de forma definitiva do sistema.`}
        confirmText="Excluir Definitivamente"
        cancelText="Cancelar"
        variant="danger"
      />

    </div>
  );
}
