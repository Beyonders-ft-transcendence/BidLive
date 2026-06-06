"use client";

import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import TableSection from "@/components/common/TableSection";
import { reportStatusColor, reportSeverityColor, ReportType, ReportStatus, ReportSeverity } from "@/utils/report";
import {
  Eye,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Trash2,
  AlertTriangle,
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

  const handleResolveReport = (action: string) => {
    if (!selectedReport) return;
    setReports((prev) =>
      prev.map((rep) =>
        rep.id === selectedReport.id ? { ...rep, status: "Resolvido" } : rep
      )
    );
    setSelectedReport(null);
    alert(`Ação de moderação registrada localmente: "${action}" para denúncia ${selectedReport.id}`);
  };

  const filtersSlot = (
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
  );

  return (
    <div className="flex flex-col gap-5 p-1 select-none">
      
      {/* HEADER */}
      <ActionCard
        title="Sistema de Denúncias"
        subtitle="Monitore as denúncias enviadas por usuários contra anúncios fraudulentos, lances suspeitos ou comportamentos inadequados."
      />

      {/* WARNING BANNER */}
      <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs p-4 rounded-sm flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold mb-1">Módulo de Moderação (Simulado)</strong>
          <span>
            Os modelos de denúncia existem no banco de dados, mas as rotas da API no Django ainda não foram registradas.
            As ações abaixo serão simuladas localmente até que o backend finalize a liberação dos endpoints `/reports/`.
          </span>
        </div>
      </div>

      {/* TABLE */}
      <TableSection
        filters={filtersSlot}
        entityName="denúncias"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
              <th className="p-3">Tipo</th>
              <th className="py-3">Alvo da Denúncia</th>
              <th className="py-3">Denunciante</th>
              <th className="py-3">Motivo</th>
              <th className="py-3">Gravidade</th>
              <th className="py-3">Status</th>
              <th className="py-3">Data</th>
              <th className="py-3 text-right pr-6">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-[10px] text-gray-700">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400 font-medium">
                  Nenhuma denúncia encontrada.
                </td>
              </tr>
            ) : (
              filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-gray-500 font-bold">
                      {getTypeIcon(rep.type)}
                      <span>{rep.type}</span>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-gray-950">{rep.targetName}</td>
                  <td className="py-3 text-gray-600">{rep.reporterName}</td>
                  <td className="py-3 text-red-600 font-bold">{rep.reason}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 font-bold">
                      <AlertTriangle className={`w-3 h-3 ${reportSeverityColor(rep.severity)}`} />
                      <span className={reportSeverityColor(rep.severity)}>{rep.severity}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${reportStatusColor(rep.status)}`}>
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 font-bold">{rep.createdAt}</td>
                  <td className="py-3 text-right pr-6">
                    <button
                      onClick={() => setSelectedReport(rep)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/5 text-primary border border-primary/10 rounded-sm hover:bg-primary/10 transition font-bold text-[9px] uppercase cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      Analisar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableSection>

      {/* ANALYSIS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-sm max-w-2xl w-full p-8 shadow-2xl relative animate-in zoom-in duration-200">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider mb-2">Analisar Denúncia {selectedReport.id}</h2>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase ${reportStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                  <span className={`flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase bg-gray-100 text-gray-600`}>
                    {selectedReport.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-2">Detalhes da Denúncia</h3>
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                    <p className="text-sm font-bold text-red-600 mb-2">{selectedReport.reason}</p>
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{selectedReport.description}"</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-2">Denunciante</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-sm bg-primary/5 text-primary border border-primary/10 flex items-center justify-center font-bold text-[10px]">
                      {selectedReport.reporterName[0]}
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{selectedReport.reporterName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-2">Alvo da Denúncia ({selectedReport.type})</h3>
                  <div className="bg-primary/5 p-4 rounded-sm border border-primary/10">
                    <p className="text-xs font-bold text-gray-950">{selectedReport.targetName}</p>
                    <p className="text-[8px] font-bold text-primary font-mono mt-1">ID: {selectedReport.targetId}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-4">Ações de Moderação</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedReport.type === "Leilão" && (
                  <button
                    onClick={() => handleResolveReport("Suspender Leilão")}
                    className="flex flex-col items-center justify-center p-4 border border-yellow-100 bg-yellow-50/50 rounded-sm hover:bg-yellow-50 transition gap-2 text-yellow-700 cursor-pointer"
                  >
                    <ShieldAlert className="w-5 h-5" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Suspender Leilão</span>
                  </button>
                )}
                
                {selectedReport.type === "Mensagem" && (
                  <button
                    onClick={() => handleResolveReport("Remover Conteúdo")}
                    className="flex flex-col items-center justify-center p-4 border border-red-100 bg-red-50/50 rounded-sm hover:bg-red-50 transition gap-2 text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Remover Conteúdo</span>
                  </button>
                )}

                <button
                  onClick={() => handleResolveReport("Banir Usuário")}
                  className="flex flex-col items-center justify-center p-4 border border-red-100 bg-red-50/50 rounded-sm hover:bg-red-50 transition gap-2 text-red-700 cursor-pointer"
                >
                  <Ban className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Banir Usuário</span>
                </button>

                <button
                  onClick={() => handleResolveReport("Ignorar Denúncia")}
                  className="flex flex-col items-center justify-center p-4 border border-green-100 bg-green-50/50 rounded-sm hover:bg-green-50 transition gap-2 text-green-700 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Ignorar / Arquivar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
