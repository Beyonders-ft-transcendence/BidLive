import { api } from "@/shared/http/api";
import type { 
  AdminUser, 
  Role, 
  Permission, 
  AnalyticsStats, 
  RoleWritePayload, 
  UserBanPayload,
  PaginatedResponse 
} from "@/shared/types/admin.types";

export const adminService = {
  // --- Users ---
  getUsers: async (page = 1, search = ""): Promise<PaginatedResponse<AdminUser>> => {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append("search", search);
    const response = await api.get(`/users/?${params.toString()}`);
    return response.data;
  },

  getUserById: async (id: number): Promise<AdminUser> => {
    const response = await api.get(`/users/${id}/`);
    return response.data.data;
  },

  updateUser: async (id: number, data: any): Promise<AdminUser> => {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data.data;
  },

  banUser: async (id: number, payload: UserBanPayload): Promise<AdminUser> => {
    const response = await api.post(`/users/${id}/ban/`, payload);
    return response.data.data;
  },

  hardDeleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}/hard-delete/`);
  },

  // --- Roles ---
  getRoles: async (): Promise<PaginatedResponse<Role> | Role[]> => {
    const response = await api.get("/roles/");
    return response.data.data || response.data;
  },

  createRole: async (payload: RoleWritePayload): Promise<Role> => {
    const response = await api.post("/roles/", payload);
    return response.data.data;
  },

  updateRole: async (id: number, payload: RoleWritePayload): Promise<Role> => {
    const response = await api.patch(`/roles/${id}/`, payload);
    return response.data.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}/`);
  },

  // --- Permissions ---
  getPermissions: async (): Promise<PaginatedResponse<Permission> | Permission[]> => {
    const response = await api.get("/permissions/");
    return response.data.data || response.data;
  },

  // --- Analytics ---
  getStats: async (): Promise<AnalyticsStats> => {
    const response = await api.get("/analytics/stats/");
    return response.data.data;
  }
};

export default adminService;
