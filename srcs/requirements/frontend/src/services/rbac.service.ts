import { api } from '@/shared/http/api';
import type { ApiResponse } from '@/shared/types/auction.types';
import type { PaginatedResponse } from '@/shared/types/auth.types';
import type {
  UserManaged,
  Role,
  Permission,
  UserCreatePayload,
  UserUpdatePayload,
  UserBanPayload,
  RoleCreatePayload,
  RoleUpdatePayload,
  PermissionCreatePayload,
  PermissionUpdatePayload,
} from '@/shared/types/rbac.types';

class RbacService {
  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async listUsers(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<UserManaged>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<UserManaged>>>('/users/', { params });
    return response.data;
  }

  async retrieveUser(id: number | string): Promise<ApiResponse<UserManaged>> {
    const response = await api.get<ApiResponse<UserManaged>>(`/users/${id}/`);
    return response.data;
  }

  async createUser(payload: UserCreatePayload): Promise<ApiResponse<UserManaged>> {
    const response = await api.post<ApiResponse<UserManaged>>('/users/', payload);
    return response.data;
  }

  async updateUser(id: number | string, payload: UserUpdatePayload): Promise<ApiResponse<UserManaged>> {
    const response = await api.patch<ApiResponse<UserManaged>>(`/users/${id}/`, payload);
    return response.data;
  }

  async banUser(id: number | string, payload: UserBanPayload): Promise<ApiResponse<UserManaged>> {
    const response = await api.post<ApiResponse<UserManaged>>(`/users/${id}/ban/`, payload);
    return response.data;
  }

  async deleteUser(id: number | string): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`/users/${id}/`);
    return response.data;
  }

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  async listRoles(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Role>>>('/roles/', { params });
    return response.data;
  }

  async retrieveRole(id: number | string): Promise<ApiResponse<Role>> {
    const response = await api.get<ApiResponse<Role>>(`/roles/${id}/`);
    return response.data;
  }

  async createRole(payload: RoleCreatePayload): Promise<ApiResponse<Role>> {
    const response = await api.post<ApiResponse<Role>>('/roles/', payload);
    return response.data;
  }

  async updateRole(id: number | string, payload: RoleUpdatePayload): Promise<ApiResponse<Role>> {
    const response = await api.patch<ApiResponse<Role>>(`/roles/${id}/`, payload);
    return response.data;
  }

  async deleteRole(id: number | string): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`/roles/${id}/`);
    return response.data;
  }

  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================

  async listPermissions(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Permission>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Permission>>>('/permissions/', { params });
    return response.data;
  }

  async retrievePermission(id: number | string): Promise<ApiResponse<Permission>> {
    const response = await api.get<ApiResponse<Permission>>(`/permissions/${id}/`);
    return response.data;
  }

  async createPermission(payload: PermissionCreatePayload): Promise<ApiResponse<Permission>> {
    const response = await api.post<ApiResponse<Permission>>('/permissions/', payload);
    return response.data;
  }

  async updatePermission(id: number | string, payload: PermissionUpdatePayload): Promise<ApiResponse<Permission>> {
    const response = await api.patch<ApiResponse<Permission>>(`/permissions/${id}/`, payload);
    return response.data;
  }

  async deletePermission(id: number | string): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`/permissions/${id}/`);
    return response.data;
  }
}

const rbacService = new RbacService();
export default rbacService;
