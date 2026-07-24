import { useEffect, useState, useRef } from "react";
import { 
  Video, VideoOff, Mic, MicOff, Key, Copy, Check, 
  Tv, Radio, Users, RefreshCw, Play, Square 
} from "lucide-react";
import { toast } from "sonner";
import type { Auction } from "@/shared/types/auction.types";
import { LiveStreamStatus, LiveStreamVisibility } from "@/shared/types/auction.types";
import auctionService from "@/services/auction.service";
import Modal from "@/components/common/Modal";

interface StreamConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction | null;
}

export default function StreamConsoleModal({ isOpen, onClose, auction }: StreamConsoleModalProps) {
  const [stream, setStream] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
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
  const loadStream = async () => {
    if (!auction) return;
    setLoading(true);
    try {
      const res = await auctionService.listStreams(auction.id);
      if (res.success && res.data && res.data.length > 0) {
        // Get the latest open stream
        const activeStream = res.data[0];
        setStream(activeStream);
        setBroadcasting(activeStream.status === LiveStreamStatus.LIVE);
        
        // Load viewers
        try {
          const vRes = await auctionService.listStreamViewers(auction.id, activeStream.id);
          if (vRes.success && vRes.data) {
            setViewers(vRes.data.results || []);
            setViewerCount(vRes.data.count || 0);
          }
        } catch (vErr) {
          console.error("Erro ao carregar viewers:", vErr);
        }
      } else {
        setStream(null);
        setTitle(`Live Stream: ${auction.item?.title || "Leilão"}`);
      }
    } catch (err) {
      console.error("Erro ao carregar streams:", err);
      toast.error("Falha ao carregar configurações de transmissão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && auction) {
      loadStream();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, auction]);

  // Periodically update viewer list and stream status when live
  useEffect(() => {
    let interval: any;
    if (isOpen && auction && stream && stream.status === LiveStreamStatus.LIVE) {
      interval = setInterval(async () => {
        try {
          const vRes = await auctionService.listStreamViewers(auction.id, stream.id);
          if (vRes.success && vRes.data) {
            setViewers(vRes.data.results || []);
            setViewerCount(vRes.data.count || 0);
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen, auction, stream]);

  // Browser Media Capture Functions
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
    // Parar streams antigos antes de pedir novo (evita bloqueio de hardware)
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
      let errorMsg = "Não foi possível aceder à câmara/microfone.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Permissão de câmara/microfone negada pelo navegador. Verifique as definições de privacidade.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "Nenhuma câmara ou microfone foi detetado no sistema.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMsg = "A câmara ou microfone já está a ser utilizado por outra aplicação.";
      }
      toast.error(errorMsg);
      // Desativar no estado para evitar loops
      if (cameraOn) setCameraOn(false);
      if (micOn) setMicOn(false);
    }
  };

  useEffect(() => {
    if (stream && (stream.status === LiveStreamStatus.READY || stream.status === LiveStreamStatus.LIVE) && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [stream?.status, cameraOn, micOn, isOpen]);

  // Error parser helper
  const showBackendError = (err: any, fallbackMessage: string) => {
    const errorData = err?.response?.data;
    let errorMsg = fallbackMessage;
    if (errorData) {
      if (errorData.message) {
        errorMsg = errorData.message;
      } else if (errorData.errors) {
        if (typeof errorData.errors === "string") {
          errorMsg = errorData.errors;
        } else if (Array.isArray(errorData.errors)) {
          errorMsg = errorData.errors.map((e: any) => {
            if (typeof e === "string") return e;
            if (typeof e === "object" && e !== null) return Object.values(e).flat().join(" ");
            return String(e);
          }).join(" ");
        } else if (typeof errorData.errors === "object") {
          errorMsg = Object.values(errorData.errors).flat().join(" ");
        }
      } else if (typeof errorData === "object") {
        errorMsg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
          .join(" | ");
      }
    }
    toast.error(errorMsg);
  };

  // Handlers
  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    setCreating(true);
    try {
      const res = await auctionService.createStream(auction.id, {
        title,
        description,
        visibility,
        status: LiveStreamStatus.READY
      });
      if (res.success && res.data) {
        setStream(res.data);
        toast.success("Sala de transmissão criada com sucesso!");
      } else {
        toast.error(res.message || "Falha ao criar sala de transmissão.");
      }
    } catch (err: any) {
      showBackendError(err, "Erro ao criar transmissão.");
    } finally {
      setCreating(false);
    }
  };

  const handleStartStream = async () => {
    if (!auction || !stream) return;
    try {
      const res = await auctionService.startStream(auction.id, stream.id, {
        stream_key: stream.stream_key,
        metadata: { client: "web-broadcaster" }
      });
      if (res.success) {
        setBroadcasting(true);
        loadStream();
        toast.success("Você está AO VIVO!");
      }
    } catch (err: any) {
      showBackendError(err, "Falha ao iniciar transmissão.");
    }
  };

  const handleEndStream = async () => {
    if (!auction || !stream) return;
    try {
      const res = await auctionService.endStream(auction.id, stream.id, {
        reason: "Seller ended stream manually."
      });
      if (res.success) {
        setBroadcasting(false);
        stopCamera();
        loadStream();
        toast.success("Transmissão encerrada.");
      }
    } catch (err: any) {
      showBackendError(err, "Falha ao encerrar transmissão.");
    }
  };

  const handleRegenerateKey = async () => {
    if (!auction || !stream) return;
    if (broadcasting) {
      toast.error("Não é possível alterar a chave com a transmissão ao vivo.");
      return;
    }
    try {
      const res = await auctionService.regenerateStreamKey(auction.id, stream.id);
      if (res.success) {
        loadStream();
        toast.success("Chave de transmissão rotacionada com sucesso!");
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
    toast.success("Copiado para a área de transferência!");
  };

  // Mock settings values
  const serverUrl = "rtmp://rtmp.bidlive.ao/live";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title={`Console de Transmissão: Lote #${auction?.id || ""}`}
      size="xl"
    >
      <div className="p-6 space-y-6 text-left select-none max-h-[85vh] overflow-y-auto text-foreground">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Carregando canal...</p>
          </div>
        ) : !stream ? (
          /* CREATE STREAM FORM */
          <form onSubmit={handleCreateStream} className="space-y-5">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 text-primary">
              <Radio className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold">Informação:</span> Nenhuma transmissão configurada para este leilão.
                Preencha os campos abaixo para criar as credenciais de streaming (OBS / RTMP) e liberar a transmissão direta pelo navegador.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Título da Live</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Ex: Transmissão oficial - Lote BMW X6"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Visibilidade</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as LiveStreamVisibility)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none h-[34px]"
                >
                  <option value={LiveStreamVisibility.PUBLIC}>Público (Visível para todos)</option>
                  <option value={LiveStreamVisibility.UNLISTED}>Não Listado (Apenas com link)</option>
                  <option value={LiveStreamVisibility.PRIVATE}>Privado (Apenas vendedor)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição da Live (Opcional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none resize-none"
                placeholder="Ex: Apresentação de detalhes do interior e funcionamento do motor..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md uppercase disabled:opacity-50 flex items-center gap-2 cursor-pointer border-none"
              >
                <Tv size={14} />
                {creating ? "Configurando..." : "Criar Sala de Transmissão"}
              </button>
            </div>
          </form>
        ) : (
          /* ACTIVE STREAM CONSOLE */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            
            {/* Left side: Web Broadcaster & Player Preview */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-900 flex items-center justify-center">
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
                    <p className="text-[10px] text-slate-600 mt-1">Status do canal: {stream.status}</p>
                  </div>
                )}

                {/* Status Badges Overlay */}
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

              {/* Broadcaster Device controls */}
              {(stream.status === LiveStreamStatus.READY || stream.status === LiveStreamStatus.LIVE) && (
                <div className="bg-muted/40 border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCameraOn(!cameraOn)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer border-none ${
                        cameraOn 
                          ? "bg-background border-border text-foreground hover:bg-muted" 
                          : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      }`}
                      title={cameraOn ? "Desativar Câmera" : "Ativar Câmera"}
                    >
                      {cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                    </button>
                    
                    <button
                      onClick={() => setMicOn(!micOn)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer border-none ${
                        micOn 
                          ? "bg-background border-border text-foreground hover:bg-muted" 
                          : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      }`}
                      title={micOn ? "Mudar Microfone" : "Ativar Microfone"}
                    >
                      {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    {!broadcasting ? (
                      <button
                        onClick={handleStartStream}
                        className="px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md uppercase flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <Play size={14} />
                        Iniciar Transmissão
                      </button>
                    ) : (
                      <button
                        onClick={handleEndStream}
                        className="px-5 py-2.5 bg-[#0C1B33] dark:bg-muted hover:opacity-90 text-white dark:text-foreground font-bold text-xs rounded-xl shadow-md uppercase flex items-center gap-1.5 cursor-pointer border-none animate-pulse"
                      >
                        <Square size={12} />
                        Parar Transmissão
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Credentials & Stats */}
            <div className="space-y-5">
              {/* Stream state details */}
              <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Canal</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="font-bold uppercase font-mono">{stream.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Visibilidade</span>
                  <span className="font-bold uppercase font-mono">{stream.visibility}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Audiência Máx.</span>
                  <span className="font-bold font-mono">{stream.viewer_count}</span>
                </div>
              </div>

              {/* OBS Setup Credentials */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-border">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-primary" />
                    Configurações do OBS / RTMP
                  </h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Endereço do Servidor</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        readOnly
                        value={serverUrl}
                        className="flex-1 px-2.5 py-1.5 bg-muted/50 border border-border rounded-sm text-[10px] font-semibold text-muted-foreground outline-none"
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
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Chave de Transmissão (Stream Key)</label>
                    <div className="flex gap-1">
                      <input
                        type="password"
                        readOnly
                        value={stream.stream_key}
                        className="flex-1 px-2.5 py-1.5 bg-muted/50 border border-border rounded-sm text-[10px] font-semibold text-muted-foreground outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(stream.stream_key, "key")}
                        className="p-1.5 border border-border rounded-sm hover:bg-muted text-muted-foreground cursor-pointer bg-background"
                      >
                        {copiedKey ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleRegenerateKey}
                      disabled={broadcasting}
                      className="w-full py-2 bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={10} />
                      Rotacionar Chave
                    </button>
                  </div>
                </div>
              </div>

              {/* Viewers presence list */}
              {broadcasting && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3.5 max-h-56 overflow-y-auto">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Espectadores Ativos
                  </h4>
                  
                  <div className="divide-y divide-border text-xs">
                    {viewers.length > 0 ? (
                      viewers.map((v) => (
                        <div key={v.id} className="py-2 flex items-center justify-between">
                          <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                            {v.viewer?.username || "Anônimo"}
                          </span>
                          <span className="text-[8px] text-muted-foreground font-bold uppercase">Conectado</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground py-4 text-center">Nenhum espectador logado no momento.</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
