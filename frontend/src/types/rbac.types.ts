import type { PaginatedResponse, UserStatus } from "./auth.types";
import type { ApiResponse } from "./auction.types";

// ============================================================================
// CORE DATA TYPES
// ============================================================================

export interface UserManaged {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  status: UserStatus;
  is_verified: boolean;
  is_active: boolean;
  is_online?: boolean;
  roles: string[]; // SlugRelatedField returning array of role names
  created_at: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[]; // Array of permission names
  users?: number[]; // List of user IDs (returned when detailed)
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  roles: string[]; // Array of role names
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PAYLOADS
// ============================================================================

export interface UserCreatePayload {
  email: string;
  username: string;
  full_name: string;
  password?: string;
  role_names?: string[];
  avatar_url?: string;
  bio?: string;
}

export interface UserUpdatePayload {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  status?: UserStatus;
  is_verified?: boolean;
  is_active?: boolean;
  role_names?: string[];
}

export interface UserBanPayload {
  status: UserStatus;
}

export interface RoleCreatePayload {
  name: string;
  description?: string;
  permission_names?: string[];
}

export interface RoleUpdatePayload {
  name?: string;
  description?: string;
  permission_names?: string[];
}

export interface PermissionCreatePayload {
  name: string;
  description?: string;
}

export interface PermissionUpdatePayload {
  name?: string;
  description?: string;
}

// ============================================================================
// RESPONSES
// ============================================================================

export type UserManagedListResponse = ApiResponse<PaginatedResponse<UserManaged>>;
export type UserManagedDetailResponse = ApiResponse<UserManaged>;
export type RoleListResponse = ApiResponse<PaginatedResponse<Role>>;
export type RoleDetailResponse = ApiResponse<Role>;
export type PermissionListResponse = ApiResponse<PaginatedResponse<Permission>>;
export type PermissionDetailResponse = ApiResponse<Permission>;
