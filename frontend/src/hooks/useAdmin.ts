import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import type { RoleWritePayload, UserBanPayload } from "@/shared/types/admin.types";
import { toast } from "sonner";

export const adminKeys = {
  all: ["admin"] as const,
  users: (page: number, search: string) => [...adminKeys.all, "users", page, search] as const,
  user: (id: number) => [...adminKeys.all, "user", id] as const,
  roles: () => [...adminKeys.all, "roles"] as const,
  permissions: () => [...adminKeys.all, "permissions"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
};

export function useAdminUsersQuery(page = 1, search = "") {
  return useQuery({
    queryKey: adminKeys.users(page, search),
    queryFn: () => adminService.getUsers(page, search),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAdminUserDetailQuery(id: number) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => adminService.getUserById(id),
    enabled: !!id,
  });
}

export function useAdminRolesQuery() {
  return useQuery({
    queryKey: adminKeys.roles(),
    queryFn: () => adminService.getRoles(),
  });
}

export function useAdminPermissionsQuery() {
  return useQuery({
    queryKey: adminKeys.permissions(),
    queryFn: () => adminService.getPermissions(),
  });
}

export function usePlatformStatsQuery() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getStats(),
  });
}

// --- Mutations ---

export function useBanUserMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserBanPayload }) => 
      adminService.banUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users(1, "") });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.id) });
      toast.success("Estado do utilizador atualizado com sucesso");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Erro ao atualizar estado do utilizador";
      toast.error(msg);
    }
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => 
      adminService.updateUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users(1, "") });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.id) });
      toast.success("Utilizador atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar utilizador");
    }
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RoleWritePayload) => adminService.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() });
      toast.success("Perfil de acesso (Role) criado");
    },
    onError: () => {
      toast.error("Erro ao criar perfil de acesso");
    }
  });
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RoleWritePayload }) => 
      adminService.updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() });
      toast.success("Perfil de acesso (Role) atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil de acesso");
    }
  });
}
