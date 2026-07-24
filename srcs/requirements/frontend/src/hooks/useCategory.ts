import { useQuery } from "@tanstack/react-query";
import categoryService from "@/services/category.service";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryService.list();
      if (!res.success) throw new Error(res.message || "Falha ao carregar categorias.");
      return res.data;
    },
  });
}
