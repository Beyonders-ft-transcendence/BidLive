import api from '../utils/api.utils';
import type {
  Auction,
  AuctionCategory,
  AuctionCreatePayload,
  AuctionUpdatePayload,
  AuctionCancelPayload,
  Bid,
  BidCreatePayload,
  ApiResponse,
} from '../types/auction.types';
import type { PaginatedResponse } from '../types/auth.types';

class AuctionService {
  private toFormData(payload: Record<string, any>): FormData {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else {
        formData.append(key, String(value));
      }
    });
    return formData;
  }

  async list(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Auction>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Auction>>>('/auctions/', { params });
    return response.data;
  }

  async retrieve(id: number): Promise<ApiResponse<Auction>> {
    const response = await api.get<ApiResponse<Auction>>(`/auctions/${id}/`);
    return response.data;
  }

  async create(payload: AuctionCreatePayload): Promise<ApiResponse<Auction>> {
    let data: any = payload;
    let headers = {};

    if (payload.images && payload.images.length > 0) {
      data = this.toFormData(payload);
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await api.post<ApiResponse<Auction>>('/auctions/', data, { headers });
    return response.data;
  }

  async update(id: number, payload: AuctionUpdatePayload): Promise<ApiResponse<Auction>> {
    let data: any = payload;
    let headers = {};

    if (payload.images && payload.images.length > 0) {
      data = this.toFormData(payload);
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await api.patch<ApiResponse<Auction>>(`/auctions/${id}/`, data, { headers });
    return response.data;
  }

  async delete(id: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`/auctions/${id}/`);
    return response.data;
  }

  async cancel(id: number, payload: AuctionCancelPayload): Promise<ApiResponse<Auction>> {
    const response = await api.post<ApiResponse<Auction>>(`/auctions/${id}/cancel/`, payload);
    return response.data;
  }

  async buyNow(id: number): Promise<ApiResponse<Auction>> {
    const response = await api.post<ApiResponse<Auction>>(`/auctions/${id}/buy-now/`);
    return response.data;
  }

  async watch(id: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.post<ApiResponse<Record<string, never>>>(`/auctions/${id}/watch/`);
    return response.data;
  }

  async unwatch(id: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`/auctions/${id}/watch/`);
    return response.data;
  }

  async listBids(id: number, params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Bid>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Bid>>>(`/auctions/${id}/bids/`, { params });
    return response.data;
  }

  async placeBid(id: number, payload: BidCreatePayload): Promise<ApiResponse<Bid>> {
    const response = await api.post<ApiResponse<Bid>>(`/auctions/${id}/bids/`, payload);
    return response.data;
  }

  async listCategories(): Promise<ApiResponse<AuctionCategory[]>> {
    const response = await api.get<ApiResponse<AuctionCategory[]>>('/categories/');
    return response.data;
  }
}

const auctionService = new AuctionService();
export default auctionService;
