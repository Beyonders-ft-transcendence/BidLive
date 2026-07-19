import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import domainService from "@/services/domain.service";
import type { DomainCreatePayload, DomainUpdatePayload } from "@/shared/types/domain.types";

export function useDomainsQuery(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["domains", params],
    queryFn: async () => {
      const res = await domainService.list(params);
      if (!res.success) throw new Error(res.message || "Falha ao listar domínios.");
      return res.data;
    },
  });
}

export function useDomainQuery(id: number) {
  return useQuery({
    queryKey: ["domain", id],
    queryFn: async () => {
      const res = await domainService.retrieve(id);
      if (!res.success) throw new Error(res.message || "Falha ao obter domínio.");
      return res.data;
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateDomainMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DomainCreatePayload) => domainService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["domains"] });
      }
    },
  });
}

export function useUpdateDomainMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DomainUpdatePayload }) =>
      domainService.update(id, payload),
    onSuccess: (res, { id }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["domain", id] });
        queryClient.invalidateQueries({ queryKey: ["domains"] });
      }
    },
  });
}

export function useDeleteDomainMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => domainService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["domains"] });
      }
    },
  });
}
