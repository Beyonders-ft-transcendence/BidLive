export type AuctionStatus =
  | "Aguardando Aprovação"
  | "Ativo"
  | "Ao Vivo"
  | "Finalizado"
  | "Cancelado"
  | "Pausado"
  | "Privado";

export function auctionStatusColor(status: AuctionStatus): string {
  switch (status) {
    case "Aguardando Aprovação":
      return "bg-yellow-100 text-yellow-600";
    case "Ativo":
      return "bg-green-100 text-green-600";
    case "Ao Vivo":
      return "bg-red-100 text-red-600";
    case "Finalizado":
      return "bg-blue-100 text-blue-600";
    case "Cancelado":
      return "bg-red-100 text-red-600";
    case "Pausado":
      return "bg-gray-100 text-gray-600";
    case "Privado":
      return "bg-purple-100 text-purple-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value);
}
