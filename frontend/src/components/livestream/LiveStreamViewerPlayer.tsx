import { useQueryClient } from "@tanstack/react-query";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  VideoTrack,
  useConnectionState,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import { RefreshCw, Videotape, VideoOff } from "lucide-react";
import type { LiveStream } from "@/shared/types/auction.types";
import { LiveStreamStatus } from "@/shared/types/auction.types";
import { getBackendErrorMessage, useLiveKitTokenQuery } from "@/hooks/useLiveKit";
import ENV from "@/shared/utils/env.utils";

interface LiveStreamViewerPlayerProps {
  auctionId: number;
  stream: LiveStream;
}

function PlayerNotice({
  icon,
  message,
  hint,
  action,
}: {
  icon: React.ReactNode;
  message: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6 bg-gradient-to-b from-slate-950/20 via-slate-900 to-slate-950">
      {icon}
      <p className="text-xs font-bold text-slate-100 uppercase tracking-widest leading-none">{message}</p>
      {hint && <p className="text-[10px] text-slate-500 max-w-[260px] leading-relaxed">{hint}</p>}
      {action}
    </div>
  );
}

function Spinner() {
  return <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

/**
 * Palco do espectador: assina e reproduz a track de vídeo publicada pelo
 * leiloeiro (compartilhamento de tela tem prioridade sobre a câmera).
 */
function ViewerStage() {
  const connectionState = useConnectionState();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const remoteTracks = tracks.filter((t) => !t.participant.isLocal);
  const activeTrack =
    remoteTracks.find((t) => t.source === Track.Source.ScreenShare) ??
    remoteTracks.find((t) => t.source === Track.Source.Camera);

  if (connectionState === ConnectionState.Connecting) {
    return <PlayerNotice icon={<Spinner />} message="Conectando à transmissão..." />;
  }

  if (connectionState === ConnectionState.Reconnecting) {
    return <PlayerNotice icon={<Spinner />} message="Reconectando..." hint="A conexão com a live foi interrompida. Tentando restabelecer." />;
  }

  if (!activeTrack) {
    return (
      <PlayerNotice
        icon={<VideoOff size={28} className="text-slate-500" />}
        message="Aguardando vídeo do leiloeiro"
        hint="Você está conectado à live. O vídeo aparecerá assim que o leiloeiro ativar a câmera."
      />
    );
  }

  return <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-contain" />;
}

/**
 * Player LiveKit do participante (viewer): solicita um token somente-assinatura
 * via /livekit-token/ e reproduz o vídeo/áudio da sala do stream.
 */
export default function LiveStreamViewerPlayer({ auctionId, stream }: LiveStreamViewerPlayerProps) {
  const queryClient = useQueryClient();
  const {
    data: grant,
    isLoading,
    isError,
    error,
    refetch,
  } = useLiveKitTokenQuery(auctionId, stream.id, "viewer", stream.status === LiveStreamStatus.LIVE);

  const serverUrl = grant?.url || ENV.LIVEKIT_URL;

  if (isLoading) {
    return <PlayerNotice icon={<Spinner />} message="Preparando o player..." />;
  }

  if (isError || !grant || !serverUrl) {
    const backendMessage = getBackendErrorMessage(error);
    return (
      <PlayerNotice
        icon={<Videotape size={28} className="text-slate-500" />}
        message="Não foi possível carregar a live"
        hint={backendMessage || (!serverUrl && grant ? "O servidor de mídia não está configurado." : "Verifique sua conexão e tente novamente.")}
        action={
          <button
            onClick={() => refetch()}
            className="mt-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer border-none"
          >
            <RefreshCw size={12} />
            Tentar Novamente
          </button>
        }
      />
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={grant.token}
      connect
      video={false}
      audio={false}
      className="absolute inset-0"
      onDisconnected={() => {
        // A sala foi encerrada (ex.: leiloeiro finalizou a live) — atualiza o
        // estado dos streams para a página refletir o fim da transmissão.
        queryClient.invalidateQueries({ queryKey: ["auctionStreams", auctionId] });
        queryClient.invalidateQueries({ queryKey: ["streamViewers", auctionId, stream.id] });
      }}
    >
      <ViewerStage />
      <RoomAudioRenderer />
      <StartAudio
        label="Clique para ativar o áudio"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-lg cursor-pointer border-none"
      />
    </LiveKitRoom>
  );
}
