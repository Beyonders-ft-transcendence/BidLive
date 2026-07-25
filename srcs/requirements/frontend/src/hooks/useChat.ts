import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import chatService from "@/services/chat.service";
import { useAuthStore } from "@/shared/stores/auth.store";
import ENV from "@/shared/utils/env.utils";
import type { PrivateMessage, RoomMessage } from "@/shared/types/chat.types";

const WS_RECONNECT_BASE_DELAY = 1000;
const WS_RECONNECT_MAX_DELAY = 30000;
const WS_MAX_RECONNECT_ATTEMPTS = 20;

// 1. Hook to fetch the conversations list
export function useConversationsQuery() {
  return useQuery({
    queryKey: ["privateConversations"],
    queryFn: async () => {
      const res = await chatService.listConversations();
      if (!res.success) throw new Error(res.message || "Erro ao carregar conversas.");
      return res.data || [];
    },
  });
}

// 2. Hook to fetch messages for a specific conversation
export function usePrivateMessagesQuery(conversationId: number | null) {
  return useQuery({
    queryKey: ["privateMessages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await chatService.listPrivateMessages(conversationId);
      if (!res.success) throw new Error(res.message || "Erro ao carregar mensagens.");
      return res.data || [];
    },
    enabled: !!conversationId,
  });
}

// 3. Mutation to send a private message
export function useSendPrivateMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipientId, message }: { recipientId: number; message: string }) => {
      const res = await chatService.sendPrivateMessage(recipientId, message);
      if (!res.success) throw new Error(res.message || "Erro ao enviar mensagem.");
      return res.data;
    },
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: ["privateConversations"] });
      if (newMessage) {
        queryClient.setQueryData(
          ["privateMessages", newMessage.conversation],
          (old: PrivateMessage[] | undefined) => {
            if (!old) return [newMessage];
            if (old.some((m) => m.id === newMessage.id)) return old;
            return [...old, newMessage];
          }
        );
      }
    },
  });
}

// 4. Mutation to mark messages as read
export function useMarkMessagesAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: number) => {
      const res = await chatService.markAsRead(conversationId);
      if (!res.success) throw new Error(res.message || "Erro ao marcar como lida.");
      return res.data;
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["privateConversations"] });
      queryClient.setQueryData(
        ["privateMessages", conversationId],
        (old: PrivateMessage[] | undefined) => {
          if (!old) return old;
          return old.map((m) => ({ ...m, is_read: true }));
        }
      );
    },
  });
}

// 5. WebSocket realtime hook for a specific private conversation
export function usePrivateChatRealtime(
  recipientId: number | null,
  conversationId: number | null
) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s: any) => s.accessToken);
  const currentUser = useAuthStore((s: any) => s.user);
  
  const [isTyping, setIsTyping] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!recipientId || !accessToken) return;

    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isClosedIntentional = false;
    let reconnectAttempts = 0;

    const connect = () => {
      if (isClosedIntentional) return;

      const wsUrl = `${ENV.WS_BASE_URL}/ws/chat/private/${recipientId}/?token=${accessToken}`;
      socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        reconnectAttempts = 0;
        if (conversationId) {
          socket?.send(JSON.stringify({ type: "chat.read" }));
        }
      };

      socket.onerror = () => {
        console.error("[WS PrivateChat] WebSocket error");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "chat.message") {
            const newMessage: PrivateMessage = {
              id: data.message_id,
              conversation: conversationId || 0,
              sender: {
                id: data.sender_id,
                username: data.sender_username,
                full_name: data.sender_username,
                avatar_url: data.sender_avatar,
                is_online: true,
              },
              message: data.message,
              is_read: data.sender_id === currentUser?.id,
              created_at: data.created_at,
            };

            if (conversationId) {
              queryClient.setQueryData(
                ["privateMessages", conversationId],
                (old: PrivateMessage[] | undefined) => {
                  if (!old) return [newMessage];
                  if (old.some((m) => m.id === newMessage.id)) return old;
                  return [...old, newMessage];
                }
              );
            }

            if (data.sender_id !== currentUser?.id && conversationId) {
              socket?.send(JSON.stringify({ type: "chat.read" }));
            }
            queryClient.invalidateQueries({ queryKey: ["privateConversations"] });
            setIsTyping(false);
          } else if (data.type === "chat.typing") {
            if (data.user_id !== currentUser?.id) {
              setIsTyping(data.is_typing);
            }
          } else if (data.type === "chat.read") {
            if (data.reader_id !== currentUser?.id && conversationId) {
              queryClient.setQueryData(
                ["privateMessages", conversationId],
                (old: PrivateMessage[] | undefined) => {
                  if (!old) return old;
                  return old.map((m) => ({ ...m, is_read: true }));
                }
              );
              queryClient.invalidateQueries({ queryKey: ["privateConversations"] });
            }
          }
        } catch (err) {
          console.error("[WS PrivateChat] message parse error:", err);
        }
      };

      socket.onclose = (event) => {
        if (!isClosedIntentional && reconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            WS_RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts),
            WS_RECONNECT_MAX_DELAY
          );
          reconnectAttempts++;
          console.warn(`[WS PrivateChat] disconnected (code=${event.code}), reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
          reconnectTimeout = setTimeout(() => { connect(); }, delay);
        }
      };
    };

    connect();

    return () => {
      isClosedIntentional = true;
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [recipientId, conversationId, accessToken, currentUser?.id, queryClient]);

  const sendWsMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "chat.message", message: text }));
      return true;
    }
    return false;
  };

  const sendTypingStatus = (typing: boolean) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "chat.typing", is_typing: typing }));
    }
  };

  const handleKeyPress = () => {
    sendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { sendTypingStatus(false); }, 2000);
  };

  return { isPartnerTyping: isTyping, sendWsMessage, handleKeyPress };
}

// ============================================
// PUBLIC AUCTION CHAT HOOKS
// ============================================

export function useAuctionMessagesQuery(auctionId: number) {
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);
  return useQuery({
    queryKey: ["auctionMessages", auctionId],
    queryFn: async () => {
      const res = await chatService.listAuctionMessages(auctionId);
      if (!res.success) throw new Error(res.message || "Erro ao carregar mensagens do leilão.");
      return res.data || [];
    },
    enabled: !!auctionId && isAuthenticated,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) return false;
      return failureCount < 2;
    }
  });
}

export function useSendAuctionMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ auctionId, message }: { auctionId: number; message: string }) => {
      const res = await chatService.sendAuctionMessage(auctionId, message);
      if (!res.success) throw new Error(res.message || "Erro ao enviar mensagem.");
      return res.data;
    },
    onSuccess: (newMessage, { auctionId }) => {
      if (newMessage) {
        queryClient.setQueryData(
          ["auctionMessages", auctionId],
          (old: RoomMessage[] | undefined) => {
            if (!old) return [newMessage];
            if (old.some((m) => m.id === newMessage.id)) return old;
            return [...old, newMessage];
          }
        );
      }
    },
  });
}

export function useAuctionChatRealtime(auctionId: number) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s: any) => s.accessToken);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!auctionId || !accessToken) return;

    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isClosedIntentional = false;
    let reconnectAttempts = 0;

    const connect = () => {
      if (isClosedIntentional) return;

      const wsUrl = `${ENV.WS_BASE_URL}/ws/chat/auction/${auctionId}/?token=${accessToken}`;
      socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        reconnectAttempts = 0;
      };

      socket.onerror = () => {
        console.error("[WS AuctionChat] WebSocket error");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "chat.message") {
            const newMessage: RoomMessage = {
              id: data.message_id,
              room: data.room_id || 0,
              sender: {
                id: data.sender_id,
                username: data.sender_username,
                full_name: data.sender_username,
                avatar_url: data.sender_avatar,
                is_online: true,
              },
              message: data.message,
              created_at: data.created_at,
              is_deleted: false,
            };

            queryClient.setQueryData(
              ["auctionMessages", auctionId],
              (old: RoomMessage[] | undefined) => {
                if (!old) return [newMessage];
                if (old.some((m) => m.id === newMessage.id)) return old;
                return [...old, newMessage];
              }
            );
          } else if (data.error) {
            console.warn("[WS AuctionChat] server error:", data.error);
          }
        } catch (err) {
          console.error("[WS AuctionChat] message parse error:", err);
        }
      };

      socket.onclose = (event) => {
        if (!isClosedIntentional && reconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            WS_RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts),
            WS_RECONNECT_MAX_DELAY
          );
          reconnectAttempts++;
          console.warn(`[WS AuctionChat] disconnected (code=${event.code}), reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
          reconnectTimeout = setTimeout(() => { connect(); }, delay);
        }
      };
    };

    connect();

    return () => {
      isClosedIntentional = true;
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [auctionId, accessToken, queryClient]);

  const sendWsMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "chat.message", message: text }));
      return true;
    }
    return false;
  };

  return { sendWsMessage };
}
