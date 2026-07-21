import { useAuthStore } from "@/shared/stores/auth.store";
import { UserRole } from "@/shared/types/auth.types";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom Hook para Verificação de Permissões RBAC no Frontend.
 * Garante que se o administrador alterar as permissões de um perfil/role no backend,
 * o utilizador tem as permissões revalidadas em tempo real.
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  // Re-fetch automático das informações do utilizador ao focar a janela ou periodicamente
  useQuery({
    queryKey: ["currentUserPermissions", user?.id],
    queryFn: async () => {
      if (isAuthenticated) {
        await fetchMe();
      }
      return true;
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
  });

  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];

  // Helper para verificar se possui role
  const hasRole = (roleName: string | UserRole): boolean => {
    if (!user || !userRoles) return false;
    return userRoles.some((r: any) => {
      if (typeof r === "string") return r.toUpperCase() === roleName.toUpperCase();
      if (typeof r === "object" && r !== null && r.name) {
        return r.name.toUpperCase() === roleName.toUpperCase();
      }
      return false;
    });
  };

  const isSuperAdmin = hasRole(UserRole.SUPER_ADMIN) || (user?.is_staff ?? false);
  const isMonitor = hasRole(UserRole.MONITOR);
  const isAdminOrMonitor = isSuperAdmin || isMonitor;

  // Helper para verificar uma permissão específica
  const hasPermission = (permissionCodename: string): boolean => {
    if (!user || !isAuthenticated) return false;
    
    // Super Administradores possuem acesso irrestrito
    if (isSuperAdmin) return true;

    // Verificar na lista de permissões diretas do utilizador
    if (Array.isArray(userPermissions)) {
      if (userPermissions.includes("*") || userPermissions.includes(permissionCodename)) {
        return true;
      }
      // Suporte para wildcard ex: 'auction.*'
      const category = permissionCodename.split(".")[0];
      if (category && userPermissions.includes(`${category}.*`)) {
        return true;
      }
    }

    return false;
  };

  // Helper para verificar se possui QUALQUER uma das permissões da lista
  const hasAnyPermission = (permissionsList: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionsList.some((perm) => hasPermission(perm));
  };

  // Helper para verificar se possui TODAS as permissões da lista
  const hasAllPermissions = (permissionsList: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionsList.every((perm) => hasPermission(perm));
  };

  return {
    user,
    isAuthenticated,
    isSuperAdmin,
    isMonitor,
    isAdminOrMonitor,
    userRoles,
    userPermissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
