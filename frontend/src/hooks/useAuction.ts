import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import auctionService from "@/services/auction.service";
import type {
  AuctionCreatePayload,
  AuctionUpdatePayload,
  AuctionCancelPayload,
  BidCreatePayload,
} from "@/types/auction.types";

export function useAuctionsQuery(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["auctions", params],
    queryFn: async () => {
      const res = await auctionService.list(params);
      if (!res.success) throw new Error(res.message || "Falha ao carregar leilões.");
      return res.data;
    },
  });
}

export function useAuctionQuery(id: number) {
  return useQuery({
    queryKey: ["auction", id],
    queryFn: async () => {
      const res = await auctionService.retrieve(id);
      if (!res.success) throw new Error(res.message || "Falha ao carregar detalhes do leilão.");
      return res.data;
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useAuctionBidsQuery(id: number, params?: Record<string, any>) {
  return useQuery({
    queryKey: ["auctionBids", id, params],
    queryFn: async () => {
      const res = await auctionService.listBids(id, params);
      if (!res.success) throw new Error(res.message || "Falha ao obter lances.");
      return res.data;
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useAuctionStreamsQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: ["auctionStreams", id],
    queryFn: async () => {
      const res = await auctionService.listStreams(id);
      if (!res.success) throw new Error("Falha ao obter transmissões.");
      return res.data;
    },
    enabled: !!id && !isNaN(id) && enabled,
  });
}

export function useCreateAuctionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AuctionCreatePayload) => auctionService.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
      }
    },
  });
}

export function useUpdateAuctionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AuctionUpdatePayload }) =>
      auctionService.update(id, payload),
    onSuccess: (res, { id }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["auction", id] });
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
      }
    },
  });
}

export function useDeleteAuctionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => auctionService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
      }
    },
  });
}

export function useCancelAuctionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AuctionCancelPayload }) =>
      auctionService.cancel(id, payload),
    onSuccess: (res, { id }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["auction", id] });
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
      }
    },
  });
}

export function usePlaceBidMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BidCreatePayload }) =>
      auctionService.placeBid(id, payload),
    onSuccess: (res, { id }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["auction", id] });
        queryClient.invalidateQueries({ queryKey: ["auctionBids", id] });
      }
    },
  });
}

export function useBuyNowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => auctionService.buyNow(id),
    onSuccess: (res, id) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["auction", id] });
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
      }
    },
  });
}
