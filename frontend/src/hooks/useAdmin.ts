import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import type { RoleWritePayload, UserBanPayload, ReportActionPayload, ReportStatusUpdatePayload, PermissionWritePayload } from "@/shared/types/admin.types";
import { toast } from "sonner";

const getErrorMsg = (error: any, fallback: string): string => {
  if (error?.response?.data) {
    if (typeof error.response.data.message === 'string') return error.response.data.message;
    if (typeof error.response.data.detail === 'string') return error.response.data.detail;
    if (Array.isArray(error.response.data.detail) && error.response.data.detail.length > 0) {
      return error.response.data.detail[0].msg || fallback;
    }
  }
  return fallback;
};

export const adminKeys = {
  all: ["admin"] as const,
  users: (page: number, search: string) => [...adminKeys.all, "users", page, search] as const,
  user: (id: number) => [...adminKeys.all, "user", id] as const,
  roles: () => [...adminKeys.all, "roles"] as const,
  permissions: () => [...adminKeys.all, "permissions"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  reports: (status?: string, targetType?: string) => [...adminKeys.all, "reports", status, targetType] as const,
  report: (id: number) => [...adminKeys.all, "report", id] as const,
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
      const msg = getErrorMsg(error, "Erro ao atualizar estado do utilizador");
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
    onError: (error: any) => {
      toast.error(getErrorMsg(error, "Erro ao atualizar utilizador"));
    }
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => adminService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users(1, "") });
      toast.success("Utilizador criado com sucesso");
    },
    onError: (error: any) => {
      const msg = getErrorMsg(error, "Erro ao criar utilizador");
      toast.error(msg);
    }
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users(1, "") });
      toast.success("Utilizador removido com sucesso");
    },
    onError: (error: any) => {
      const msg = getErrorMsg(error, "Erro ao remover utilizador");
      toast.error(msg);
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
    onError: (error: any) => {
      toast.error(getErrorMsg(error, "Erro ao criar perfil de acesso"));
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
    onError: (error: any) => {
      toast.error(getErrorMsg(error, "Erro ao atualizar perfil de acesso"));
    }
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() });
      toast.success("Perfil de acesso removido");
    },
    onError: (error: any) => {
      const msg = getErrorMsg(error, "Erro ao remover perfil de acesso");
      toast.error(msg);
    }
  });
}

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PermissionWritePayload) => adminService.createPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.permissions() });
      toast.success("Permissão criada com sucesso");
    },
    onError: (error: any) => {
      toast.error(getErrorMsg(error, "Erro ao criar permissão"));
    }
  });
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PermissionWritePayload }) => 
      adminService.updatePermission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.permissions() });
      toast.success("Permissão atualizada com sucesso");
    },
    onError: (error: any) => {
      toast.error(getErrorMsg(error, "Erro ao atualizar permissão"));
    }
  });
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.permissions() });
      toast.success("Permissão removida com sucesso");
    },
    onError: (error: any) => {
      const msg = getErrorMsg(error, "Erro ao remover permissão");
      toast.error(msg);
    }
  });
}

export function useAdminReportsQuery(status?: string, targetType?: string) {
  return useQuery({
    queryKey: adminKeys.reports(status, targetType),
    queryFn: () => adminService.getReports(status, targetType),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminReportDetailQuery(id: number) {
  return useQuery({
    queryKey: adminKeys.report(id),
    queryFn: () => adminService.getReportById(id),
    enabled: !!id,
  });
}

export function useUpdateReportStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReportStatusUpdatePayload }) =>
      adminService.updateReportStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success("Estado da denúncia atualizado");
    },
    onError: (error: any) => {
      const msg = getErrorMsg(error, "Erro ao atualizar estado da denúncia");
      toast.error(msg);
    }
  });
}

export function useApplyReportActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReportActionPayload }) =>
      adminService.applyReportAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success("Ação administrativa aplicada com sucesso");
    },
    onError: (error: any) => {
      const msg = getErrorMsg(error, "Erro ao aplicar ação administrativa");
      toast.error(msg);
    }
  });
}

