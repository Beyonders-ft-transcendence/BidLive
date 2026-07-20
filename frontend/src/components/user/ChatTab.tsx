import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Send, MessageSquare, ArrowLeft, Loader2, Circle, Users, Search, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useAuthStore } from "@/shared/stores/auth.store";
import {
  useConversationsQuery,
  usePrivateMessagesQuery,
  useSendPrivateMessageMutation,
  useMarkMessagesAsReadMutation,
  usePrivateChatRealtime,
} from "@/hooks/useChat";
import {
  useFriendsQuery,
  useOnlineFriendsQuery,
  useRemoveFriendMutation,
  useUserSearchQuery,
  useSendFriendRequestMutation,
  usePendingRequestsSentQuery,
  usePendingRequestsReceivedQuery,
  useAcceptFriendRequestMutation,
} from "@/hooks/useSocial";
import Avatar from "@/components/common/Avatar";
import type { PrivateConversation, ChatUser } from "@/shared/types/chat.types";
import type { PublicUser } from "@/shared/types/social.types";
import { Input } from "../ui/input";

export default function ChatTab() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);

  // Left Panel Tabs
  const [leftTab, setLeftTab] = useState<"conversas" | "amigos" | "pedidos">("conversas");

  // Selected State
  const [selectedConv, setSelectedConv] = useState<PrivateConversation | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<PublicUser | ChatUser | null>(null);

  // Collapsible Sidebars
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  const [typedMessage, setTypedMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Queries - Chat
  const { data: conversations = [], isLoading: loadingConvs } = useConversationsQuery();
  const { data: messages = [], isLoading: loadingMessages } = usePrivateMessagesQuery(
    selectedConv?.id || null
  );

  // Queries - Social
  const { data: friendsResponse, isLoading: isLoadingFriends } = useFriendsQuery();
  const { data: onlineResponse } = useOnlineFriendsQuery();
  const { data: searchResults, isLoading: isSearching } = useUserSearchQuery(debouncedQuery);
  const { data: sentReqsResponse } = usePendingRequestsSentQuery();
  const { data: recReqsResponse } = usePendingRequestsReceivedQuery();

  const friends = Array.isArray(friendsResponse) ? friendsResponse : ((friendsResponse as any)?.data || []);
  const onlineFriends = Array.isArray(onlineResponse) ? onlineResponse : ((onlineResponse as any)?.data || []);
  const sentRequests = Array.isArray(sentReqsResponse) ? sentReqsResponse : ((sentReqsResponse as any)?.data || []);
  const receivedRequests = Array.isArray(recReqsResponse) ? recReqsResponse : ((recReqsResponse as any)?.data || []);

  // Mutations
  const sendMutation = useSendPrivateMessageMutation();
  const markAsReadMutation = useMarkMessagesAsReadMutation();
  const removeMutation = useRemoveFriendMutation();
  const sendFriendRequest = useSendFriendRequestMutation();
  const acceptFriendRequest = useAcceptFriendRequestMutation();

  // Scroll ref for chat history
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Determine recipient user profile
  const recipient = selectedConv
    ? selectedConv.user_one.id === currentUser?.id
      ? selectedConv.user_two
      : selectedConv.user_one
    : selectedFriend;

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
          setSelectedFriend(null);
          setLeftTab("conversas");
          // Clean the recipient param from URL to allow navigating to other chats
          const newUrl = window.location.pathname + `?tab=chat`;
          window.history.replaceState({ path: newUrl }, "", newUrl);
        } else {
          // If we don't have a conversation yet, try to find in friends
          const friendFound = friends.find((f: any) => f.id === rId);
          if (friendFound) {
            setSelectedFriend(friendFound);
            setSelectedConv(null);
            setLeftTab("amigos");
            const newUrl = window.location.pathname + `?tab=chat`;
            window.history.replaceState({ path: newUrl }, "", newUrl);
          }
        }
      }
    }
  }, [conversations, friends]);

  // Mark as read when selected conversation changes or new messages arrive
  useEffect(() => {
    if (selectedConv?.id) {
      markAsReadMutation.mutate(selectedConv.id);
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
       // console.log("Erro ao enviar mensagem por REST:", err);
      }
    }
  };

  // Helper to extract other user in conversation preview
  const getConversationPartner = (conv: PrivateConversation): ChatUser => {
    return conv.user_one.id === currentUser?.id ? conv.user_two : conv.user_one;
  };

  const isOnline = (userId: number) => {
    return onlineFriends.some((of: any) => of.id === userId);
  };

  const handleSelectConv = (conv: PrivateConversation) => {
    setSelectedConv(conv);
    setSelectedFriend(null);
  };

  const handleSelectFriend = (friend: any) => {
    // Ver se já existe conversa com este amigo
    const foundConv = conversations.find(c => c.user_one.id === friend.id || c.user_two.id === friend.id);
    if (foundConv) {
      setSelectedConv(foundConv);
      setSelectedFriend(null);
      setLeftTab("conversas");
    } else {
      setSelectedConv(null);
      setSelectedFriend(friend);
    }
  };

  const handleRemoveFriend = () => {
    if (!recipient) return;
    const isFriend = friends.find((f: any) => f.id === recipient.id);
    if (!isFriend) return;
    removeMutation.mutate(recipient.id, {
      onSuccess: () => {
        setSelectedFriend(null);
      }
    });
  };

  const handleSendRequest = () => {
    if (!recipient) return;
    sendFriendRequest.mutate(
      { addressee_id: recipient.id },
      {
        onSuccess: (res: any) => {
          if (!res.success) {
            toast.error(res.message || t('chat_tab.toast_send_error'));
          }
        },
        onError: () => {
          toast.error(t('chat_tab.toast_send_error_exists'));
        }
      }
    );
  };

  const handleAcceptRequest = (friendshipId: number) => {
    acceptFriendRequest.mutate(friendshipId);
  };

  const pendingSent = sentRequests.find((req: any) => req.addressee.id === recipient?.id);
  const pendingReceived = receivedRequests.find((req: any) => req.requester.id === recipient?.id);

  return (
    <div className="bg-background border border-border rounded-sm shadow-sm flex flex-col md:flex-row h-[700px] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-3 duration-300 text-foreground">

      {/* 1. Left Sidebar (Navigation & Lists) */}
      {showLeftSidebar && (
        <div className={`${(selectedConv || selectedFriend) ? "hidden md:flex" : "flex"} w-full md:w-[320px] flex-col h-full bg-card border-r border-border shrink-0 transition-all duration-300`}>
          {/* Left Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                {t('chat_tab.title')}
              </h2>
              <button
                onClick={() => setShowLeftSidebar(false)}
                className="hidden md:flex text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            <div className="flex bg-muted/50 p-1 rounded-sm">
              <button
                onClick={() => setLeftTab("conversas")}
                className={`flex-1 text-xs font-bold py-1.5 rounded-sm transition-colors cursor-pointer border-none ${leftTab === "conversas" ? "bg-background shadow-sm text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t('chat_tab.tab_conversations')}
              </button>
              <button
                onClick={() => setLeftTab("amigos")}
                className={`flex-1 text-xs font-bold py-1.5 rounded-sm transition-colors cursor-pointer border-none ${leftTab === "amigos" ? "bg-background shadow-sm text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t('chat_tab.tab_friends')}
              </button>
              <button
                onClick={() => setLeftTab("pedidos")}
                className={`flex-1 text-xs font-bold py-1.5 rounded-sm transition-colors cursor-pointer border-none relative ${leftTab === "pedidos" ? "bg-background shadow-sm text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t('chat_tab.tab_requests')}
                {receivedRequests.length > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
            </div>
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {leftTab === "conversas" && (
              <>
                {loadingConvs ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground">
                    <MessageSquare size={24} className="opacity-30 mb-2" />
                    <p className="text-xs font-bold text-foreground">{t('chat_tab.no_conversations')}</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const partner = getConversationPartner(conv);
                    const isSelected = selectedConv?.id === conv.id;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConv(conv)}
                        className={`w-full flex items-center gap-3 p-3 rounded-sm transition-colors text-left cursor-pointer border-none ${isSelected ? "bg-primary/10" : "bg-transparent hover:bg-muted/50"
                          }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar name={partner.full_name || partner.username} src={partner.avatar_url || undefined} size="md" />
                          {partner.is_online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <h4 className="text-xs font-bold truncate text-foreground">{partner.full_name || partner.username}</h4>
                            {conv.last_message && (
                              <span className="text-[9px] font-bold text-muted-foreground">
                                {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] truncate ${conv.unread_count > 0 && !isSelected ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                            {conv.last_message ? conv.last_message.message : t('chat_tab.new_conversation')}
                          </p>
                        </div>
                        {conv.unread_count > 0 && !isSelected && (
                          <span className="shrink-0 bg-primary text-primary-foreground text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                            {conv.unread_count}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </>
            )}

            {leftTab === "amigos" && (
              <>
                {isLoadingFriends ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : friends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground">
                    <Users size={24} className="opacity-30 mb-2" />
                    <p className="text-xs font-bold text-foreground">{t('chat_tab.no_friends')}</p>
                  </div>
                ) : (
                  friends.map((friend: any) => {
                    const isSelected = selectedFriend?.id === friend.id;
                    const online = isOnline(friend.id);
                    return (
                      <button
                        key={friend.id}
                        onClick={() => handleSelectFriend(friend)}
                        className={`w-full flex items-center gap-3 p-3 rounded-sm transition-colors text-left cursor-pointer border-none ${isSelected ? "bg-primary/10" : "bg-transparent hover:bg-muted/50"
                          }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar name={friend.full_name || friend.username} src={friend.avatar_url || undefined} size="md" />
                          {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold truncate text-foreground">{friend.full_name || friend.username}</h4>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {online ? t('chat_tab.friend_online') : t('chat_tab.friend_offline')}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            )}

            {leftTab === "pedidos" && (
              <div className="space-y-4 pt-2">
                {receivedRequests.length === 0 && sentRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground">
                    <Users size={24} className="opacity-30 mb-2" />
                    <p className="text-[10px] font-bold text-foreground">{t('chat_tab.no_pending')}</p>
                  </div>
                ) : (
                  <>
                    {receivedRequests.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-wider px-2">{t('chat_tab.requests_received')}</h4>
                        {receivedRequests.map((req: any) => (
                          <div key={req.id} className="w-full flex items-center justify-between p-2 rounded-sm bg-muted/20">
                            <div className="flex items-center gap-2 overflow-hidden mr-2 cursor-pointer" onClick={() => handleSelectFriend(req.requester)}>
                              <Avatar name={req.requester.username} src={req.requester.avatar_url} size="sm" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[10px] font-bold truncate text-foreground">{req.requester.full_name || req.requester.username}</h4>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAcceptRequest(req.id)}
                              className="text-[9px] font-bold bg-green-500/10 text-green-500 hover:bg-green-500/20 px-2 py-1 rounded-sm border-none cursor-pointer whitespace-nowrap"
                            >
                              {t('chat_tab.accept')}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {sentRequests.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-wider px-2">{t('chat_tab.requests_sent')}</h4>
                        {sentRequests.map((req: any) => (
                          <div key={req.id} className="w-full flex items-center justify-between p-2 rounded-sm bg-muted/20">
                            <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => handleSelectFriend(req.addressee)}>
                              <Avatar name={req.addressee.username} src={req.addressee.avatar_url} size="sm" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[10px] font-bold truncate text-foreground">{req.addressee.full_name || req.addressee.username}</h4>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap ml-2">{t('chat_tab.pending')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Chat Area */}
      <div className={`${(!selectedConv && !selectedFriend) ? "hidden md:flex" : "flex"} flex-1 flex-col h-full bg-background relative border-r border-border transition-all duration-300`}>
        {recipient ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-10 shadow-xs">
              <div className="flex items-center gap-4">
                <button onClick={() => { setSelectedConv(null); setSelectedFriend(null); }} className="md:hidden text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer">
                  <ArrowLeft size={18} />
                </button>
                {!showLeftSidebar && (
                  <button onClick={() => setShowLeftSidebar(true)} className="hidden md:flex text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer">
                    <PanelLeftOpen size={18} />
                  </button>
                )}
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-foreground">{recipient.full_name || recipient.username}</h3>
                  {isPartnerTyping ? (
                    <span className="text-[10px] font-bold text-primary animate-pulse">{t('chat_tab.typing')}</span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                      <Circle
                        size={6}
                        className={recipient.is_online || isOnline(recipient.id) ? "fill-green-500 text-green-500" : "fill-muted-foreground text-muted-foreground"}
                      />
                      {recipient.is_online || isOnline(recipient.id) ? t('chat_tab.status_online') : t('chat_tab.status_offline')}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Toggle Button */}
              <button
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className="hidden lg:flex text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"
              >
                {showRightSidebar ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingMessages && selectedConv ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Avatar name={recipient.full_name || recipient.username} src={recipient.avatar_url || undefined} size="lg" />
                  <h4 className="text-sm font-black mt-4">{recipient.full_name || recipient.username}</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                    {t('chat_tab.start_history', { username: recipient.username })}
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender.id === currentUser?.id;
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].sender.id === currentUser?.id);

                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                      {!isMe && (
                        <div className="w-8 shrink-0 flex items-end">
                          {showAvatar && <Avatar name={msg.sender.username} src={msg.sender.avatar_url || undefined} size="sm" />}
                        </div>
                      )}
                      <div className={`max-w-[85%] flex flex-col ${isMe ? "items-end" : "items-start"} overflow-hidden`}>
                        <div className={`p-3.5 px-5 text-xs font-semibold leading-relaxed shadow-sm transition-all duration-200 overflow-hidden ${isMe
                            ? "bg-gradient-to-br from-primary to-primary/95 text-primary-foreground rounded-2xl rounded-br-sm"
                            : "bg-muted/50 border border-border text-foreground rounded-2xl rounded-bl-sm"
                          }`}>
                          <p className="whitespace-pre-wrap break-all md:break-words w-full overflow-hidden">{msg.message}</p>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground/60 mt-1.5 px-1.5">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {isMe && (
                            <span className={msg.is_read ? "ml-1 text-primary font-black" : "ml-1 text-muted-foreground/40"}>
                              {msg.is_read ? t('chat_tab.message_read') : t('chat_tab.message_sent')}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              {isPartnerTyping && (
                <div className="flex gap-3 justify-start animate-in fade-in duration-200">
                  <div className="w-8 shrink-0 flex items-end">
                    <Avatar name={recipient.username} src={recipient.avatar_url || undefined} size="sm" />
                  </div>
                  <div className="p-3.5 px-5 bg-muted/50 border border-border rounded-2xl rounded-bl-sm flex gap-1.5 items-center h-10 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-card shrink-0 border-t border-border flex items-center gap-3">
              <div className="flex-1 flex items-center bg-muted/30 border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 rounded-full px-5 py-1 transition-all">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t('chat_tab.message_placeholder')}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder-muted-foreground py-2 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="w-11 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md shadow-primary/10 hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center shrink-0 cursor-pointer border-none"
              >
                <Send size={16} className="-ml-0.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/5 relative">
            {!showLeftSidebar && (
              <button
                onClick={() => setShowLeftSidebar(true)}
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-6 shadow-sm">
              <MessageSquare size={32} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-black text-foreground mb-2">{t('chat_tab.welcome_title')}</h3>
            <p className="text-xs text-muted-foreground max-w-sm text-center leading-relaxed">
              {t('chat_tab.welcome_desc')}
            </p>
          </div>
        )}
      </div>

      {/* 3. Right Sidebar (User Profile / Global Actions) */}
      {showRightSidebar && (
        <div className="hidden lg:flex w-[280px] flex-col h-full bg-card shrink-0 transition-all duration-300">
          {recipient ? (
            <div className="p-6 flex flex-col items-center text-center overflow-y-auto">
              <Avatar name={recipient.full_name || recipient.username} src={recipient.avatar_url || undefined} size="lg" />
              <h3 className="text-sm font-black text-foreground mt-4">{recipient.full_name || recipient.username}</h3>
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5">@{recipient.username}</p>

              <div className="w-full mt-6 space-y-4">
                <div className="text-left bg-background p-3 rounded-sm border border-border">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t('chat_tab.recipient_bio')}</span>
                  <p className="text-[11px] text-foreground font-medium leading-relaxed italic border-l-2 border-primary/50 pl-2">
                    {(recipient as any).bio || t('chat_tab.no_bio')}
                  </p>
                </div>

                {/* Social Actions */}
                <div className="pt-4 border-t border-border space-y-2">
                  {friends.some((f: any) => f.id === recipient.id) ? (
                    <button onClick={handleRemoveFriend} className="w-full py-2 bg-background border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs font-bold text-muted-foreground rounded-sm transition-colors cursor-pointer border-none">
                      {t('chat_tab.btn_remove_friend')}
                    </button>
                  ) : pendingSent ? (
                    <button disabled className="w-full py-2 bg-muted/50 text-muted-foreground text-xs font-bold rounded-sm transition-colors cursor-not-allowed border-none">
                      {t('chat_tab.btn_request_sent')}
                    </button>
                  ) : pendingReceived ? (
                    <button
                      onClick={() => handleAcceptRequest(pendingReceived.id)}
                      disabled={acceptFriendRequest.isPending}
                      className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs font-bold rounded-sm transition-colors cursor-pointer border-none disabled:opacity-50"
                    >
                      {acceptFriendRequest.isPending ? t('chat_tab.btn_accepting') : t('chat_tab.btn_accept_request')}
                    </button>
                  ) : (
                    <button
                      onClick={handleSendRequest}
                      disabled={sendFriendRequest.isPending}
                      className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-sm transition-colors cursor-pointer border-none disabled:opacity-50"
                    >
                      {sendFriendRequest.isPending ? t('chat_tab.btn_sending') : t('chat_tab.btn_send_request')}
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedConv(null); setSelectedFriend(null); }}
                    className="w-full py-2 bg-transparent hover:bg-muted/50 text-muted-foreground text-xs font-bold rounded-sm transition-colors cursor-pointer border-none"
                  >
                    {t('chat_tab.btn_leave')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={14} className="text-primary" />
                {t('chat_tab.sidebar_discover')}
              </h3>
              <div className="relative mb-6 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('chat_tab.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background/50 border-border focus-visible:ring-primary rounded-sm text-xs w-full"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="flex justify-center py-6"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : debouncedQuery && searchResults && searchResults.length > 0 ? (
                  searchResults.map((u: PublicUser) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectFriend(u)}
                      className="w-full flex items-center gap-3 p-2 rounded-sm hover:bg-muted/50 transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <Avatar name={u.full_name || u.username} src={u.avatar_url || undefined} size="sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold truncate text-foreground">{u.full_name || u.username}</h4>
                        <p className="text-[9px] text-muted-foreground truncate">@{u.username}</p>
                      </div>
                    </button>
                  ))
                ) : debouncedQuery ? (
                  <p className="text-[10px] text-center text-muted-foreground py-6">{t('chat_tab.search_no_results')}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center opacity-60 mt-10">
                    <Search size={32} className="text-muted-foreground mb-3" />
                    <p className="text-xs font-bold text-foreground">{t('chat_tab.search_title')}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">
                      {t('chat_tab.search_desc')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
