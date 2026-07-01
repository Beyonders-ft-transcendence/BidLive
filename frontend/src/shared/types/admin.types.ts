import type { User as BaseUser } from "./auth.types";

// Extends the base user to include RBAC specifics for the admin panel
export interface AdminUser extends Omit<BaseUser, "roles" | "permissions"> {
  roles: Role[];
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface AnalyticsStats {
  total_users: number;
  active_auctions: number;
  total_auctions: number;
  total_bids: number;
  total_sales: string | number; 
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Write/Update payloads
export interface RoleWritePayload {
  name: string;
  description?: string;
  permission_names: string[];
}

export interface UserBanPayload {
  status: 'BANNED' | 'SUSPENDED' | 'ACTIVE';
}
