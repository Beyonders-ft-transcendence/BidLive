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
  active_users: {
    online_now: number;
    active_last_hour: number;
  };
  bids_activity: {
    bids_per_hour_last_24h: Array<{ hour: string; count: number }>;
  };
  conversion_metrics: {
    auction_conversion_rate_percentage: number;
    bidder_engagement_rate_percentage: number;
    total_ended_auctions: number;
    sold_auctions: number;
    total_active_users: number;
    unique_bidders: number;
  };
  top_event_types: Array<{ event_type: string; count: number }>;
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
  permission_names?: string[];
}

export interface PermissionWritePayload {
  name: string;
  description?: string;
}

export interface UserBanPayload {
  status: 'BANNED' | 'SUSPENDED' | 'ACTIVE';
}

export interface UserCreatePayload {
  email: string;
  username: string;
  full_name: string;
  password?: string;
  role_names?: string[];
  avatar_url?: string;
  bio?: string;
}

// --- Reports (Denúncias) ---
export type ReportStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'IGNORED';

export type ReportReason = 'SPAM' | 'HARASSMENT' | 'SCAM' | 'HATE_SPEECH' | 'FRAUD' | 'INAPPROPRIATE_CONTENT' | 'COPYRIGHT' | 'OTHER';

export type ReportTargetType = 'USER' | 'MESSAGE' | 'PRIVATE_MESSAGE' | 'AUCTION' | 'AUCTION_ITEM' | 'BID' | 'STREAM' | 'FILE';

export type ReportActionType = 'COMMENT' | 'CHANGE_STATUS' | 'WARN_USER' | 'BAN_USER' | 'DELETE_CONTENT' | 'ESCALATE';

export interface ReportReporter {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

export interface ReportAction {
  id: number;
  admin: ReportReporter;
  action: ReportActionType;
  note: string;
  created_at: string;
}

export interface ReportEvidence {
  id: number;
  file: string;
  created_at: string;
}

export interface Report {
  id: number;
  reporter: ReportReporter;
  target_type: ReportTargetType;
  target_id: number;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  actions: ReportAction[];
  evidence: ReportEvidence[];
  created_at: string;
  updated_at: string;
}

export interface ReportActionPayload {
  action: ReportActionType;
  note?: string;
  new_status?: ReportStatus | null;
}

export interface ReportStatusUpdatePayload {
  status: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'IGNORED';
  note?: string;
}

