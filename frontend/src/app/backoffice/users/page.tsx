"use client";

import Header from "@/components/layout/backoffice/Header";
import ActionCard from "@/components/common/ActionCard";
import {
  Search,
  Filter,
  Eye,
  Ban,
  PauseCircle,
  Trash2,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Bell,
  ShieldAlert,
  LogOut,
  KeyRound,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Activity,
  AlertTriangle,
  X,
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

const usersData: UserData[] = [
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
    street: "Rua 12",
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
    street: "Av. Comercial",
    bids: 12,
    auctionsCreated: 18,
    auctionsWon: 4,
    suspicious: true,
    reports: 3,
    multipleAccounts: true,
    company: {
      name: "Nova Era Comércio",
      document: "500223991LA",
      industry: "Comércio",
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
    street: "Rua Central",
    bids: 90,
    auctionsCreated: 1,
    auctionsWon: 12,
    suspicious: true,
    reports: 7,
    multipleAccounts: false,
  },
];

function statusColor(status: UserStatus) {
  switch (status) {
    case "Ativo":
      return "bg-green-100 text-green-600";
    case "Suspenso":
      return "bg-yellow-100 text-yellow-600";
    case "Bloqueado":
      return "bg-red-100 text-red-600";
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-green-500",
    "bg-teal-500",
    "bg-indigo-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function Users() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const filteredUsers = useMemo(() => {
    return usersData.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase());

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
  }, [search, typeFilter, statusFilter, verificationFilter]);

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <ActionCard
          title="Gestão de Usuários"
          buttonLabel="Criar Usuário"
        />

        {/* TABLE */}
        <div className="bg-white rounded-sm shadow-sm mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 text-left">
                <tr className="text-xs text-gray-600 border-b border-gray-200">
                  <th className="p-3">Nome</th>
                  <th className="text-xs">Email</th>
                  <th className="text-xs">Tipo</th>
                  <th className="text-xs">Status</th>
                  <th className="text-xs">Verificado</th>
                  <th className="text-xs">Data</th>
                  <th className="text-xs">Última atividade</th>
                  <th className="text-xs">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition text-xs"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold text-xs`}>
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>

                    <td className="text-xs">{user.email}</td>

                    <td className="text-xs">
                      <span>{user.type}</span>
                    </td>

                    <td className="text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="text-xs">
                      {user.verified ? (
                        <BadgeCheck className="text-green-500 w-4 h-4" />
                      ) : (
                        <X className="text-red-500 w-4 h-4" />
                      )}
                    </td>

                    <td className="text-xs">{user.createdAt}</td>

                    <td className="text-xs">{user.lastActivity}</td>

                    <td className="text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-sm hover:bg-blue-100 text-blue-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button className="p-1.5 rounded-sm hover:bg-yellow-100 text-yellow-600">
                          <PauseCircle className="w-3.5 h-3.5" />
                        </button>

                        <button className="p-1.5 rounded-sm hover:bg-red-100 text-red-600">
                          <Ban className="w-3.5 h-3.5" />
                        </button>

                        <button className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button className="p-1.5 rounded-sm hover:bg-green-100 text-green-600">
                          <BadgeCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between p-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Mostrando 1–10 de {filteredUsers.length}
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button className="px-2.5 py-1 bg-blue-600 text-white rounded-sm text-xs font-medium">
                1
              </button>
              <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-base font-bold text-gray-900">
                Detalhe do Usuário
              </h2>

              <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-100 rounded-sm">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* BASIC */}
              <section>
                <h3 className="font-semibold text-sm mb-3 text-gray-900">
                  Dados Básicos
                </h3>

                <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded-sm p-3">
                  <p className="flex items-center gap-2 text-xs">
                    <User className="w-3 h-3 text-gray-500 shrink-0" /> 
                    <span className="text-gray-600">{selectedUser.name}</span>
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <Mail className="w-3 h-3 text-gray-500 shrink-0" /> 
                    <span className="text-gray-600">{selectedUser.email}</span>
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <Phone className="w-3 h-3 text-gray-500 shrink-0" /> 
                    <span className="text-gray-600">{selectedUser.phone}</span>
                  </p>
                </div>
              </section>

              {/* ADDRESS */}
              <section>
                <h3 className="font-semibold text-sm mb-3 text-gray-900">Endereço</h3>

                <div className="bg-gray-50 rounded-sm p-3 flex items-start gap-2 text-xs">
                  <MapPin className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-gray-600">
                    {selectedUser.region}, {selectedUser.city}, {selectedUser.street}
                  </p>
                </div>
              </section>

              {/* ACTIVITY */}
              <section>
                <h3 className="font-semibold text-sm mb-3 text-gray-900">Atividade</h3>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-sm p-3 border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Lances</p>
                    <h4 className="text-lg font-bold text-blue-600">
                      {selectedUser.bids}
                    </h4>
                  </div>

                  <div className="bg-green-50 rounded-sm p-3 border border-green-100">
                    <p className="text-xs text-gray-600 mb-1">Criados</p>
                    <h4 className="text-lg font-bold text-green-600">
                      {selectedUser.auctionsCreated}
                    </h4>
                  </div>

                  <div className="bg-purple-50 rounded-sm p-3 border border-purple-100">
                    <p className="text-xs text-gray-600 mb-1">Vencidos</p>
                    <h4 className="text-lg font-bold text-purple-600">
                      {selectedUser.auctionsWon}
                    </h4>
                  </div>

                  <div className="bg-gray-50 rounded-sm p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Atividade</p>
                    <h4 className="text-xs font-medium text-gray-900 truncate">
                      {selectedUser.lastActivity}
                    </h4>
                  </div>
                </div>
              </section>

              {/* COMPANY */}
              {selectedUser.company && (
                <section>
                  <h3 className="font-semibold text-sm mb-3 text-gray-900">
                    Dados Empresariais
                  </h3>

                  <div className="bg-gray-50 rounded-sm p-3 space-y-2 text-xs">
                    <p className="flex items-center gap-2">
                      <Building2 className="w-3 h-3 text-gray-500 shrink-0" />
                      <span className="text-gray-600 truncate">{selectedUser.company.name}</span>
                    </p>
                    <p className="text-gray-600"><span className="font-medium text-gray-900">Doc:</span> <span className="text-xs">{selectedUser.company.document}</span></p>
                    <p className="text-gray-600"><span className="font-medium text-gray-900">Ramo:</span> {selectedUser.company.industry}</p>
                  </div>
                </section>
              )}

              {/* SECURITY */}
              <section>
                <h3 className="font-semibold text-sm mb-3 text-gray-900">Alertas</h3>

                <div className="space-y-1.5">
                  {selectedUser.suspicious && (
                    <div className="bg-red-50 text-red-700 p-2.5 rounded-sm flex gap-2 border border-red-100">
                      <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="text-xs">Comportamento suspeito</span>
                    </div>
                  )}

                  {selectedUser.multipleAccounts && (
                    <div className="bg-yellow-50 text-yellow-700 p-2.5 rounded-sm flex gap-2 border border-yellow-100">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="text-xs">Múltiplas contas</span>
                    </div>
                  )}

                  {selectedUser.reports > 0 && (
                    <div className="bg-orange-50 text-orange-700 p-2.5 rounded-sm border border-orange-100">
                      <span className="text-xs font-medium">{selectedUser.reports} denúncias</span>
                    </div>
                  )}

                  {!selectedUser.suspicious && !selectedUser.multipleAccounts && selectedUser.reports === 0 && (
                    <div className="bg-green-50 text-green-700 p-2.5 rounded-sm border border-green-100 text-xs">
                      Usuário sem alertas
                    </div>
                  )}
                </div>
              </section>

              {/* ADMIN ACTIONS */}
              <section className="pb-4">
                <h3 className="font-semibold text-sm mb-3 text-gray-900">
                  Ações
                </h3>

                <div className="grid grid-cols-1 gap-1.5">
                  <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-sm py-1.5 hover:bg-gray-50 text-gray-700 text-xs font-medium transition">
                    <KeyRound className="w-3 h-3" />
                    Resetar senha
                  </button>

                  <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-sm py-1.5 hover:bg-gray-50 text-gray-700 text-xs font-medium transition">
                    <LogOut className="w-3 h-3" />
                    Logout forçado
                  </button>

                  <button className="flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 rounded-sm py-1.5 hover:bg-blue-100 text-blue-600 text-xs font-medium transition">
                    <Bell className="w-3 h-3" />
                    Notificação
                  </button>

                  <button className="flex items-center justify-center gap-2 border border-red-200 rounded-sm py-1.5 hover:bg-red-50 text-red-600 text-xs font-medium transition">
                    <Ban className="w-3 h-3" />
                    Bloquear
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
