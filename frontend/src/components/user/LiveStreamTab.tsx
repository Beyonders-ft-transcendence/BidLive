import { useEffect, useState, useRef } from "react";
import { 
  Video, VideoOff, Mic, MicOff, Key, Copy, Check, 
  Tv, Radio, Users, RefreshCw, Play, Square, ArrowLeft,
  Calendar, Gavel, PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import type { Auction } from "@/shared/types/auction.types";
import { LiveStreamStatus, LiveStreamVisibility, AuctionStatus } from "@/shared/types/auction.types";
import auctionService from "@/services/auction.service";
import { auctionStatusColor, getAuctionStatusLabel } from "@/shared/utils/auction.utils";

interface LiveStreamTabProps {
  myAuctions: Auction[];
  loadingAuctions: boolean;
  onCreateNewClick: () => void;
}

export default function LiveStreamTab({ myAuctions, loadingAuctions, onCreateNewClick }: LiveStreamTabProps) {
  const [activeAuction, setActiveAuction] = useState<Auction | null>(null);
  
  // Stream console states
  const [stream, setStream] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  // Create stream form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<LiveStreamVisibility>(LiveStreamVisibility.PUBLIC);

  // Web Broadcaster state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Viewers state
  const [viewers, setViewers] = useState<any[]>([]);
  const [viewerCount, setViewerCount] = useState(0);

  // Load stream data
  const loadStream = async (auctionId: number) => {
    setLoading(true);
    try {
      const res = await auctionService.listStreams(auctionId);
      if (res.success && res.data && res.data.length > 0) {
        const activeStream = res.data[0];
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
          setTitle(`Live Stream: ${activeAuction.item?.title || "Leilão"}`);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar streams:", err);
      toast.error("Falha ao carregar configurações de transmissão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAuction) {
      loadStream(activeAuction.id);
    }
    return () => {
      stopCamera();
    };
  }, [activeAuction]);

  // Set titles if activeAuction changes
  useEffect(() => {
    if (activeAuction && !stream) {
      setTitle(`Live Stream: ${activeAuction.item?.title || "Leilão"}`);
    }
  }, [activeAuction, stream]);

  // Periodically update viewer list and stream status when live
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

  // Media Capture Functions
  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (!cameraOn && !micOn) {
      setLocalStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    try {
      const constraints = {
        video: cameraOn ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: micOn
      };
      const streamObj = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(streamObj);
      if (videoRef.current) {
        videoRef.current.srcObject = streamObj;
      }
    } catch (err: any) {
      console.error("Erro ao acessar câmera/microfone:", err);
      toast.error("Não foi possível acessar a câmera ou o microfone.");
      if (cameraOn) setCameraOn(false);
      if (micOn) setMicOn(false);
    }
  };

  useEffect(() => {
    if (stream && (stream.status === LiveStreamStatus.READY || stream.status === LiveStreamStatus.LIVE)) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [stream?.status, cameraOn, micOn]);

  const showBackendError = (err: any, fallbackMessage: string) => {
    const errorMsg = err?.response?.data?.message || fallbackMessage;
    toast.error(errorMsg);
  };

  // Handlers
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
        toast.success("Sala de transmissão criada!");
      }
    } catch (err: any) {
      showBackendError(err, "Erro ao criar transmissão.");
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
        toast.success("Você está AO VIVO!");
      }
    } catch (err: any) {
      showBackendError(err, "Falha ao iniciar transmissão.");
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
        stopCamera();
        loadStream(activeAuction.id);
        toast.success("Transmissão encerrada.");
      }
    } catch (err: any) {
      showBackendError(err, "Falha ao encerrar transmissão.");
    }
  };

  const handleRegenerateKey = async () => {
    if (!activeAuction || !stream) return;
    if (broadcasting) {
      toast.error("Não é possível alterar a chave com a transmissão ao vivo.");
      return;
    }
    try {
      const res = await auctionService.regenerateStreamKey(activeAuction.id, stream.id);
      if (res.success) {
        loadStream(activeAuction.id);
        toast.success("Chave de transmissão atualizada!");
      }
    } catch (err: any) {
      showBackendError(err, "Erro ao regenerar a chave.");
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
    toast.success("Copiado com sucesso!");
  };

  const serverUrl = "rtmp://rtmp.bidlive.ao/live";

  // Filter user auctions that can be streamed (status is LIVE or SCHEDULED)
  const streamableAuctions = myAuctions.filter(
    (auc) => auc.status === AuctionStatus.LIVE || auc.status === AuctionStatus.SCHEDULED
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 text-foreground text-left">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          {activeAuction && (
            <button
              onClick={() => {
                stopCamera();
                setActiveAuction(null);
                setStream(null);
              }}
              className="p-2 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-sm transition cursor-pointer bg-background"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              Central de Transmissão Ao Vivo
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {activeAuction 
                ? `Console de Streaming: Lote #${activeAuction.id} • ${activeAuction.item?.title}`
                : "Selecione um lote ativo ou agendado para iniciar a transmissão."
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
            <span className="text-xs text-muted-foreground font-semibold">Buscando lotes elegíveis...</span>
          </div>
        ) : streamableAuctions.length === 0 ? (
          <div className="bg-card border border-border p-16 rounded-sm text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-sm flex items-center justify-center">
              <Tv size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Nenhum lote elegível para live</h4>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed mx-auto">
                Apenas lotes com status **Ativo (LIVE)** ou **Agendado (SCHEDULED)** podem ser transmitidos.
              </p>
              <button
                onClick={onCreateNewClick}
                className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-sm uppercase tracking-wider transition cursor-pointer border-none"
              >
                Criar Novo Leilão
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
                  onClick={() => setActiveAuction(auc)}
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
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{auc.item?.category_label || "Geral"}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${auctionStatusColor(auc.status)}`}>
                          {getAuctionStatusLabel(auc.status)}
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
                      Configurar Transmissão
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
            <span className="text-xs text-muted-foreground font-semibold">Carregando sala de stream...</span>
          </div>
        ) : !stream ? (
          /* CREATE STREAM SUBSTATE */
          <div className="bg-card border border-border p-6 rounded-sm shadow-sm max-w-2xl mx-auto">
            <div className="bg-primary/5 border border-primary/10 rounded-sm p-4 flex gap-3 text-primary mb-6">
              <Radio className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold">Aviso:</span> Nenhuma sala de transmissão configurada.
                Configure as opções abaixo para gerar o endereço RTMP e a Chave de Stream necessários.
              </div>
            </div>

            <form onSubmit={handleCreateStream} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Título da Live</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Ex: Apresentação ao vivo do lote"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Visibilidade</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as LiveStreamVisibility)}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none h-[34px]"
                  >
                    <option value={LiveStreamVisibility.PUBLIC}>Público</option>
                    <option value={LiveStreamVisibility.UNLISTED}>Não Listado</option>
                    <option value={LiveStreamVisibility.PRIVATE}>Privado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição da Live</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Descreva detalhes específicos para os espectadores..."
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-sm uppercase tracking-wider disabled:opacity-55 flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <Tv size={14} />
                  {creating ? "Criando sala..." : "Gerar Credenciais de Live"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* WORKSPACE STREAM CONSOLE ACTIVE */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            
            {/* Stream Video Broadcast Center */}
            <div className="space-y-4 min-w-0">
              <div className="bg-card border border-border p-4 rounded-sm shadow-sm space-y-4">
                <div className="relative aspect-video bg-slate-950 border border-slate-900 rounded-sm overflow-hidden flex items-center justify-center shadow-inner">
                  {stream.status === LiveStreamStatus.LIVE || stream.status === LiveStreamStatus.READY ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="text-center text-slate-500 p-6">
                      <Radio className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-wider">A transmissão está encerrada</p>
                      <p className="text-[10px] text-slate-600 mt-1">Status da live: {stream.status}</p>
                    </div>
                  )}

                  {/* Status Overlay Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                      broadcasting ? "bg-red-500 text-white animate-pulse" : "bg-slate-800 text-slate-300"
                    }`}>
                      {broadcasting ? "AO VIVO" : "OFFLINE"}
                    </span>
                    
                    {broadcasting && (
                      <span className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-sm text-[8px] font-bold text-white flex items-center gap-1">
                        <Users size={10} />
                        {viewerCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Device controls bar */}
                {(stream.status === LiveStreamStatus.READY || stream.status === LiveStreamStatus.LIVE) && (
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCameraOn(!cameraOn)}
                        className={`p-2 rounded-sm border transition cursor-pointer border-none ${
                          cameraOn 
                            ? "bg-muted text-foreground hover:bg-muted/80" 
                            : "bg-destructive text-destructive-foreground hover:bg-destructive/95"
                        }`}
                        title={cameraOn ? "Desativar Câmera" : "Ativar Câmera"}
                      >
                        {cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                      </button>
                      
                      <button
                        onClick={() => setMicOn(!micOn)}
                        className={`p-2 rounded-sm border transition cursor-pointer border-none ${
                          micOn 
                            ? "bg-muted text-foreground hover:bg-muted/80" 
                            : "bg-destructive text-destructive-foreground hover:bg-destructive/95"
                        }`}
                        title={micOn ? "Desativar Microfone" : "Ativar Microfone"}
                      >
                        {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {!broadcasting ? (
                        <button
                          onClick={handleStartStream}
                          className="px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-sm shadow-sm uppercase flex items-center gap-1.5 cursor-pointer border-none animate-pulse"
                        >
                          <Play size={14} />
                          Iniciar Transmissão
                        </button>
                      ) : (
                        <button
                          onClick={handleEndStream}
                          className="px-5 py-2.5 bg-foreground hover:opacity-90 text-background font-bold text-xs rounded-sm shadow-sm uppercase flex items-center gap-1.5 cursor-pointer border-none"
                        >
                          <Square size={12} />
                          Parar Transmissão
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OBS setup credentials & Espectadores */}
            <div className="space-y-4 w-full shrink-0">
              
              {/* Status Spec */}
              <div className="bg-card border border-border p-4 rounded-sm shadow-sm space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Status do Canal</span>
                <div className="flex justify-between items-baseline text-xs border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="font-bold uppercase font-mono">{stream.status}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs pt-1">
                  <span className="text-muted-foreground">Visibilidade</span>
                  <span className="font-bold uppercase font-mono">{stream.visibility}</span>
                </div>
              </div>

              {/* OBS config setup */}
              <div className="bg-card border border-border p-4 rounded-sm shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1 border-b border-border pb-2">
                  <Key className="w-3.5 h-3.5 text-primary" />
                  Conexão OBS Studio / RTMP
                </span>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-muted-foreground uppercase block">Servidor RTMP</label>
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
                    <label className="text-[8px] font-bold text-muted-foreground uppercase block">Chave de Stream</label>
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
                    Trocar Chave de Stream
                  </button>
                </div>
              </div>

              {/* Connected Active Viewers */}
              {broadcasting && (
                <div className="bg-card border border-border p-4 rounded-sm shadow-sm space-y-3 max-h-52 overflow-y-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                    <Users className="w-3.5 h-3.5" />
                    Espectadores Logados ({viewerCount})
                  </span>
                  
                  <div className="divide-y divide-border/60 text-xs">
                    {viewers.length > 0 ? (
                      viewers.map((v) => (
                        <div key={v.id} className="py-2 flex items-center justify-between">
                          <span className="font-semibold text-foreground truncate max-w-[150px]">
                            {v.viewer?.username || "Anônimo"}
                          </span>
                          <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/25 px-1.5 py-0.5 rounded-sm font-bold uppercase shrink-0">Assistindo</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground py-4 text-center">Nenhum espectador logado.</p>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )
      )}

    </div>
  );
}
