export function statusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
    case "Ativo":
      return "bg-green-100 text-green-600 border border-green-200/30";
    case "SUSPENDED":
    case "Suspenso":
      return "bg-yellow-100 text-yellow-600 border border-yellow-200/30";
    case "BANNED":
    case "Bloqueado":
      return "bg-red-100 text-red-600 border border-red-200/30";
    default:
      return "bg-gray-100 text-gray-500 border border-gray-200/30";
  }
}

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 0 || !parts[0]) return "U";
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
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
