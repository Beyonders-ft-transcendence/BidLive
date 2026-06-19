export type ReportType = "Leilão" | "Usuário" | "Mensagem";
export type ReportStatus = "Pendente" | "Em Análise" | "Resolvido" | "Arquivado";
export type ReportSeverity = "Baixa" | "Média" | "Alta" | "Crítica";

export function reportStatusColor(status: ReportStatus): string {
  switch (status) {
    case "Pendente":
      return "bg-yellow-100 text-yellow-600";
    case "Em Análise":
      return "bg-blue-100 text-blue-600";
    case "Resolvido":
      return "bg-green-100 text-green-600";
    case "Arquivado":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function reportSeverityColor(severity: ReportSeverity): string {
  switch (severity) {
    case "Baixa":
      return "text-blue-500";
    case "Média":
      return "text-yellow-500";
    case "Alta":
      return "text-orange-500";
    case "Crítica":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}
