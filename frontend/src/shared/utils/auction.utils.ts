import { AuctionStatus } from "../types/auction.types";
export { AuctionStatus };

export function getAuctionStatusLabel(status: AuctionStatus | string): string {
  switch (status) {
    case AuctionStatus.DRAFT:
      return "Rascunho";
    case AuctionStatus.SCHEDULED:
      return "Agendado";
    case AuctionStatus.LIVE:
      return "Ao Vivo";
    case AuctionStatus.ENDED:
      return "Finalizado";
    case AuctionStatus.CANCELLED:
      return "Cancelado";
    case AuctionStatus.SOLD:
      return "Vendido";
    default:
      return status;
  }
}

export function auctionStatusColor(status: AuctionStatus | string): string {
  switch (status) {
    case AuctionStatus.DRAFT:
      return "bg-yellow-50 text-yellow-600 border border-yellow-100";
    case AuctionStatus.SCHEDULED:
      return "bg-blue-50 text-blue-600 border border-blue-100";
    case AuctionStatus.LIVE:
      return "bg-green-50 text-green-600 border border-green-100";
    case AuctionStatus.ENDED:
      return "bg-gray-100 text-gray-600 border border-gray-200";
    case AuctionStatus.CANCELLED:
      return "bg-red-50 text-red-600 border border-red-100";
    case AuctionStatus.SOLD:
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    default:
      return "bg-gray-50 text-gray-500 border border-gray-100";
  }
}

export function formatCurrency(value: number | string, compact?: boolean): string {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numeric)) return "—";
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    notation: compact && numeric >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  }).format(numeric);
}
