import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import notificationService from "@/services/notification.service";
import { useAuthStore } from "@/shared/stores/auth.store";

export function useNotificationsQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getMyNotifications(),
    enabled: isAuthenticated && !!accessToken,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    refetchInterval: (query) => {
      if (!useAuthStore.getState().isAuthenticated || !useAuthStore.getState().accessToken) return false;
      if (query.state.error && (query.state.error as any)?.response?.status === 401) return false;
      return 30000;
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
