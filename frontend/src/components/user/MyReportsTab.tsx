import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMyReports } from "@/hooks/useReport";
import { ReportStatus, ReportTargetType } from "@/shared/types/report.types";

export default function MyReportsTab() {
  const { t } = useTranslation();

  const { data: reportsResponse, isLoading } = useMyReports();
  const reports = reportsResponse?.data || [];

  const getStatusInfo = (status: ReportStatus | string) => {
    switch (status) {
      case ReportStatus.OPEN:
        return { label: "Aberto", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", icon: <Clock size={12} /> };
      case ReportStatus.UNDER_REVIEW:
        return { label: "Em Análise", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: <AlertTriangle size={12} /> };
      case ReportStatus.RESOLVED:
        return { label: "Resolvido", color: "text-green-500", bg: "bg-green-500/10 border-green-500/20", icon: <CheckCircle2 size={12} /> };
      case ReportStatus.REJECTED:
      case ReportStatus.IGNORED:
        return { label: "Rejeitado", color: "text-muted-foreground", bg: "bg-muted border-border", icon: <CheckCircle2 size={12} /> };
      default:
        return { label: status, color: "text-muted-foreground", bg: "bg-muted border-border", icon: <Clock size={12} /> };
    }
  };

  const getTargetInfo = (type: string) => {
    switch (type) {
      case ReportTargetType.USER: return "Utilizador";
      case ReportTargetType.AUCTION: return "Leilão";
      case ReportTargetType.MESSAGE: return "Mensagem (Chat)";
      case ReportTargetType.PRIVATE_MESSAGE: return "Mensagem Privada";
      default: return type;
    }
  };

  return (
    <div className="bg-card border border-border rounded-sm shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="p-4 border-b border-border bg-muted/20">
        <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
          <ShieldAlert size={16} className="text-destructive" />
          Minhas Denúncias
        </h3>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm font-semibold">
            A carregar as suas denúncias...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
            <ShieldAlert size={32} className="opacity-30 mb-3" />
            <p className="text-sm font-bold text-foreground">Não submeteu nenhuma denúncia</p>
            <p className="text-[10px] mt-1 max-w-xs">
              As denúncias que fizer contra leilões, utilizadores ou mensagens aparecerão aqui para acompanhamento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Alvo</th>
                  <th className="px-4 py-3">{t('reports_tab.reason')}</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => {
                  const statusInfo = getStatusInfo(report.status);
                  return (
                    <tr key={report.id} className="hover:bg-muted/20 transition-colors text-foreground">
                      <td className="px-4 py-4 font-mono text-[10px]">#{report.id}</td>
                      <td className="px-4 py-4">
                        <span className="font-bold">{getTargetInfo(report.target_type)}</span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">ID: {report.target_id}</span>
                      </td>
                      <td className="px-4 py-4 font-medium">{report.reason}</td>
                      <td className="px-4 py-4 text-[10px] text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border ${statusInfo.bg} ${statusInfo.color} text-[9px] font-black uppercase tracking-wider`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
