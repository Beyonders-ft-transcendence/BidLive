import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/stores/auth.store";
import ENV from "@/shared/utils/env.utils";
import { toast } from "sonner";

const WS_RECONNECT_BASE_DELAY = 1000;
const WS_RECONNECT_MAX_DELAY = 30000;
const WS_MAX_RECONNECT_ATTEMPTS = 20;

export function useNotificationRealtime() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);
  const accessToken = useAuthStore((s: any) => s.accessToken);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isClosedIntentional = false;
    let reconnectAttempts = 0;

    const connect = () => {
      if (isClosedIntentional) return;

      const wsUrl = `${ENV.WS_BASE_URL}/ws/notifications/?token=${accessToken}`;

      try {
        const socket = new WebSocket(wsUrl);
        ws.current = socket;

        socket.onopen = () => {
          reconnectAttempts = 0;
        };

        socket.onerror = () => {
          console.error("[WS Notifications] WebSocket error");
        };

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
          } catch (err) {
            console.error("[WS Notifications] message parse error:", err);
          }
        };

        socket.onclose = (event) => {
          if (!isClosedIntentional && reconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(
              WS_RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts),
              WS_RECONNECT_MAX_DELAY
            );
            reconnectAttempts++;
            console.warn(`[WS Notifications] disconnected (code=${event.code}), reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
            reconnectTimeout = setTimeout(() => { connect(); }, delay);
          }
        };
      } catch (err) {
        console.error("[WS Notifications] init error:", err);
      }
    };

    connect();

    return () => {
      isClosedIntentional = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isAuthenticated, accessToken, queryClient]);
}
