export type UserStatus = "Ativo" | "Suspenso" | "Bloqueado";

export function statusColor(status: UserStatus): string {
  switch (status) {
    case "Ativo":
      return "bg-green-100 text-green-600";
    case "Suspenso":
      return "bg-yellow-100 text-yellow-600";
    case "Bloqueado":
      return "bg-red-100 text-red-600";
  }
}

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(name: string): string {
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
