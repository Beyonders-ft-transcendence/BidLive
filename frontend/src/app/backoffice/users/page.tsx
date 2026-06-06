"use client";

import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import Avatar from "@/components/common/Avatar";
import { statusColor } from "@/utils/user";
import {
  Eye,
  Ban,
  Trash2,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  ShieldAlert,
  User,
  Building2,
  MapPin,
  Gavel,
  Trophy,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Unlock
} from "lucide-react";
import { useMemo, useState } from "react";

type UserType = "Pessoa Física" | "Pessoa Jurídica";
type UserStatus = "Ativo" | "Suspenso" | "Bloqueado";

interface UserData {
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Create user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserType, setNewUserType] = useState<UserType>("Pessoa Física");
  const [newUserStatus, setNewUserStatus] = useState<UserStatus>("Ativo");
  const [newUserVerified, setNewUserVerified] = useState(false);
  const [newUserRegion, setNewUserRegion] = useState("Luanda");
  const [newUserCity, setNewUserCity] = useState("");
  const [newUserStreet, setNewUserStreet] = useState("");
  // Juridical extra fields
  const [newUserCompanyName, setNewUserCompanyName] = useState("");
  const [newUserCompanyDoc, setNewUserCompanyDoc] = useState("");
  const [newUserCompanyIndustry, setNewUserCompanyIndustry] = useState("");

  // Filtered Users list
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

  // Actions
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPhone) return;

    const newId = `USR-${1000 + users.length + 1}`;
    const newUserObj: UserData = {
      id: newId,
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      type: newUserType,
      status: newUserStatus,
      verified: newUserVerified,
      createdAt: new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" }),
      lastActivity: "Registado agora",
      region: newUserRegion,
      city: newUserCity || "Luanda",
      street: newUserStreet || "Rua Central",
      bids: 0,
      auctionsCreated: 0,
      auctionsWon: 0,
      suspicious: false,
      reports: 0,
      multipleAccounts: false,
      ...(newUserType === "Pessoa Jurídica" && {
        company: {
          name: newUserCompanyName || newUserName,
          document: newUserCompanyDoc || "ISENTO",
          industry: newUserCompanyIndustry || "Comércio Geral",
          verificationStatus: newUserVerified ? "Aprovado" : "Pendente",
        }
      })
    };

    setUsers([newUserObj, ...users]);
    setIsCreateModalOpen(false);
    // Reset form
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setNewUserType("Pessoa Física");
    setNewUserStatus("Ativo");
    setNewUserVerified(false);
    setNewUserCity("");
    setNewUserStreet("");
    setNewUserCompanyName("");
    setNewUserCompanyDoc("");
    setNewUserCompanyIndustry("");
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

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setIsDeleteConfirmOpen(null);
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(null);
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User size={16} />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Contas</p>
            <h4 className="text-base font-black text-gray-900 mt-0.5">{users.length}</h4>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Contas Verificadas</p>
            <h4 className="text-base font-black text-gray-900 mt-0.5">
              {users.filter(u => u.verified).length}
            </h4>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Casos Suspeitos</p>
            <h4 className="text-base font-black text-gray-900 mt-0.5">
              {users.filter(u => u.suspicious).length}
            </h4>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Ban size={16} />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Usuários Bloqueados</p>
            <h4 className="text-base font-black text-gray-900 mt-0.5">
              {users.filter(u => u.status === "Bloqueado").length}
            </h4>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* FILTERS TOOLBAR */}
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

        {/* RESULTS TABLE */}
        <div className="overflow-x-auto mt-4 scrollbar-none">
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
                          onClick={() => setIsDeleteConfirmOpen(user.id)}
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
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
          <span className="text-[10px] text-gray-400 font-bold">
            Mostrando 1–{filteredUsers.length} de {filteredUsers.length} utilizadores
          </span>
          <div className="flex gap-1">
            <button className="p-1 border border-gray-100 bg-white rounded-sm text-gray-400 cursor-not-allowed">
              <ChevronLeft size={12} />
            </button>
            <button className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-sm">
              1
            </button>
            <button className="p-1 border border-gray-100 bg-white rounded-sm text-gray-400 cursor-not-allowed">
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

      </div>

      {/* DETAIL SIDE PANEL / MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end select-none">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Avatar name={selectedUser.name} size="lg" />
                <div>
                  <h3 className="font-black text-sm text-gray-950 leading-tight">{selectedUser.name}</h3>
                  <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mt-0.5 block">{selectedUser.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-sm hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center border border-gray-100 bg-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              
              {/* Account Status Flags & Risks Banner */}
              {selectedUser.suspicious && (
                <div className="bg-red-50 border border-red-100 rounded-sm p-3 flex gap-2 text-red-700">
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
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase mt-1.5 ${statusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="bg-gray-50/50 border border-gray-100 rounded-sm p-3 text-center flex flex-col items-center">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Verificação BI/NIF</span>
                  <button
                    onClick={() => handleToggleVerification(selectedUser.id)}
                    className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase mt-1.5 border transition-all cursor-pointer ${
                      selectedUser.verified
                        ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {selectedUser.verified ? "Aprovado" : "Pendente"}
                  </button>
                </div>
              </div>

              {/* Basic Contact Info */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-1">Informações Básicas</span>
                <div className="grid grid-cols-1 gap-2 text-[10px]">
                  <div className="flex items-center gap-2.5">
                    <Mail size={12} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={12} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="font-medium text-gray-600 leading-tight">
                      {selectedUser.street}, {selectedUser.city} - {selectedUser.region}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-gray-400 font-medium">Registado em {selectedUser.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Company Details (Only Juridical) */}
              {selectedUser.type === "Pessoa Jurídica" && selectedUser.company && (
                <div className="flex flex-col gap-2.5 bg-blue-50/20 border border-blue-50/50 rounded-sm p-3.5">
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={12} />
                    <span>Registro Corporativo (Empresa)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-[10px] mt-1">
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold block uppercase">Razão Social</span>
                      <span className="font-bold text-gray-800">{selectedUser.company.name}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold block uppercase">NIF / Documento</span>
                      <span className="font-mono font-bold text-gray-800">{selectedUser.company.document}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold block uppercase">Sector Actividade</span>
                      <span className="font-semibold text-gray-700">{selectedUser.company.industry}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold block uppercase">Status Documentação</span>
                      <span className="inline-flex items-center gap-1 text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm mt-0.5">
                        {selectedUser.company.verificationStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Stats */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-1">Atividade Operacional</span>
                <div className="grid grid-cols-3 gap-3 mt-1 select-none">
                  <div className="bg-gray-50 rounded-sm p-2 text-center flex flex-col items-center justify-center">
                    <Gavel size={14} className="text-gray-400 mb-1" />
                    <span className="text-xs font-black text-gray-900">{selectedUser.bids}</span>
                    <span className="text-[7px] text-gray-400 font-bold uppercase mt-0.5">Lances</span>
                  </div>
                  <div className="bg-gray-50 rounded-sm p-2 text-center flex flex-col items-center justify-center">
                    <Plus size={14} className="text-gray-400 mb-1" />
                    <span className="text-xs font-black text-gray-900">{selectedUser.auctionsCreated}</span>
                    <span className="text-[7px] text-gray-400 font-bold uppercase mt-0.5">Criados</span>
                  </div>
                  <div className="bg-gray-50 rounded-sm p-2 text-center flex flex-col items-center justify-center">
                    <Trophy size={14} className="text-gray-400 mb-1" />
                    <span className="text-xs font-black text-gray-900">{selectedUser.auctionsWon}</span>
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
                    <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] ${selectedUser.reports > 0 ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
                      {selectedUser.reports}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50/50 rounded-sm p-2.5 border border-gray-100">
                    <span className="font-semibold text-gray-600">Múltiplas Contas</span>
                    <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] ${selectedUser.multipleAccounts ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                      {selectedUser.multipleAccounts ? "SIM" : "NÃO"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50/50 shrink-0">
              
              {selectedUser.status !== "Suspenso" ? (
                <button
                  onClick={() => handleToggleStatus(selectedUser.id, "Suspenso")}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center"
                >
                  Suspender Conta
                </button>
              ) : (
                <button
                  onClick={() => handleToggleStatus(selectedUser.id, "Ativo")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center"
                >
                  Ativar Conta
                </button>
              )}

              {selectedUser.status !== "Bloqueado" && (
                <button
                  onClick={() => handleToggleStatus(selectedUser.id, "Bloqueado")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-sm transition-colors cursor-pointer text-center"
                >
                  Bloquear Acesso
                </button>
              )}

              <button
                onClick={() => setIsDeleteConfirmOpen(selectedUser.id)}
                className="w-10 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center rounded-sm transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>

            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-lg bg-white rounded-sm shadow-2xl flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-primary">
                <Plus size={16} strokeWidth={3} />
                <h3 className="font-black text-sm text-gray-950">Novo Utilizador Administrativo</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-sm hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center border border-gray-100 bg-white cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            {/* Form Scroll Container */}
            <form onSubmit={handleCreateUser} className="flex flex-col flex-1 max-h-[75vh] overflow-y-auto p-5 gap-4">
              
              {/* Type toggle */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tipo de Conta</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserType("Pessoa Física")}
                    className={`py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer border ${
                      newUserType === "Pessoa Física"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    Pessoa Física
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserType("Pessoa Jurídica")}
                    className={`py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer border ${
                      newUserType === "Pessoa Jurídica"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    Pessoa Jurídica (Empresa)
                  </button>
                </div>
              </div>

              {/* Basic Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ex: Manuel António"
                    className="w-full bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Ex: manuel@email.com"
                    className="w-full bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Telefone</label>
                  <input
                    type="text"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="Ex: +244 923 000 000"
                    className="w-full bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado Inicial</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as UserStatus)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-xs focus:outline-none text-gray-800 cursor-pointer"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              {/* Toggle verification box */}
              <div className="flex items-center gap-2 border border-gray-50 p-2.5 rounded-sm bg-gray-50/30">
                <input
                  type="checkbox"
                  id="user-verified-check"
                  checked={newUserVerified}
                  onChange={(e) => setNewUserVerified(e.target.checked)}
                  className="rounded-sm border-gray-300 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="user-verified-check" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Marcar conta como previamente Verificada (BI / Documentação OK)
                </label>
              </div>

              {/* Location Fields */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-0.5">Endereço & Localização</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Província</label>
                    <select
                      value={newUserRegion}
                      onChange={(e) => setNewUserRegion(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none text-gray-800 cursor-pointer"
                    >
                      <option value="Luanda">Luanda</option>
                      <option value="Benguela">Benguela</option>
                      <option value="Huíla">Huíla</option>
                      <option value="Cabinda">Cabinda</option>
                      <option value="Huambo">Huambo</option>
                      <option value="Namibe">Namibe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Cidade / Município</label>
                    <input
                      type="text"
                      value={newUserCity}
                      onChange={(e) => setNewUserCity(e.target.value)}
                      placeholder="Ex: Talatona"
                      className="w-full bg-gray-50 border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Rua / Bairro</label>
                    <input
                      type="text"
                      value={newUserStreet}
                      onChange={(e) => setNewUserStreet(e.target.value)}
                      placeholder="Ex: Rua Central"
                      className="w-full bg-gray-50 border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Juridical specific section */}
              {newUserType === "Pessoa Jurídica" && (
                <div className="flex flex-col gap-3.5 bg-blue-50/20 border border-blue-50/50 rounded-sm p-3.5 mt-2">
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={12} />
                    <span>Detalhes da Empresa</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Razão Social</label>
                      <input
                        type="text"
                        value={newUserCompanyName}
                        onChange={(e) => setNewUserCompanyName(e.target.value)}
                        placeholder="Ex: Nova Era Lda"
                        className="w-full bg-white border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">NIF Corporativo</label>
                      <input
                        type="text"
                        value={newUserCompanyDoc}
                        onChange={(e) => setNewUserCompanyDoc(e.target.value)}
                        placeholder="Ex: 5002931LA"
                        className="w-full bg-white border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Sector Comercial</label>
                      <input
                        type="text"
                        value={newUserCompanyIndustry}
                        onChange={(e) => setNewUserCompanyIndustry(e.target.value)}
                        placeholder="Ex: Importações"
                        className="w-full bg-white border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit panel */}
              <div className="border-t border-gray-100 pt-4 flex justify-end gap-2 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs py-2 px-4 rounded-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2 px-5 rounded-sm transition-colors cursor-pointer"
                >
                  Salvar Registo
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-100">
            <div className="flex gap-3 text-red-600">
              <AlertTriangle size={20} className="shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Confirmar Exclusão de Conta</h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                  Tem certeza de que deseja excluir permanentemente o utilizador <span className="font-bold text-gray-800">
                    {users.find(u => u.id === isDeleteConfirmOpen)?.name}
                  </span>? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(null)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-[10px] py-1.5 px-3 rounded-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUser(isDeleteConfirmOpen)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] py-1.5 px-4 rounded-sm transition-colors cursor-pointer"
              >
                Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
