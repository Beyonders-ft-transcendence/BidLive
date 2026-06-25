import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import chatService from "@/services/chat.service";
import { useAuthStore } from "@/shared/stores/auth.store";
import ENV from "@/shared/utils/env.utils";
import type { PrivateMessage } from "@/shared/types/chat.types";

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
      // Optmistically invalidate conversations list to update previews
      queryClient.invalidateQueries({ queryKey: ["privateConversations"] });
      
      // Update the active message list cache
      if (newMessage) {
        queryClient.setQueryData(
          ["privateMessages", newMessage.conversation],
          (old: PrivateMessage[] | undefined) => {
            if (!old) return [newMessage];
            // Prevent duplicates
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
      // Update messages locally to set is_read = true
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

    const connect = () => {
      if (isClosedIntentional) return;

      const wsUrl = `${ENV.WS_BASE_URL}/ws/chat/private/${recipientId}/?token=${accessToken}`;
      console.log(`[WS PrivateChat] Connecting to recipient ${recipientId}...`);
      socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log(`[WS PrivateChat] Connected to recipient ${recipientId}`);
        // Mark as read when entering room
        if (conversationId) {
          socket?.send(JSON.stringify({ type: "chat.read" }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`[WS PrivateChat] Received message event:`, data);

          if (data.type === "chat.message") {
            const newMessage: PrivateMessage = {
              id: data.message_id,
              conversation: conversationId || 0, // Fallback if not set
              sender: {
                id: data.sender_id,
                username: data.sender_username,
                full_name: data.sender_username,
                avatar_url: data.sender_avatar,
                is_online: true,
              },
              message: data.message,
              is_read: data.sender_id === currentUser?.id, // read if we sent it
              created_at: data.created_at,
            };

            // Append to message history in query client cache
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

            // Trigger read update if we are the recipient of this new message and active in the conversation
            if (data.sender_id !== currentUser?.id && conversationId) {
              socket?.send(JSON.stringify({ type: "chat.read" }));
            }

            // Invalidate conversations list for sidebar preview
            queryClient.invalidateQueries({ queryKey: ["privateConversations"] });
            setIsTyping(false);
          } else if (data.type === "chat.typing") {
            if (data.user_id !== currentUser?.id) {
              setIsTyping(data.is_typing);
            }
          } else if (data.type === "chat.read") {
            // If the other user read our messages, update local cache
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
          console.error("[WS PrivateChat] Error parsing message:", err);
        }
      };

      socket.onclose = (e) => {
        console.log(`[WS PrivateChat] Disconnected from recipient ${recipientId}. Code: ${e.code}`);
        if (!isClosedIntentional) {
          // Attempt reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      socket.onerror = (error) => {
        console.error("[WS PrivateChat] WebSocket error:", error);
      };
    };

    connect();

    return () => {
      isClosedIntentional = true;
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [recipientId, conversationId, accessToken, currentUser?.id, queryClient]);

  // Send message via WebSocket
  const sendWsMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "chat.message",
          message: text,
        })
      );
      return true;
    }
    return false;
  };

  // Send typing status
  const sendTypingStatus = (typing: boolean) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "chat.typing",
          is_typing: typing,
        })
      );
    }
  };

  const handleKeyPress = () => {
    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  return {
    isPartnerTyping: isTyping,
    sendWsMessage,
    handleKeyPress,
  };
}
