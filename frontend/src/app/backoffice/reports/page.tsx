"use client";

import Header from "@/components/layout/backoffice/Header";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import { reportStatusColor, reportSeverityColor, ReportType, ReportStatus, ReportSeverity } from "@/utils/report";
import {
  Eye,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Trash2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  Gavel,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ReportData {
  id: string;
  type: ReportType;
  targetId: string;
  targetName: string;
  reporterName: string;
  reason: string;
  description: string;
  severity: ReportSeverity;
  status: ReportStatus;
  createdAt: string;
}

const initialReports: ReportData[] = [
  {
    id: "REP-5001",
    type: "Leilão",
    targetId: "AUC-1005",
    targetName: "Lote de Terreno - Benfica",
    reporterName: "João Manuel",
    reason: "Possível Fraude",
    description: "O vendedor está pedindo pagamento antecipado fora da plataforma.",
    severity: "Crítica",
    status: "Pendente",
    createdAt: "09 Mai 2025, 14:20",
  },
  {
    id: "REP-5002",
    type: "Usuário",
    targetId: "USR-1003",
    targetName: "Carlos Mendes",
    reporterName: "Maria Silva",
    reason: "Lances Falsos",
    description: "Este usuário está dando lances em seus próprios itens com outra conta.",
    severity: "Alta",
    status: "Em Análise",
    createdAt: "08 Mai 2025, 10:15",
  },
  {
    id: "REP-5003",
    type: "Mensagem",
    targetId: "MSG-9002",
    targetName: "Chat Leilão #1001",
    reporterName: "Pedro Afonso",
    reason: "Linguagem Ofensiva",
    description: "O usuário proferiu insultos após perder um lance.",
    severity: "Baixa",
    status: "Resolvido",
    createdAt: "07 Mai 2025, 22:45",
  },
  {
    id: "REP-5004",
    type: "Leilão",
    targetId: "AUC-2004",
    targetName: "Rolex Submariner (Cópia)",
    reporterName: "Expert Watches",
    reason: "Item Falsificado",
    description: "Anunciado como original, mas é claramente uma réplica.",
    severity: "Alta",
    status: "Pendente",
    createdAt: "09 Mai 2025, 08:30",
  },
];

export default function Reports() {
  const [reports, setReports] = useState<ReportData[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchSearch =
        rep.targetName.toLowerCase().includes(search.toLowerCase()) ||
        rep.reporterName.toLowerCase().includes(search.toLowerCase()) ||
        rep.reason.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter ? rep.type === typeFilter : true;
      const matchStatus = statusFilter ? rep.status === statusFilter : true;

      return matchSearch && matchType && matchStatus;
    });
  }, [reports, search, typeFilter, statusFilter]);

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case "Leilão": return <Gavel className="w-3.5 h-3.5" />;
      case "Usuário": return <User className="w-3.5 h-3.5" />;
      case "Mensagem": return <MessageSquare className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <ActionCard
          title="Sistema de Denúncias"
          buttonLabel="Ver Regras da Plataforma"
          buttonVariant="outline"
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
            }}
            onFilterChange={(filterName, value) => {
              if (filterName === "type") setTypeFilter(value);
              if (filterName === "status") setStatusFilter(value);
            }}
            onClearFilters={() => {
              setSearch("");
              setTypeFilter("");
              setStatusFilter("");
            }}
            filterOptions={{
              typeOptions: [
                { value: "", label: "Todos os Tipos" },
                { value: "Leilão", label: "Leilões" },
                { value: "Usuário", label: "Usuários" },
                { value: "Mensagem", label: "Mensagens" },
              ],
              statusOptions: [
                { value: "", label: "Todos os Status" },
                { value: "Pendente", label: "Pendentes" },
                { value: "Em Análise", label: "Em Análise" },
                { value: "Resolvido", label: "Resolvidos" },
                { value: "Arquivado", label: "Arquivados" },
              ],
            }}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-300">
              <thead className="bg-gray-50 text-left">
                <tr className="text-xs text-gray-600 border-b border-gray-200">
                  <th className="p-3">Tipo</th>
                  <th className="text-xs">Alvo da Denúncia</th>
                  <th className="text-xs">Denunciante</th>
                  <th className="text-xs">Motivo</th>
                  <th className="text-xs">Gravidade</th>
                  <th className="text-xs">Status</th>
                  <th className="text-xs">Data</th>
                  <th className="text-xs">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-xs text-gray-500">
                      Nenhuma denúncia encontrada
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep) => (
                    <tr
                      key={rep.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition text-xs"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-gray-500">
                          {getTypeIcon(rep.type)}
                          <span>{rep.type}</span>
                        </div>
                      </td>

                      <td className="text-xs font-medium text-gray-900">{rep.targetName}</td>

                      <td className="text-xs text-gray-600">{rep.reporterName}</td>

                      <td className="text-xs text-red-600 font-medium">{rep.reason}</td>

                      <td className="text-xs">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className={`w-3 h-3 ${reportSeverityColor(rep.severity)}`} />
                          <span className={reportSeverityColor(rep.severity)}>{rep.severity}</span>
                        </div>
                      </td>

                      <td className="text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${reportStatusColor(
                            rep.status
                          )}`}
                        >
                          {rep.status}
                        </span>
                      </td>

                      <td className="text-xs text-gray-500">{rep.createdAt}</td>

                      <td className="text-xs">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-sm hover:bg-blue-100 transition font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Analisar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between p-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Mostrando 1–4 de {filteredReports.length}
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button className="px-2.5 py-1 bg-blue-600 text-white rounded-sm text-xs font-medium shadow-sm">
                1
              </button>
              <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ANÁLISE */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-2xl w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Analisar Denúncia #{selectedReport.id}</h2>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${reportStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase bg-gray-100 text-gray-600`}>
                    {selectedReport.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Detalhes da Denúncia</h3>
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                    <p className="text-sm font-bold text-red-600 mb-2">{selectedReport.reason}</p>
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{selectedReport.description}"</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Denunciante</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {selectedReport.reporterName[0]}
                    </div>
                    <span className="text-sm font-medium">{selectedReport.reporterName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Alvo da Denúncia ({selectedReport.type})</h3>
                  <div className="bg-blue-50 p-4 rounded-sm border border-blue-100">
                    <p className="text-sm font-bold text-blue-900">{selectedReport.targetName}</p>
                    <p className="text-[10px] text-blue-600 mt-1">ID: {selectedReport.targetId}</p>
                    <button className="mt-3 text-[10px] flex items-center gap-1 text-blue-700 font-bold uppercase hover:underline">
                      <Eye className="w-3 h-3" /> Ver {selectedReport.type} na Plataforma
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-xs font-bold text-gray-900 mb-4">Tomar Providências</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedReport.type === "Leilão" && (
                  <button className="flex flex-col items-center justify-center p-4 border border-yellow-200 bg-yellow-50 rounded-sm hover:bg-yellow-100 transition gap-2 text-yellow-700">
                    <ShieldAlert className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase">Suspender Leilão</span>
                  </button>
                )}
                
                {selectedReport.type === "Mensagem" && (
                  <button className="flex flex-col items-center justify-center p-4 border border-red-200 bg-red-50 rounded-sm hover:bg-red-100 transition gap-2 text-red-700">
                    <Trash2 className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase">Remover Conteúdo</span>
                  </button>
                )}

                <button className="flex flex-col items-center justify-center p-4 border border-red-200 bg-red-50 rounded-sm hover:bg-red-100 transition gap-2 text-red-700">
                  <Ban className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Banir Usuário</span>
                </button>

                <button className="flex flex-col items-center justify-center p-4 border border-green-200 bg-green-50 rounded-sm hover:bg-green-100 transition gap-2 text-green-700">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Ignorar / Arquivar</span>
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-sm border border-gray-200"
              >
                Cancelar
              </button>
              <button className="px-6 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-sm shadow-sm transition">
                Confirmar Ação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
