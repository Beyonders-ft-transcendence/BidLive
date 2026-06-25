import type { PaginatedResponse } from "./auth.types";
import type { ApiResponse } from "./auction.types";

// ============================================================================
// TYPES & ENUMS
// ============================================================================

export type DomainStatus = "draft" | "active" | "paused" | "completed";

// ============================================================================
// CORE DATA TYPES
// ============================================================================

export interface Domain {
  id: number;
  owner: number; // User ID
  owner_email: string;
  name: string;
  description: string;
  status: DomainStatus;
  budget: string; // Decimals are string-serialized by DRF
  is_archived: boolean;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

// ============================================================================
// PAYLOADS
// ============================================================================

export interface DomainCreatePayload {
  name: string;
  description?: string;
  status?: DomainStatus;
  budget?: number | string;
}

export interface DomainUpdatePayload {
  name?: string;
  description?: string;
  status?: DomainStatus;
  budget?: number | string;
  is_archived?: boolean;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export type DomainListResponse = ApiResponse<PaginatedResponse<Domain>>;
export type DomainDetailResponse = ApiResponse<Domain>;
