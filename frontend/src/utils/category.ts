export type CategoryStatus = "Ativo" | "Inativo";

export function categoryStatusColor(status: CategoryStatus): string {
  switch (status) {
    case "Ativo":
      return "bg-green-100 text-green-600";
    case "Inativo":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
