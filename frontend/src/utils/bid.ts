export type BidStatus = "Válido" | "Vencedor" | "Superado" | "Cancelado";

export function bidStatusColor(status: BidStatus): string {
  switch (status) {
    case "Vencedor":
      return "bg-green-100 text-green-600";
    case "Válido":
      return "bg-blue-100 text-blue-600";
    case "Superado":
      return "bg-gray-100 text-gray-500";
    case "Cancelado":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
