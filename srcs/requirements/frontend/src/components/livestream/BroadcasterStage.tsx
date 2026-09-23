import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoTrack,
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import { Mic, MicOff, Play, Radio, RefreshCw, Square, Users, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import type { LiveStream } from "@/shared/types/auction.types";
import { LiveStreamStatus } from "@/shared/types/auction.types";
import { getBackendErrorMessage, useLiveKitTokenQuery, resolveLiveKitUrl } from "@/hooks/useLiveKit";
import ENV from "@/shared/utils/env.utils";

interface BroadcasterStageProps {
  auctionId: number;
  stream: LiveStream;
  broadcasting: boolean;
  viewerCount: number;
  onRemoteViewerCountChange?: (count: number) => void;
  onStart: () => void;
  onEnd: () => void;
}

function StagePane({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-video bg-slate-950 border border-slate-900 rounded-sm overflow-hidden flex items-center justify-center shadow-inner">
      {children}
    </div>
  );
}

function showDeviceError(err: unknown, device: "câmera" | "microfone") {
  console.error(`Erro ao acessar ${device}:`, err);
  const errorMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err ?? "");
  if (errorMsg.includes("NotFound")) {
    toast.error(`Dispositivo não encontrado. Certifique-se de que a ${device} está conectada.`);
  } else if (errorMsg.includes("NotAllowed")) {
    toast.error("Permissão negada. Autorize o acesso no seu navegador.");
  } else if (errorMsg.includes("Overconstrained")) {
    toast.error(`A ${device} não suporta as configurações exigidas.`);
  } else {
    toast.error(`Não foi possível acessar a ${device}.`);
  }
}

const connectionLabels: Partial<Record<ConnectionState, string>> = {
  [ConnectionState.Connecting]: "Conectando ao estúdio...",
  [ConnectionState.Reconnecting]: "Reconectando ao estúdio...",
  [ConnectionState.Disconnected]: "Desconectado do estúdio",
};

/**
 * Interior da sala LiveKit: preview da câmera publicada, controles de
 * dispositivos e botões de iniciar/encerrar a transmissão.
 */
function StageControls({
  stream,
  broadcasting,
  viewerCount,
  onRemoteViewerCountChange,
  onStart,
  onEnd,
}: Omit<BroadcasterStageProps, "auctionId">) {
  const connectionState = useConnectionState();
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const [togglingCamera, setTogglingCamera] = useState(false);
  const [togglingMic, setTogglingMic] = useState(false);

  const activeViewers = Math.max(viewerCount || 0, remoteParticipants.length);
  const isStreamLive = broadcasting || stream.status === LiveStreamStatus.LIVE;

  useEffect(() => {
    if (onRemoteViewerCountChange) {
      onRemoteViewerCountChange(remoteParticipants.length);
    }
  }, [remoteParticipants.length, onRemoteViewerCountChange]);

  const cameraTracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const localCamera = cameraTracks.find((t) => t.participant.isLocal);

  const toggleCamera = async () => {
    setTogglingCamera(true);
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (err) {
      showDeviceError(err, "câmera");
    } finally {
      setTogglingCamera(false);
    }
  };

  const toggleMic = async () => {
    setTogglingMic(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (err) {
      showDeviceError(err, "microfone");
    } finally {
      setTogglingMic(false);
    }
  };

  const connectionLabel = connectionLabels[connectionState];

  return (
    <>
      <StagePane>
        {localCamera && isCameraEnabled ? (
          <VideoTrack trackRef={localCamera} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
        ) : (
          <div className="text-center text-slate-500 p-6">
            <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold uppercase tracking-wider">Câmera desativada</p>
            <p className="text-[10px] text-slate-600 mt-1">Ative a câmera para que os participantes vejam você.</p>
          </div>
        )}

        {/* Status Overlay Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest ${
              isStreamLive ? "bg-red-500 text-white animate-pulse" : "bg-slate-800 text-slate-300"
            }`}
          >
            {isStreamLive ? "AO VIVO" : "OFFLINE"}
          </span>

          {isStreamLive && (
            <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-sm text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10 shadow-sm">
              <Users size={12} className="text-red-400" />
              <span>{activeViewers} assistindo</span>
            </span>
          )}

          {connectionLabel && (
            <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest">
              {connectionLabel}
            </span>
          )}
        </div>
      </StagePane>

      {/* Device controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex gap-2">
          <button
            onClick={toggleCamera}
            disabled={togglingCamera || connectionState !== ConnectionState.Connected}
            className={`p-2 rounded-sm transition cursor-pointer border-none disabled:opacity-55 ${
              isCameraEnabled
                ? "bg-muted text-foreground hover:bg-muted/80"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/95"
            }`}
            title={isCameraEnabled ? "Desativar Câmera" : "Ativar Câmera"}
          >
            {isCameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}
          </button>

          <button
            onClick={toggleMic}
            disabled={togglingMic || connectionState !== ConnectionState.Connected}
            className={`p-2 rounded-sm transition cursor-pointer border-none disabled:opacity-55 ${
              isMicrophoneEnabled
                ? "bg-muted text-foreground hover:bg-muted/80"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/95"
            }`}
            title={isMicrophoneEnabled ? "Desativar Microfone" : "Ativar Microfone"}
          >
            {isMicrophoneEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
        </div>

        <div className="flex gap-2">
          {!broadcasting ? (
            <button
              onClick={onStart}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-sm shadow-sm uppercase flex items-center gap-1.5 cursor-pointer border-none animate-pulse"
            >
              <Play size={14} />
              Iniciar Transmissão
            </button>
          ) : (
            <button
              onClick={onEnd}
              className="px-5 py-2.5 bg-foreground hover:opacity-90 text-background font-bold text-xs rounded-sm shadow-sm uppercase flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Square size={12} />
              Parar Transmissão
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Estúdio do leiloeiro (broadcaster): solicita um token de publicação via
 * /livekit-token/ e conecta na sala LiveKit do stream. Com o stream em READY
 * o leiloeiro já pode pré-visualizar câmera/microfone (os espectadores só
 * conseguem entrar quando o stream fica LIVE via /start/).
 */
export default function BroadcasterStage({
  auctionId,
  stream,
  broadcasting,
  viewerCount,
  onRemoteViewerCountChange,
  onStart,
  onEnd,
}: BroadcasterStageProps) {
  const isActive = stream.status === LiveStreamStatus.READY || stream.status === LiveStreamStatus.LIVE;

  const {
    data: grant,
    isLoading,
    isError,
    error,
    refetch,
  } = useLiveKitTokenQuery(auctionId, stream.id, "broadcaster", isActive);

  const serverUrl = resolveLiveKitUrl(grant?.url || ENV.LIVEKIT_URL);

  if (!isActive) {
    return (
      <StagePane>
        <div className="text-center text-slate-500 p-6">
          <Radio className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold uppercase tracking-wider">A transmissão está encerrada</p>
          <p className="text-[10px] text-slate-600 mt-1">Status da live: {stream.status}</p>
        </div>
      </StagePane>
    );
  }

  if (isLoading) {
    return (
      <StagePane>
        <div className="text-center text-slate-500 p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider">Preparando o estúdio...</p>
        </div>
      </StagePane>
    );
  }

  if (isError || !grant || !serverUrl) {
    const backendMessage = getBackendErrorMessage(error);
    return (
      <StagePane>
        <div className="text-center text-slate-500 p-6 flex flex-col items-center gap-3">
          <Radio className="w-10 h-10 opacity-50" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Falha ao conectar ao estúdio</p>
          <p className="text-[10px] text-slate-600 max-w-[280px]">
            {backendMessage || (!serverUrl && grant ? "O servidor de mídia não está configurado." : "Não foi possível obter as credenciais da sala.")}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer border-none"
          >
            <RefreshCw size={12} />
            Tentar Novamente
          </button>
        </div>
      </StagePane>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={grant.token}
      connect
      video={false}
      audio={false}
      className="space-y-4"
      onError={(err) => {
        console.error("Erro na sala LiveKit:", err);
        toast.error("Erro na conexão com o estúdio de transmissão.");
      }}
    >
      <StageControls
        stream={stream}
        broadcasting={broadcasting}
        viewerCount={viewerCount}
        onRemoteViewerCountChange={onRemoteViewerCountChange}
        onStart={onStart}
        onEnd={onEnd}
      />
    </LiveKitRoom>
  );
}

