"use client";

import Header from "@/components/layout/backoffice/Header";
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

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredUsers = useMemo(() => {
    return usersData.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

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
        <div className="bg-white p-4 rounded-sm shadow-sm mt-4 overflow-hidden">

          {/* SEARCH & FILTERS */}
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
              switch (filterName) {
                case "type":
                  setTypeFilter(value);
                  break;
                case "status":
                  setStatusFilter(value);
                  break;
                case "verification":
                  setVerificationFilter(value);
                  break;
              }
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-300">
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-xs text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition text-xs"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={user.name} size="md" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>

                      <td className="text-xs">{user.email}</td>

                      <td className="text-xs">
                        <span>{user.type}</span>
                      </td>

                      <td className="text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-xs font-medium ${statusColor(
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

                          <button className="p-1.5 rounded-sm hover:bg-red-100 text-red-600">
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          <button className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-700">
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between p-3">
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


    </div>
  );
}
