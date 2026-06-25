import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import rbacService from "@/services/rbac.service";
import type {
  UserCreatePayload,
  UserUpdatePayload,
  UserBanPayload,
  RoleCreatePayload,
  RoleUpdatePayload,
  PermissionCreatePayload,
  PermissionUpdatePayload,
} from "@/shared/types/rbac.types";

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export function useUsersQuery(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["rbacUsers", params],
    queryFn: async () => {
      const res = await rbacService.listUsers(params);
      if (!res.success) throw new Error(res.message || "Falha ao listar usuários.");
      return res.data;
    },
  });
}

export function useUserQuery(id: number | string) {
  return useQuery({
    queryKey: ["rbacUser", id],
    queryFn: async () => {
      const res = await rbacService.retrieveUser(id);
      if (!res.success) throw new Error(res.message || "Falha ao obter usuário.");
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => rbacService.createUser(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacUsers"] });
      }
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UserUpdatePayload }) =>
      rbacService.updateUser(id, payload),
    onSuccess: (res, { id }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacUser", id] });
        queryClient.invalidateQueries({ queryKey: ["rbacUsers"] });
      }
    },
  });
}

export function useBanUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UserBanPayload }) =>
      rbacService.banUser(id, payload),
    onSuccess: (res, { id }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacUser", id] });
        queryClient.invalidateQueries({ queryKey: ["rbacUsers"] });
      }
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => rbacService.deleteUser(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacUsers"] });
      }
    },
  });
}

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

export function useRolesQuery(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["rbacRoles", params],
    queryFn: async () => {
      const res = await rbacService.listRoles(params);
      if (!res.success) throw new Error(res.message || "Falha ao listar funções.");
      return res.data;
    },
  });
}

export function useRoleQuery(id: number | string) {
  return useQuery({
    queryKey: ["rbacRole", id],
    queryFn: async () => {
      const res = await rbacService.retrieveRole(id);
      if (!res.success) throw new Error(res.message || "Falha ao obter função.");
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleCreatePayload) => rbacService.createRole(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacRoles"] });
      }
    },
  });
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: RoleUpdatePayload }) =>
      rbacService.updateRole(id, payload),
    onSuccess: (res, { id }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacRole", id] });
        queryClient.invalidateQueries({ queryKey: ["rbacRoles"] });
      }
    },
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => rbacService.deleteRole(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacRoles"] });
      }
    },
  });
}

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================

export function usePermissionsQuery(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["rbacPermissions", params],
    queryFn: async () => {
      const res = await rbacService.listPermissions(params);
      if (!res.success) throw new Error(res.message || "Falha ao listar permissões.");
      return res.data;
    },
  });
}

export function usePermissionQuery(id: number | string) {
  return useQuery({
    queryKey: ["rbacPermission", id],
    queryFn: async () => {
      const res = await rbacService.retrievePermission(id);
      if (!res.success) throw new Error(res.message || "Falha ao obter permissão.");
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PermissionCreatePayload) => rbacService.createPermission(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacPermissions"] });
      }
    },
  });
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: PermissionUpdatePayload }) =>
      rbacService.updatePermission(id, payload),
    onSuccess: (res, { id }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacPermission", id] });
        queryClient.invalidateQueries({ queryKey: ["rbacPermissions"] });
      }
    },
  });
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => rbacService.deletePermission(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["rbacPermissions"] });
      }
    },
  });
}
