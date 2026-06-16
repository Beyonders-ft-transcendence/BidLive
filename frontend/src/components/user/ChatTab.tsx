"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, ArrowLeft, Loader2, Circle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  useConversationsQuery,
  usePrivateMessagesQuery,
  useSendPrivateMessageMutation,
  useMarkMessagesAsReadMutation,
  usePrivateChatRealtime,
} from "@/hooks/useChat";
import Avatar from "@/components/common/Avatar";
import type { PrivateConversation, ChatUser } from "@/types/chat.types";

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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row h-[600px] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* 1. Conversations List Sidebar */}
      <div
        className={`${
          selectedConv ? "hidden md:flex" : "flex"
        } w-full md:w-80 border-r border-gray-100 flex-col h-full bg-slate-50/50`}
      >
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <MessageSquare size={14} className="text-primary" />
            Minhas Conversas
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvs ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="text-xs font-semibold">A carregar conversas...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-slate-400">
              <MessageSquare size={32} className="opacity-30 mb-2" />
              <p className="text-xs font-bold text-slate-500">Nenhuma conversa ativa</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
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
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer border ${
                    isSelected
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                      : "bg-white border-gray-100 hover:bg-slate-50 text-slate-700 hover:border-slate-200"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      name={partner.full_name || partner.username}
                      src={partner.avatar_url || undefined}
                      size="md"
                    />
                    {partner.is_online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4
                        className={`text-xs font-extrabold truncate ${
                          isSelected ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {partner.full_name || partner.username}
                      </h4>
                      {conv.last_message && (
                        <span
                          className={`text-[8px] font-bold shrink-0 ${
                            isSelected ? "text-white/60" : "text-slate-400"
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
                        isSelected ? "text-white/80" : "text-slate-500"
                      }`}
                    >
                      {conv.last_message ? conv.last_message.message : "Sem mensagens ainda"}
                    </p>
                  </div>

                  {conv.unread_count > 0 && !isSelected && (
                    <span className="shrink-0 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
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
        } flex-1 flex-col h-full bg-white relative`}
      >
        {selectedConv && recipient ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0 bg-white shadow-xs">
              <button
                onClick={() => setSelectedConv(null)}
                className="md:hidden text-slate-500 hover:text-slate-800 cursor-pointer p-1"
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
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-black text-slate-800 leading-none mb-1">
                  {recipient.full_name || recipient.username}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Circle
                    size={6}
                    className={recipient.is_online ? "fill-green-500 text-green-500" : "fill-slate-400 text-slate-400"}
                  />
                  {recipient.is_online ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <span className="text-xs font-semibold">A carregar mensagens...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                  <p className="text-xs font-bold text-slate-500">Sem histórico</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Escreva sua primeira mensagem abaixo para iniciar a conversa.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.id === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[70%] flex flex-col">
                        <div
                          className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                            isMe
                              ? "bg-primary text-white rounded-br-none shadow-xs"
                              : "bg-white text-slate-800 border border-gray-150 rounded-bl-none shadow-xs"
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span
                          className={`text-[8px] font-bold text-slate-400 mt-1 flex items-center gap-1 px-1 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isMe && (
                            <span className={msg.is_read ? "text-green-500" : "text-slate-300"}>
                              ✓{msg.is_read && "✓"}
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
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 bg-white border border-gray-150 p-2.5 rounded-2xl rounded-bl-none shadow-xs">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white shrink-0"
            >
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escreva sua mensagem aqui..."
                className="flex-1 px-4 py-2.5 border border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-xl text-xs transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="p-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md shadow-primary/10 transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
              <MessageSquare size={24} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">
              Selecione uma Conversa
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Escolha uma conversa na barra lateral para começar a enviar mensagens em tempo real com compradores ou vendedores.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
