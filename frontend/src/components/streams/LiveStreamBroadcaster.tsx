import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  createLocalVideoTrack,
  createLocalAudioTrack,
  LocalVideoTrack,
  LocalAudioTrack,
  ConnectionState,
} from 'livekit-client';
import { apiService } from '../../services/api';
import { Video, Mic, MicOff, Camera, CameraOff, MonitorPlay } from 'lucide-react';

interface LiveStreamBroadcasterProps {
  streamId: string;
  auctionId: string;
}

export default function LiveStreamBroadcaster({ streamId, auctionId }: LiveStreamBroadcasterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  // Guardar tracks em refs além do state para que o cleanup não dependa de closures stale
  const videoTrackRef = useRef<LocalVideoTrack | null>(null);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // BUG #2 CORRIGIDO: useEffect de limpeza sem dependências de tracks para evitar
  // recriar o cleanup (e parar tracks prematuramente) a cada mudança de estado.
  // Usamos refs para acessar os valores atuais sem colocá-los nas deps.
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      videoTrackRef.current?.stop();
      audioTrackRef.current?.stop();
    };
  }, []); // <- sem dependências: roda apenas no unmount

  // BUG #3 CORRIGIDO: função de publicação extraída para poder aguardar o
  // estado Connected do engine antes de chamar publishTrack.
  const publishTracks = useCallback(
    async (
      room: Room,
      videoTrack: LocalVideoTrack | null,
      audioTrack: LocalAudioTrack | null
    ) => {
      // BUG #1 CORRIGIDO: aguarda o engine estar realmente conectado (ConnectionState.Connected)
      // antes de tentar publicar. O room.connect() resolve quando o sinal WS é aceito,
      // mas o handshake WebRTC/DTLS pode ainda não ter terminado — publicar cedo demais
      // causa "engine not connected within timeout".
      if (room.state !== ConnectionState.Connected) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout aguardando engine do LiveKit ficar pronto para publicação.'));
          }, 10_000);

          room.once(RoomEvent.Connected, () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }

      if (videoTrack) await room.localParticipant.publishTrack(videoTrack);
      if (audioTrack) await room.localParticipant.publishTrack(audioTrack);
    },
    []
  );

  const startBroadcast = async () => {
    try {
      // 1. Pegar Token do Backend
      const tokenRes = await apiService.getLiveKitToken(
        auctionId,
        streamId,
        'broadcaster',
        'Streamer Principal'
      );
      if (!tokenRes.success || !tokenRes.token) {
        throw new Error(
          'Falha ao obter token do backend: ' + (tokenRes.message || 'Sem motivo')
        );
      }

      const roomUrl =
        tokenRes.url ||
        import.meta.env.VITE_LIVEKIT_URL ||
        'ws://localhost:7880';

      console.log('Conectando ao LiveKit:', roomUrl);

      // 2. Conectar à Sala do LiveKit
      const room = new Room();
      roomRef.current = room;

      try {
        await room.connect(roomUrl, tokenRes.token);
        console.log('Sinal WS aceito pelo LiveKit. Aguardando engine...');
      } catch (e: any) {
        throw new Error('Erro ao conectar ao servidor LiveKit (WS): ' + e.message);
      }

      // 3. Capturar Câmera e Microfone
      let videoTrack: LocalVideoTrack | null = null;
      let audioTrack: LocalAudioTrack | null = null;

      try {
        videoTrack = await createLocalVideoTrack().catch((e) => {
          console.warn('Câmera não encontrada ou em uso por outro app:', e);
          return null;
        });

        audioTrack = await createLocalAudioTrack().catch((e) => {
          console.warn('Microfone não encontrado ou em uso:', e);
          return null;
        });

        if (!videoTrack && !audioTrack) {
          throw new Error(
            'Nenhuma câmera ou microfone físico encontrado. Conecte uma webcam/microfone e tente novamente.'
          );
        }
      } catch (e: any) {
        throw new Error('Erro de Hardware: ' + e.message);
      }

      // Salvar nas refs para o cleanup do useEffect
      videoTrackRef.current = videoTrack;
      audioTrackRef.current = audioTrack;

      // Atualizar state para os controles de mute
      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      if (videoTrack && videoRef.current) {
        videoTrack.attach(videoRef.current);
      }

      // 4. Publicar — aguarda o engine estar realmente pronto (BUG #1 corrigido aqui)
      try {
        await publishTracks(room, videoTrack, audioTrack);
        console.log('Tracks publicadas com sucesso!');
      } catch (e: any) {
        throw new Error(
          'Erro ao fazer upload (publish) da mídia para o LiveKit: ' + e.message
        );
      }

      setIsPublishing(true);
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      alert(error.message || 'Erro desconhecido ao iniciar transmissão.');

      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      // Limpar refs em caso de erro
      videoTrackRef.current?.stop();
      audioTrackRef.current?.stop();
      videoTrackRef.current = null;
      audioTrackRef.current = null;
    }
  };

  const stopBroadcast = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    if (videoTrackRef.current) {
      // BUG #3 CORRIGIDO: detach com o elemento específico para limpar o frame congelado
      if (videoRef.current) {
        videoTrackRef.current.detach(videoRef.current);
      } else {
        videoTrackRef.current.detach();
      }
      videoTrackRef.current.stop();
      videoTrackRef.current = null;
    }

    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current = null;
    }

    setIsPublishing(false);
    setLocalVideoTrack(null);
    setLocalAudioTrack(null);
    setIsMuted(false);
    setIsVideoMuted(false);
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      if (isMuted) {
        localAudioTrack.unmute();
      } else {
        localAudioTrack.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      if (isVideoMuted) {
        localVideoTrack.unmute();
      } else {
        localVideoTrack.mute();
      }
      setIsVideoMuted(!isVideoMuted);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl shadow-lg mt-6">
      <h3 className="text-zinc-200 font-sans font-bold flex items-center gap-2 mb-4">
        <MonitorPlay className="h-5 w-5 text-indigo-400" />
        Central de Transmissão Ao Vivo (Estúdio)
      </h3>

      {/* Container de Preview da Câmera */}
      <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-4 border border-zinc-800">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isPublishing && !isVideoMuted ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          autoPlay
          playsInline
        />

        {!isPublishing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-950/80">
            <Camera className="h-10 w-10 mb-2 opacity-50" />
            <span className="text-sm font-mono tracking-wide">Câmera Desligada</span>
          </div>
        )}

        {isPublishing && isVideoMuted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-950/90 backdrop-blur-sm">
            <CameraOff className="h-10 w-10 mb-2 opacity-50 text-red-400" />
            <span className="text-sm font-mono tracking-wide text-red-400">Vídeo Pausado</span>
          </div>
        )}

        {isPublishing && (
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2 py-1 bg-red-600 rounded text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5 shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              Você está ON AIR
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {!isPublishing ? (
          <button
            onClick={startBroadcast}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-colors shadow-md"
          >
            <Video className="h-4 w-4" />
            Ligar Câmera e Transmitir
          </button>
        ) : (
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={toggleMute}
                className={`p-2.5 rounded-lg border transition-colors ${
                  isMuted
                    ? 'bg-red-500/10 border-red-500/50 text-red-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
                title={isMuted ? 'Desmutar Microfone' : 'Mutar Microfone'}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-2.5 rounded-lg border transition-colors ${
                  isVideoMuted
                    ? 'bg-red-500/10 border-red-500/50 text-red-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
                title={isVideoMuted ? 'Ligar Câmera' : 'Desligar Câmera'}
              >
                {isVideoMuted ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              </button>
            </div>

            <button
              onClick={stopBroadcast}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors shadow-md"
            >
              Parar Transmissão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
