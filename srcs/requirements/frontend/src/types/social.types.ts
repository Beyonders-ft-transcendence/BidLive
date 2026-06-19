import type { ApiResponse } from "./auction.types";

// ============================================================================
// ENUMS
// ============================================================================

export enum FriendshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  BLOCKED = "BLOCKED",
}

// ============================================================================
// CORE DATA TYPES
// ============================================================================

export interface PublicUser {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_online: boolean;
  is_verified: boolean;
  last_seen: string | null; // ISO 8601 datetime
}

export interface Friendship {
  id: number;
  requester: PublicUser;
  addressee: PublicUser;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PAYLOADS
// ============================================================================

export interface FriendshipCreatePayload {
  addressee_id: number;
}

export interface BlockUserPayload {
  user_id: number;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export type PublicUserListResponse = ApiResponse<PublicUser[]>;
export type FriendshipDetailResponse = ApiResponse<Friendship>;
export type FriendshipListResponse = ApiResponse<Friendship[]>;
