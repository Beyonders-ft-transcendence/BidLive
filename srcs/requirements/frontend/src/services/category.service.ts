import { api } from '@/shared/http/api';
import type { ApiResponse } from '@/shared/types/auction.types';
import type { Category } from '@/shared/types/category.types';

class CategoryService {
  async list(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/categories/');
    return response.data;
  }
}

const categoryService = new CategoryService();
export default categoryService;
