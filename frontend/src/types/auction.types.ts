import type { PaginatedResponse } from "./auth.types";

// ============================================================================
// ENUMS
// ============================================================================

export enum ItemCondition {
  NEW = "NEW",
  USED = "USED",
  REFURBISHED = "REFURBISHED",
  DAMAGED = "DAMAGED",
}

export enum AuctionStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED",
  SOLD = "SOLD",
}

// ============================================================================
// CORE DATA TYPES
// ============================================================================

export interface AuctionCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface FileBrief {
  id: number;
  url: string;
  mime_type: string;
  size: number;
}

export interface AuctionImage {
  id: number;
  file: FileBrief;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface AuctionItem {
  id: number;
  seller: number; // User ID
  title: string;
  description: string;
  category: AuctionCategory | null;
  category_id: number | null;
  category_label: string;
  starting_price: string; // Decimals are string-serialized by DRF
  current_price: string;
  minimum_increment: string;
  reserve_price: string | null;
  buy_now_price: string | null;
  condition_type: ItemCondition;
  images: AuctionImage[];
  created_at: string;
}

export interface Auction {
  id: number;
  item: AuctionItem;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
  status: AuctionStatus;
  winner: number | null; // User ID
  winning_bid: number | null; // Bid ID
  started_at: string | null;
  ended_at: string | null;
  cancelled_at: string | null;
  cancelled_by: number | null;
  cancel_reason: string;
  buy_now_at: string | null;
  buy_now_by: number | null;
  reserve_met: boolean;
  rules: Record<string, any> | null;
  created_at: string;
}

export interface BidderSummary {
  id: number;
  username: string;
  full_name: string;
}

export interface Bid {
  id: number;
  auction: number; // Auction ID
  auction_id: number;
  bidder: BidderSummary | null;
  bidder_id: number;
  amount: string; // Decimal as string
  is_buy_now: boolean;
  ip_address: string;
  metadata: Record<string, any> | null;
  timestamp: string; // ISO 8601 datetime
  created_at: string; // ISO 8601 datetime
}

// ============================================================================
// PAYLOADS
// ============================================================================

export interface AuctionCreatePayload {
  title: string;
  description?: string;
  category_id?: number | null;
  condition_type: ItemCondition;
  starting_price: number | string;
  minimum_increment: number | string;
  reserve_price?: number | string | null;
  buy_now_price?: number | string | null;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
  is_draft?: boolean;
  rules?: Record<string, any>;
  images?: File[];
}

export interface AuctionUpdatePayload {
  description?: string;
  category_id?: number | null;
  start_time?: string;
  end_time?: string;
  buy_now_price?: number | string | null;
  reserve_price?: number | string | null;
  rules?: Record<string, any>;
  images?: File[];
  primary_image_id?: number;
  publish?: boolean;
}

export interface AuctionCancelPayload {
  reason: string;
}

export interface BidCreatePayload {
  amount: number | string;
  metadata?: Record<string, any>;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = never> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export type AuctionListResponse = ApiResponse<PaginatedResponse<Auction>>;
export type AuctionDetailResponse = ApiResponse<Auction>;
export type AuctionCategoryListResponse = ApiResponse<AuctionCategory[]>;
export type BidListResponse = ApiResponse<PaginatedResponse<Bid>>;
export type BidDetailResponse = ApiResponse<Bid>;
