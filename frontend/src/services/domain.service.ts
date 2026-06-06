import api from '../utils/api.utils';
import type { ApiResponse } from '../types/auction.types';
import type { PaginatedResponse } from '../types/auth.types';
import type {
  Domain,
  DomainCreatePayload,
  DomainUpdatePayload,
} from '../types/domain.types';

class DomainService {
  async list(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Domain>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Domain>>>('/domain/', { params });
    return response.data;
  }

  async retrieve(id: number): Promise<ApiResponse<Domain>> {
    const response = await api.get<ApiResponse<Domain>>(`/domain/${id}/`);
    return response.data;
  }

  async create(payload: DomainCreatePayload): Promise<ApiResponse<Domain>> {
    const response = await api.post<ApiResponse<Domain>>('/domain/', payload);
    return response.data;
  }

  async update(id: number, payload: DomainUpdatePayload): Promise<ApiResponse<Domain>> {
    const response = await api.patch<ApiResponse<Domain>>(`/domain/${id}/`, payload);
    return response.data;
  }

  async delete(id: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`/domain/${id}/`);
    return response.data;
  }
}

const domainService = new DomainService();
export default domainService;
