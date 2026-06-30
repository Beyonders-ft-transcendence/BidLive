import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, ArrowLeft, Loader2, Circle } from "lucide-react";
import { useAuthStore } from "@/shared/stores/auth.store";
import {
  useConversationsQuery,
  usePrivateMessagesQuery,
  useSendPrivateMessageMutation,
  useMarkMessagesAsReadMutation,
  usePrivateChatRealtime,
} from "@/hooks/useChat";
import Avatar from "@/components/common/Avatar";
import type { PrivateConversation, ChatUser } from "@/shared/types/chat.types";

export default function ChatTab() {
  const currentUser = useAuthStore((s) => s.user);
  
  // Selected conversation state
  const [selectedConv, setSelectedConv] = useState<PrivateConversation | null>(null);
  const [typedMessage, setTypedMessage] = useState("");

  // Queries
  const { data: conversations = [], isLoading: loadingConvs } = useConversationsQuery();
  const { data: messages = [], isLoading: loadingMessages } = usePrivateMessagesQuery(
    selectedConv?.id || null
  );

  // Mutations
  const sendMutation = useSendPrivateMessageMutation();
  const markAsReadMutation = useMarkMessagesAsReadMutation();

  // Scroll ref for chat history
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Determine recipient user profile
  const recipient = selectedConv
    ? selectedConv.user_one.id === currentUser?.id
      ? selectedConv.user_two
      : selectedConv.user_one
    : null;

  // Realtime hook
  const { isPartnerTyping, sendWsMessage, handleKeyPress } = usePrivateChatRealtime(
    recipient?.id || null,
    selectedConv?.id || null
  );

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Automatically select conversation if a 'recipient' query param is present
  useEffect(() => {
    if (typeof window !== "undefined" && conversations.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const recipientId = params.get("recipient");
      if (recipientId) {
        const rId = Number(recipientId);
        const found = conversations.find(
          (c) => c.user_one.id === rId || c.user_two.id === rId
        );
        if (found) {
          setSelectedConv(found);
          // Clean the recipient param from URL to allow navigating to other chats
          const newUrl = window.location.pathname + `?tab=chat`;
          window.history.replaceState({ path: newUrl }, "", newUrl);
        }
      }
    }
  }, [conversations]);

  // Mark as read when selected conversation changes or new messages arrive
  useEffect(() => {
    if (selectedConv?.id) {
      markAsReadMutation.mutate(selectedConv.id);
      // Wait a bit for render, then scroll to bottom
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedConv?.id, messages.length]);

  // Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !recipient) return;

    const msgText = typedMessage.trim();
    setTypedMessage("");

    // Try sending via WebSocket first for immediate speed, fallback to API
    const wsSuccess = sendWsMessage(msgText);
    if (!wsSuccess) {
      try {
        await sendMutation.mutateAsync({
          recipientId: recipient.id,
          message: msgText,
        });
      } catch (err) {
        console.error("Erro ao enviar mensagem por REST:", err);
      }
    }
  };

  // Helper to extract other user in conversation preview
  const getConversationPartner = (conv: PrivateConversation): ChatUser => {
    return conv.user_one.id === currentUser?.id ? conv.user_two : conv.user_one;
  };

  return (
    <div className="bg-card border border-border rounded-sm shadow-sm flex flex-col md:flex-row h-[600px] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-3 duration-300 text-foreground">
      
      {/* 1. Conversations List Sidebar */}
      <div
        className={`${
          selectedConv ? "hidden md:flex" : "flex"
        } w-full md:w-80 border-r border-border flex-col h-full bg-muted/20`}
      >
        <div className="p-4 border-b border-border bg-card shrink-0">
          <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={14} className="text-primary" />
            Minhas Conversas
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvs ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="text-xs font-semibold">A carregar conversas...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-muted-foreground">
              <MessageSquare size={32} className="opacity-30 mb-2" />
              <p className="text-xs font-bold text-foreground">Nenhuma conversa activa</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
                As conversas privadas iniciadas com vendedores ou licitantes aparecerão aqui.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const partner = getConversationPartner(conv);
              const isSelected = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-sm transition-all text-left cursor-pointer border ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "bg-background border-border hover:bg-muted text-foreground hover:border-border/80"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      name={partner.full_name || partner.username}
                      src={partner.avatar_url || undefined}
                      size="md"
                    />
                    {partner.is_online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4
                        className={`text-xs font-extrabold truncate ${
                          isSelected ? "text-primary-foreground" : "text-foreground"
                        }`}
                      >
                        {partner.full_name || partner.username}
                      </h4>
                      {conv.last_message && (
                        <span
                          className={`text-[8px] font-bold shrink-0 ${
                            isSelected ? "text-primary-foreground/60" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    
                    <p
                      className={`text-[10px] truncate ${
                        isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {conv.last_message ? conv.last_message.message : "Sem mensagens ainda"}
                    </p>
                  </div>

                  {conv.unread_count > 0 && !isSelected && (
                    <span className="shrink-0 bg-destructive text-destructive-foreground text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Main Chat Conversation Screen */}
      <div
        className={`${
          !selectedConv ? "hidden md:flex" : "flex"
        } flex-1 flex-col h-full bg-card relative`}
      >
        {selectedConv && recipient ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-3 shrink-0 bg-card shadow-xs">
              <button
                onClick={() => setSelectedConv(null)}
                className="md:hidden text-muted-foreground hover:text-foreground cursor-pointer p-1 bg-transparent border-none"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="relative shrink-0">
                <Avatar
                  name={recipient.full_name || recipient.username}
                  src={recipient.avatar_url || undefined}
                  size="md"
                />
                {recipient.is_online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                )}
              </div>

              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-black leading-none mb-1">
                  {recipient.full_name || recipient.username}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Circle
                    size={6}
                    className={recipient.is_online ? "fill-green-500 text-green-500" : "fill-muted-foreground text-muted-foreground"}
                  />
                  {recipient.is_online ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <span className="text-xs font-semibold">A carregar mensagens...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                  <p className="text-xs font-bold">Sem histórico</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Escreva sua primeira mensagem abaixo para iniciar a conversa.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.id === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-end ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    >
                      {!isMe && (
                        <div className="shrink-0 mb-3">
                          <Avatar
                            name={msg.sender.full_name || msg.sender.username}
                            src={msg.sender.avatar_url || undefined}
                            size="sm"
                          />
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`relative p-3 px-4 text-xs font-semibold leading-relaxed shadow-sm transition-all duration-200 ${
                            isMe
                              ? "bg-gradient-to-br from-primary to-primary/95 text-primary-foreground rounded-sm"
                              : "bg-muted/50 text-foreground border border-border rounded-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                        </div>
                        
                        <span className="text-[9px] font-bold text-muted-foreground/60 mt-1 flex items-center gap-1.5 px-1.5 select-none">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isMe && (
                            <span className={msg.is_read ? "text-primary font-black" : "text-muted-foreground/40"}>
                              {msg.is_read ? "Lida" : "Enviada"}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isPartnerTyping && (
                <div className="flex gap-3 items-end justify-start animate-in fade-in duration-200">
                  <div className="shrink-0">
                    <Avatar
                      name={recipient?.full_name || recipient?.username || ""}
                      src={recipient?.avatar_url || undefined}
                      size="sm"
                    />
                  </div>
                  <div className="relative p-3 px-4 bg-muted/50 border border-border rounded-sm shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-border flex items-center gap-3 bg-card shrink-0"
            >
              <div className="flex-1 flex items-center bg-muted/30 border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 rounded-sm px-4 py-1 transition-all">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escreva sua mensagem aqui..."
                  className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder-muted-foreground/75 py-2 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm shadow-md shadow-primary/10 hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer border-none"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 border border-border">
              <MessageSquare size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider mb-2">
              Selecione uma Conversa
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Escolha uma conversa na barra lateral para começar a enviar mensagens em tempo real com compradores ou vendedores.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
