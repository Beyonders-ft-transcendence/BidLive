import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import socialService from "@/services/social.service";
import type { FriendshipCreatePayload, BlockUserPayload } from "@/shared/types/social.types";

export function useFriendsQuery() {
  return useQuery({
    queryKey: ["socialFriends"],
    queryFn: async () => {
      const res = await socialService.listFriends();
      if (!res.success) throw new Error(res.message || "Falha ao obter lista de amigos.");
      return res.data;
    },
  });
}

export function usePendingRequestsReceivedQuery() {
  return useQuery({
    queryKey: ["socialPendingRequestsReceived"],
    queryFn: async () => {
      const res = await socialService.listPendingRequestsReceived();
      if (!res.success) throw new Error(res.message || "Falha ao obter convites recebidos.");
      return res.data;
    },
  });
}

export function usePendingRequestsSentQuery() {
  return useQuery({
    queryKey: ["socialPendingRequestsSent"],
    queryFn: async () => {
      const res = await socialService.listPendingRequestsSent();
      if (!res.success) throw new Error(res.message || "Falha ao obter convites enviados.");
      return res.data;
    },
  });
}

export function useOnlineFriendsQuery() {
  return useQuery({
    queryKey: ["socialOnlineFriends"],
    queryFn: async () => {
      const res = await socialService.listOnlineFriends();
      if (!res.success) throw new Error(res.message || "Falha ao obter amigos online.");
      return res.data;
    },
  });
}

export function useSendFriendRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FriendshipCreatePayload) => socialService.sendFriendRequest(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["socialPendingRequestsSent"] });
      }
    },
  });
}

export function useRemoveFriendMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: number) => socialService.removeFriend(friendshipId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["socialFriends"] });
        queryClient.invalidateQueries({ queryKey: ["socialOnlineFriends"] });
      }
    },
  });
}

export function useAcceptFriendRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: number) => socialService.acceptFriendRequest(friendshipId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["socialFriends"] });
        queryClient.invalidateQueries({ queryKey: ["socialPendingRequestsReceived"] });
        queryClient.invalidateQueries({ queryKey: ["socialOnlineFriends"] });
      }
    },
  });
}

export function useRejectFriendRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: number) => socialService.rejectFriendRequest(friendshipId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["socialPendingRequestsReceived"] });
      }
    },
  });
}

export function useBlockedUsersQuery() {
  return useQuery({
    queryKey: ["socialBlockedUsers"],
    queryFn: async () => {
      const res = await socialService.listBlockedUsers();
      if (!res.success) throw new Error(res.message || "Falha ao obter utilizadores bloqueados.");
      return res.data;
    },
  });
}

export function useBlockUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BlockUserPayload) => socialService.blockUser(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["socialBlockedUsers"] });
        queryClient.invalidateQueries({ queryKey: ["socialFriends"] });
        queryClient.invalidateQueries({ queryKey: ["socialOnlineFriends"] });
        queryClient.invalidateQueries({ queryKey: ["socialPendingRequestsReceived"] });
        queryClient.invalidateQueries({ queryKey: ["socialPendingRequestsSent"] });
      }
    },
  });
}

export function useUnblockUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BlockUserPayload) => socialService.unblockUser(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["socialBlockedUsers"] });
        queryClient.invalidateQueries({ queryKey: ["socialFriends"] });
        queryClient.invalidateQueries({ queryKey: ["socialOnlineFriends"] });
      }
    },
  });
}

export function useUserSearchQuery(query: string) {
  return useQuery({
    queryKey: ["usersSearch", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await socialService.searchUsers(query);
      if (!res.success) throw new Error(res.message || "Falha na pesquisa de utilizadores.");
      return res.data?.results || [];
    },
    enabled: query.trim().length > 0,
  });
}
