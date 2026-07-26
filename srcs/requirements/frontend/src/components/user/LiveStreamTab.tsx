import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Key, Copy, Check,
  Tv, Radio, Users, RefreshCw, ArrowLeft,
  Calendar, Gavel, PlayCircle,
  MessageSquare, Send, TrendingUp, History
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Auction, LiveStream, StreamViewer } from "@/shared/types/auction.types";
import { LiveStreamStatus, LiveStreamVisibility, AuctionStatus } from "@/shared/types/auction.types";
import auctionService from "@/services/auction.service";
import { auctionStatusColor, getAuctionStatusLabel, formatCurrency } from "@/shared/utils/auction.utils";
import BroadcasterStage from "@/components/livestream/BroadcasterStage";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import { useAuctionMessagesQuery, useAuctionChatRealtime, useSendAuctionMessageMutation } from "@/hooks/useChat";

interface LiveStreamTabProps {
  myAuctions: Auction[];
  loadingAuctions: boolean;
  onCreateNewClick: () => void;
}

function LiveStreamConsolePanel({
  auctionId,
  stream,
  broadcasting,
  serverUrl,
  copiedUrl,
  copiedKey,
  viewerCount,
  viewers,
  copyToClipboard,
  handleRegenerateKey,
}: {
  auctionId: number;
  stream: LiveStream;
  broadcasting: boolean;
  serverUrl: string;
  copiedUrl: boolean;
  copiedKey: boolean;
  viewerCount: number;
  viewers: StreamViewer[];
  copyToClipboard: (text: string, type: "key" | "url") => void;
  handleRegenerateKey: () => void;
}) {
  const { t, i18n } = useTranslation();
  const localeMap: Record<string, string> = { pt: "pt-AO", en: "en-US", ar: "ar-SA" };
  const currentLocale = localeMap[i18n.language] || "pt-AO";
  const currentUser = useAuthStore((s: any) => s.user);
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);

  const [activeTab, setActiveTab] = useState<"chat" | "bids" | "obs">("chat");

  // Real-time bids and price history stream (read-only for streamer)
  const { auction, bids } = useAuctionRealtime(auctionId);

  // Real-time chat for this auction
  const { data: messagesData } = useAuctionMessagesQuery(auctionId);
  const chatMessages = messagesData || [];
  const { sendWsMessage } = useAuctionChatRealtime(auctionId);
  const sendMsgMutation = useSendAuctionMessageMutation();

  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (!chatEndRef.current) return;
    const lastMsg = chatMessages[chatMessages.length - 1];
    const isMyMessage = lastMsg?.sender?.id === currentUser?.id;
    if (chatMessages.length > prevLengthRef.current) {
      if (isMyMessage || activeTab === "chat") {
        chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    prevLengthRef.current = chatMessages.length;
  }, [chatMessages, currentUser?.id, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !isAuthenticated) return;
    const msg = chatInput.trim();
    setChatInput("");
    const sent = sendWsMessage(msg);
    if (!sent) {
      try {
        await sendMsgMutation.mutateAsync({ auctionId, message: msg });
      } catch (err) {
        console.error("Erro ao enviar mensagem de chat", err);
      }
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const currentPrice = Number(auction?.item?.current_price || auction?.item?.starting_price || 0);

  return (
    <div className="bg-card border border-border rounded-sm shadow-sm flex flex-col h-[520px] overflow-hidden text-left">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-border bg-muted/30 p-1 gap-1">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
            activeTab === "chat"
              ? "bg-card text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare size={14} />
          {t('auction_detail.public_chat', 'Chat')}
          {chatMessages.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-primary/10 text-primary rounded-full text-[9px] font-extrabold font-mono">
              {chatMessages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("bids")}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
            activeTab === "bids"
              ? "bg-card text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History size={14} />
          {t('auction_detail.bids_tab', 'Lances')}
          {bids.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-extrabold font-mono">
              {bids.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("obs")}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
            activeTab === "obs"
              ? "bg-card text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Key size={14} />
          OBS & Config
        </button>
      </div>

      {/* TAB CONTENT 1: REALTIME CHAT */}
      {activeTab === "chat" && (
        <div className="flex flex-col flex-1 min-h-0 bg-card">
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-muted/20">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <MessageSquare size={24} className="mb-2 text-muted-foreground/60" />
                <p className="text-xs font-semibold">{t('auction_detail.empty_chat', 'Nenhuma mensagem ainda')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('auction_detail.empty_chat_desc', 'Interaja com seus espectadores em tempo real.')}</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMine = msg.sender?.id === currentUser?.id;
                const senderName = msg.sender?.full_name || msg.sender?.username || "Usuário";
                return (
                  <div key={msg.id} className={`flex gap-2 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] shrink-0 border border-border">
                      {msg.sender?.avatar_url ? (
                        <img src={msg.sender.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(senderName)
                      )}
                    </div>
                    <div className={`max-w-[80%] px-3 py-2 text-xs rounded-xl shadow-2xs ${
                      isMine ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground border border-border rounded-bl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`font-bold text-[10px] ${isMine ? 'text-primary-foreground/90' : 'text-primary'}`}>
                          {isMine ? 'Você' : senderName}
                        </span>
                        <span className={`text-[8px] font-mono ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(msg.created_at).toLocaleTimeString(currentLocale, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="break-words text-[11px] font-normal leading-snug">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2 bg-muted/40 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t('auction_detail.chat_placeholder', 'Escreva uma mensagem...')}
                className="flex-1 bg-background border border-border rounded-full px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="w-8 h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-40 cursor-pointer border-none shrink-0"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: REALTIME BIDS */}
      {activeTab === "bids" && (
        <div className="flex flex-col flex-1 min-h-0 bg-card">
          {/* Price Header Summary */}
          <div className="p-3 bg-muted/40 border-b border-border flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase text-muted-foreground block">{t('my_auctions_tab.current_price', 'Preço Atual')}</span>
              <span className="text-base font-extrabold text-primary font-mono">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase text-muted-foreground block">{t('auction_detail.total_bids', 'Total Lances')}</span>
              <span className="text-xs font-bold text-foreground font-mono">{bids.length} lances</span>
            </div>
          </div>

          {/* Bids List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-muted/20">
            {bids.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <TrendingUp size={24} className="mb-2 text-muted-foreground/60" />
                <p className="text-xs font-semibold">{t('auction_detail.no_bids', 'Nenhum lance registrado ainda')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('auction_detail.no_bids_desc', 'Os lances dos compradores aparecerão aqui em tempo real.')}</p>
              </div>
            ) : (
              bids.map((bid, index) => {
                const isTopBid = index === 0;
                const bidderName = bid.bidder?.full_name || bid.bidder?.username || `Licitante #${bid.bidder_id || '—'}`;
                return (
                  <div
                    key={bid.id}
                    className={`p-2.5 rounded-sm border transition-all flex items-center justify-between ${
                      isTopBid
                        ? "bg-primary/5 border-primary/30 shadow-2xs"
                        : "bg-card border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        isTopBid ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {getInitials(bidderName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-foreground truncate max-w-[130px]">{bidderName}</span>
                          {isTopBid && (
                            <span className="px-1.5 py-0.2 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-xs">
                              Maior Lance
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono block">
                          {new Date(bid.created_at || bid.timestamp).toLocaleTimeString(currentLocale, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs font-mono text-primary block">
                        {formatCurrency(bid.amount)}
                      </span>
                      {bid.is_buy_now && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-600 font-bold uppercase px-1 rounded-xs">
                          Compra Imediata
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: OBS & VIEWERS */}
      {activeTab === "obs" && (
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-card">
          {/* Status Spec */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border pb-1">
              {t('live_stream_tab.channel_status')}
            </span>
            <div className="flex justify-between items-baseline text-xs border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">{t('live_stream_tab.status_label')}</span>
              <span className="font-bold uppercase font-mono text-primary">{stream.status}</span>
            </div>
            <div className="flex justify-between items-baseline text-xs pt-0.5">
              <span className="text-muted-foreground">{t('live_stream_tab.visibility_label')}</span>
              <span className="font-bold uppercase font-mono">{stream.visibility}</span>
            </div>
          </div>

          {/* OBS config setup */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1 border-b border-border pb-1">
              <Key className="w-3.5 h-3.5 text-primary" />
              {t('live_stream_tab.obs_connection')}
            </span>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-muted-foreground uppercase block">{t('live_stream_tab.rtmp_server')}</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    readOnly
                    value={serverUrl}
                    className="flex-1 px-2 py-1.5 bg-muted/65 border border-border rounded-sm text-[10px] font-semibold text-muted-foreground outline-none truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(serverUrl, "url")}
                    className="p-1.5 border border-border rounded-sm hover:bg-muted text-muted-foreground cursor-pointer bg-background"
                  >
                    {copiedUrl ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-muted-foreground uppercase block">{t('live_stream_tab.stream_key')}</label>
                <div className="flex gap-1">
                  <input
                    type="password"
                    readOnly
                    value={stream.stream_key}
                    className="flex-1 px-2 py-1.5 bg-muted/65 border border-border rounded-sm text-[10px] font-semibold text-muted-foreground outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(stream.stream_key, "key")}
                    className="p-1.5 border border-border rounded-sm hover:bg-muted text-muted-foreground cursor-pointer bg-background"
                  >
                    {copiedKey ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegenerateKey}
                disabled={broadcasting}
                className="w-full py-2 bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 rounded-sm text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} />
                {t('live_stream_tab.rotate_key')}
              </button>
            </div>
          </div>

          {/* Connected Active Viewers */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-1">
              <Users className="w-3.5 h-3.5" />
              {t('live_stream_tab.viewers_title', { count: viewerCount })}
            </span>
            
            <div className="divide-y divide-border/60 text-xs">
              {viewers.length > 0 ? (
                viewers.map((v) => (
                  <div key={v.id} className="py-1.5 flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {v.viewer?.username || t('live_stream_tab.viewer_anonymous')}
                    </span>
                    <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/25 px-1.5 py-0.5 rounded-sm font-bold uppercase shrink-0">
                      {t('live_stream_tab.viewer_watching')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground py-3 text-center">{t('live_stream_tab.no_viewers')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveStreamTab({ myAuctions, loadingAuctions, onCreateNewClick }: LiveStreamTabProps) {
  const { t } = useTranslation();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeAuction, setActiveAuction] = useState<Auction | null>(null);

  // Sync from URL search params
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam && myAuctions.length > 0) {
      const found = myAuctions.find((auc) => auc.id === Number(idParam));
      if (found) {
        setActiveAuction(found);
      }
    }
  }, [searchParams, myAuctions]);
  
  // Stream console states
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Create stream form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<LiveStreamVisibility>(LiveStreamVisibility.PUBLIC);

  // Broadcast state
  const [broadcasting, setBroadcasting] = useState(false);

  // Viewers state
  const [viewers, setViewers] = useState<StreamViewer[]>([]);
  const [viewerCount, setViewerCount] = useState(0);

  // Load stream data
  const loadStream = async (auctionId: number) => {
    setLoading(true);
    try {
      const res = await auctionService.listStreams(auctionId);
      if (res.success && res.data && res.data.length > 0) {
        const activeStream = res.data.find((s) => s.status === LiveStreamStatus.LIVE || s.status === LiveStreamStatus.READY);
        
        if (activeStream) {
          setStream(activeStream);
          setBroadcasting(activeStream.status === LiveStreamStatus.LIVE);
          
          try {
            const vRes = await auctionService.listStreamViewers(auctionId, activeStream.id);
            if (vRes.success && vRes.data) {
              setViewers(vRes.data.results || []);
              setViewerCount(vRes.data.count || 0);
            }
          } catch (vErr) {
            console.error("Erro ao carregar viewers:", vErr);
          }
        } else {
          setStream(null);
          if (activeAuction) {
            setTitle(`Live Stream: ${activeAuction.item?.title || t('live_stream_tab.category_fallback')}`);
          }
        }
      } else {
        setStream(null);
        if (activeAuction) {
          setTitle(`Live Stream: ${activeAuction.item?.title || t('live_stream_tab.category_fallback')}`);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar streams:", err);
      toast.error(t('live_stream_tab.toast_load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAuction) {
      loadStream(activeAuction.id);
    }
  }, [activeAuction]);

  useEffect(() => {
    if (activeAuction && !stream) {
      setTitle(`Live Stream: ${activeAuction.item?.title || t('live_stream_tab.category_fallback')}`);
    }
  }, [activeAuction, stream]);

  useEffect(() => {
    let interval: any;
    if (activeAuction && stream && stream.status === LiveStreamStatus.LIVE) {
      interval = setInterval(async () => {
        try {
          const vRes = await auctionService.listStreamViewers(activeAuction.id, stream.id);
          if (vRes.success && vRes.data) {
            setViewers(vRes.data.results || []);
            setViewerCount(vRes.data.count || 0);
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeAuction, stream]);

  const showBackendError = (err: any, fallbackMessage: string) => {
    const errorMsg = err?.response?.data?.message || fallbackMessage;
    toast.error(errorMsg);
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuction) return;
    setCreating(true);
    try {
      const res = await auctionService.createStream(activeAuction.id, {
        title,
        description,
        visibility,
        status: LiveStreamStatus.READY
      });
      if (res.success && res.data) {
        setStream(res.data);
        toast.success(t('live_stream_tab.toast_stream_created'));
      }
    } catch (err: any) {
      showBackendError(err, t('live_stream_tab.toast_create_error'));
    } finally {
      setCreating(false);
    }
  };

  const handleStartStream = async () => {
    if (!activeAuction || !stream) return;
    try {
      const res = await auctionService.startStream(activeAuction.id, stream.id, {
        stream_key: stream.stream_key,
        metadata: { client: "web-broadcaster" }
      });
      if (res.success) {
        setBroadcasting(true);
        loadStream(activeAuction.id);
        toast.success(t('live_stream_tab.toast_stream_started'));
      }
    } catch (err: any) {
      showBackendError(err, t('live_stream_tab.toast_start_error'));
    }
  };

  const handleEndStream = async () => {
    if (!activeAuction || !stream) return;
    try {
      const res = await auctionService.endStream(activeAuction.id, stream.id, {
        reason: "Seller ended stream manually."
      });
      if (res.success) {
        setBroadcasting(false);
        loadStream(activeAuction.id);
        toast.success(t('live_stream_tab.toast_stream_ended'));
      }
    } catch (err: any) {
      showBackendError(err, t('live_stream_tab.toast_end_error'));
    }
  };

  const handleRegenerateKey = async () => {
    if (!activeAuction || !stream) return;
    if (broadcasting) {
      toast.error(t('live_stream_tab.toast_key_live_error'));
      return;
    }
    try {
      const res = await auctionService.regenerateStreamKey(activeAuction.id, stream.id);
      if (res.success) {
        loadStream(activeAuction.id);
        toast.success(t('live_stream_tab.toast_key_updated'));
      }
    } catch (err: any) {
      showBackendError(err, t('live_stream_tab.toast_regenerate_error'));
    }
  };

  const copyToClipboard = (text: string, type: "key" | "url") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
    toast.success(t('live_stream_tab.toast_copied'));
  };

  const serverUrl = "rtmp://rtmp.bidlive.ao/live";

  const streamableAuctions = myAuctions.filter(
    (auc) => auc.status === AuctionStatus.LIVE
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 text-foreground text-left">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          {activeAuction && (
            <button
              onClick={() => {
                setActiveAuction(null);
                setStream(null);
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("id");
                setSearchParams(newParams);
              }}
              className="p-2 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-sm transition cursor-pointer bg-background"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              {t('live_stream_tab.title')}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {activeAuction 
                ? t('live_stream_tab.subtitle_console', { id: activeAuction.id, title: activeAuction.item?.title })
                : t('live_stream_tab.subtitle_select')
              }
            </p>
          </div>
        </div>
      </div>

      {/* STATE A: SELECT LOTE TO STREAM */}
      {!activeAuction && (
        loadingAuctions ? (
          <div className="bg-card border border-border p-12 rounded-sm text-center flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-muted-foreground font-semibold">{t('live_stream_tab.loading_eligible')}</span>
          </div>
        ) : streamableAuctions.length === 0 ? (
          <div className="bg-card border border-border p-16 rounded-sm text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-sm flex items-center justify-center">
              <Tv size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{t('live_stream_tab.no_eligible_title')}</h4>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed mx-auto">
                {t('live_stream_tab.no_eligible_desc')}
              </p>
              <button
                onClick={onCreateNewClick}
                className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-sm uppercase tracking-wider transition cursor-pointer border-none"
              >
                {t('live_stream_tab.create_new_auction')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streamableAuctions.map((auc) => {
              const primaryImage = auc.item?.images?.find((img) => img.is_primary) || auc.item?.images?.[0];
              return (
                <div
                  key={auc.id}
                  onClick={() => {
                    setActiveAuction(auc);
                    setSearchParams({ tab: "live-stream", id: String(auc.id) });
                  }}
                  className="bg-card border border-border rounded-sm p-5 hover:border-primary/45 transition shadow-xs flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 shrink-0 bg-muted border border-border/85 rounded-sm overflow-hidden relative">
                      {primaryImage ? (
                        <img src={primaryImage.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Gavel size={18} className="opacity-40" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{auc.item?.category_label || t('live_stream_tab.category_fallback')}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${auctionStatusColor(auc.status)}`}>
                          {getAuctionStatusLabel(auc.status, t)}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-foreground truncate mt-1 group-hover:text-primary transition-colors">
                        {auc.item?.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground truncate mt-1">ID: #{auc.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-4">
                    <div className="flex gap-1.5 items-center text-[10px] text-muted-foreground font-semibold">
                      <Calendar size={12} />
                      {new Date(auc.start_time).toLocaleDateString()}
                    </div>

                    <button className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary group-hover:underline">
                      <PlayCircle size={14} />
                      {t('live_stream_tab.configure_stream')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* STATE B: LIVE CONSOLE ACTIVE WORKSPACE */}
      {activeAuction && (
        loading ? (
          <div className="bg-card border border-border p-16 rounded-sm text-center flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-muted-foreground font-semibold">{t('live_stream_tab.loading_stream')}</span>
          </div>
        ) : !stream ? (
          <div className="bg-card border border-border p-6 rounded-sm shadow-sm max-w-2xl mx-auto">
            <div className="bg-primary/5 border border-primary/10 rounded-sm p-4 flex gap-3 text-primary mb-6">
              <Radio className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold">{t('live_stream_tab.no_stream_title')}</span> {t('live_stream_tab.no_stream_desc')}
              </div>
            </div>

            <form onSubmit={handleCreateStream} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('live_stream_tab.stream_title')}</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none"
                    placeholder={t('live_stream_tab.stream_title_placeholder')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('live_stream_tab.visibility')}</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as LiveStreamVisibility)}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none h-[34px]"
                  >
                    <option value={LiveStreamVisibility.PUBLIC}>{t('live_stream_tab.visibility_public')}</option>
                    <option value={LiveStreamVisibility.UNLISTED}>{t('live_stream_tab.visibility_unlisted')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('live_stream_tab.stream_description')}</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder={t('live_stream_tab.stream_description_placeholder')}
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-sm uppercase tracking-wider disabled:opacity-55 flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <Tv size={14} />
                  {creating ? t('live_stream_tab.creating_room') : t('live_stream_tab.generate_credentials')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* WORKSPACE STREAM CONSOLE ACTIVE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Stream Video Broadcast Center (LiveKit) - Col 7 on desktop */}
            <div className="lg:col-span-7 space-y-4 min-w-0">
              <div className="bg-card border border-border p-4 rounded-sm shadow-sm">
                <BroadcasterStage
                  auctionId={activeAuction.id}
                  stream={stream}
                  broadcasting={broadcasting}
                  viewerCount={viewerCount}
                  onStart={handleStartStream}
                  onEnd={handleEndStream}
                />
              </div>
            </div>

            {/* Interactive Stream Console Panel (Chat, Bids & OBS Config) - Col 5 on desktop */}
            <div className="lg:col-span-5 w-full shrink-0">
              <LiveStreamConsolePanel
                auctionId={activeAuction.id}
                stream={stream}
                broadcasting={broadcasting}
                serverUrl={serverUrl}
                copiedUrl={copiedUrl}
                copiedKey={copiedKey}
                viewerCount={viewerCount}
                viewers={viewers}
                copyToClipboard={copyToClipboard}
                handleRegenerateKey={handleRegenerateKey}
              />
            </div>

          </div>
        )
      )}

    </div>
  );
}
