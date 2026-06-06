import api from '../utils/api.utils';
import type { ApiResponse } from '../types/auction.types';
import type { Category } from '../types/category.types';

class CategoryService {
  async list(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/categories/');
    return response.data;
  }
}

const categoryService = new CategoryService();
export default categoryService;
