import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/stores/auth.store";
import ENV from "@/shared/utils/env.utils";
import { toast } from "sonner";

export function useNotificationRealtime() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);
  const accessToken = useAuthStore((s: any) => s.accessToken);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    
    const wsUrl = `${ENV.WS_BASE_URL}/ws/notifications/?token=${accessToken}`;
    
    try {
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "notification.message" && data.notification) {
            queryClient.setQueryData(["notifications"], (prev: any) => {
              if (!prev) return prev;
              
              const currentList = Array.isArray(prev) 
                ? prev 
                : (Array.isArray(prev.data) ? prev.data : (prev.results || prev.data?.results || []));
                
              const newList = [data.notification, ...currentList];
              
              if (Array.isArray(prev)) return newList;
              if (prev.data && Array.isArray(prev.data)) return { ...prev, data: newList };
              if (prev.results) return { ...prev, results: newList };
              if (prev.data?.results) return { ...prev, data: { ...prev.data, results: newList } };
              
              return newList;
            });
            
            toast.info(`🔔 ${data.notification.title}`);
          }
        } catch {
          // Silent: notification WS message parse error
        }
      };

      return () => {
        socket.close();
      };
    } catch {
      // Silent: notification WS init error
    }
  }, [isAuthenticated, accessToken, queryClient]);
}
