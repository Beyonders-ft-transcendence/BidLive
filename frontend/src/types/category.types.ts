import type { ApiResponse } from "./auction.types";

// ============================================================================
// CORE DATA TYPES
// ============================================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  is_active: boolean;
  sort_order: number;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export type CategoryListResponse = ApiResponse<Category[]>;
