/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RefreshCw, Rss, Copy, Check, Tv, Eye, Wifi, AlertTriangle } from 'lucide-react';
import { Room, RoomEvent, VideoTrack, AudioTrack } from 'livekit-client';
import { apiService } from '../../services/api';

interface LiveStreamPlayerProps {
  streamId: string;
  streamTitle: string;
  streamerName: string;
  initialViewerCount: number;
  auctionId?: string;
}

export default function LiveStreamPlayer({
  streamId,
  streamTitle,
  streamerName,
  initialViewerCount,
  auctionId
}: LiveStreamPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(initialViewerCount);
  const [isCopied, setIsCopied] = useState(false);
  
  // LiveKit Connection States
  const [liveKitActive, setLiveKitActive] = useState(false);
  const [liveKitVideoTrack, setLiveKitVideoTrack] = useState<VideoTrack | null>(null);
  const [liveKitAudioTrack, setLiveKitAudioTrack] = useState<AudioTrack | null>(null);
  const [lkConnectionStatus, setLkConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [lkError, setLkError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);

  // Realtime simulation of fluctuating viewers count
  useEffect(() => {
    const timer = setInterval(() => {
      setViewerCount(prev => {
        const dev = Math.floor(Math.random() * 7) - 3; // Delta -3 to +3
        return Math.max(10, prev + dev);
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Connect to LiveKit Room dynamically if backend is active
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('bidlive_access');

    if (!auctionId || !streamId || !token) {
      return;
    }

    async function initLiveKit() {
      if (!active) return;
      setLkConnectionStatus('connecting');
      setLkError(null);

      try {
        const participantName = `Viewer_${Math.floor(100 + Math.random() * 900)}`;
        console.log(`[LiveKit] Requisitando token do LiveKit para o leilão ${auctionId}, stream ${streamId}...`);
        
        const tokenRes = await apiService.getLiveKitToken(auctionId, streamId, 'viewer', participantName);
        if (!tokenRes.success || !tokenRes.token) {
          throw new Error(tokenRes.message || 'Token não fornecido pelo backend.');
        }

        const roomUrl = tokenRes.url || 'wss://giovani-tippiest-overapprehensively.ngrok-free.dev';
        console.log(`[LiveKit] Conectando ao host ${roomUrl}...`);
        
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (!active) return;
          console.log(`[LiveKit] Nova track inscrita: ${track.kind} de ${participant.identity}`);
          
          if (track.kind === 'video') {
            setLiveKitVideoTrack(track as VideoTrack);
            setLiveKitActive(true);
            setLkConnectionStatus('connected');
          } else if (track.kind === 'audio') {
            setLiveKitAudioTrack(track as AudioTrack);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (!active) return;
          console.log(`[LiveKit] Track desinscrita: ${track.kind}`);
          if (track.kind === 'video') {
            setLiveKitVideoTrack(null);
            setLiveKitActive(false);
          } else if (track.kind === 'audio') {
            setLiveKitAudioTrack(null);
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          if (!active) return;
          console.log('[LiveKit] Desconectado da sala.');
          setLiveKitActive(false);
          setLkConnectionStatus('idle');
        });

        await room.connect(roomUrl, tokenRes.token);
        console.log('[LiveKit] Conectado à sala com sucesso!');
        if (active) {
          setLkConnectionStatus('connected');
        }

      } catch (err: any) {
        console.warn('[LiveKit Fallback] Falha na conexão WebSocket do Livekit. Usando simulação gráfica robusta.', err.message || err);
        if (active) {
          setLkConnectionStatus('error');
          setLkError(err.message || 'Impossível sintonizar stream.');
        }
      }
    }

    initLiveKit();

    return () => {
      active = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [auctionId, streamId]);

  // Handle attaching LiveKit video and audio tracks to HTML elements
  useEffect(() => {
    if (liveKitVideoTrack && videoRef.current && isPlaying) {
      liveKitVideoTrack.attach(videoRef.current);
    }
    return () => {
      if (liveKitVideoTrack) {
        liveKitVideoTrack.detach();
      }
    };
  }, [liveKitVideoTrack, isPlaying]);

  useEffect(() => {
    if (liveKitAudioTrack && isPlaying && !isMuted) {
      const el = liveKitAudioTrack.attach();
      return () => {
        liveKitAudioTrack.detach(el);
        el.remove();
      };
    }
  }, [liveKitAudioTrack, isPlaying, isMuted]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`rtmp://streaming.bidlive.io/live/${streamId}?key=live_sec_prod_90812`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl" id={`livestream-${streamId}`}>
      
      {/* Player window container with visual stream representations */}
      <div className="relative aspect-video w-full bg-zinc-950 flex flex-col justify-between items-center group overflow-hidden">
        
        {/* Animated simulation background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-zinc-950 to-sky-950/20 pointer-events-none" />
        
        {/* Render True LiveKit Video if Active */}
        {liveKitActive && liveKitVideoTrack ? (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover z-0 ${isPlaying ? 'block' : 'hidden'}`}
            autoPlay
            playsInline
            muted={isMuted}
          />
        ) : null}

        {/* Backdrop overlay / Falling Animations when true video track is loading or inactive */}
        {(!liveKitActive || !isPlaying) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <div className="relative flex flex-col items-center">
              
              {/* Pulsing broadcast icon */}
              <div className={`h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-400/35 backdrop-blur-sm ${
                isPlaying ? 'animate-bounce' : 'opacity-40'
              }`}>
                <Tv className="h-8 w-8 text-sky-400" />
              </div>

              {isPlaying ? (
                <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-sky-400 mt-4 animate-pulse">
                  {lkConnectionStatus === 'connecting' ? 'Procurando Feeds RTMP...' : 'Transmissão Ativa (Demo)'}
                </span>
              ) : (
                <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-500 mt-4">
                  Pausada
                </span>
              )}

              {/* Simulating live audio bars */}
              {isPlaying && (
                <div className="flex items-end gap-1 mt-3.5 h-6">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      style={{ animationDelay: `${i * 0.12}s`, height: `${12 + Math.random() * 12}px` }}
                      className="w-1 bg-gradient-to-t from-sky-500 to-indigo-500 rounded-sm animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top bar controls */}
        <div className="absolute top-3 inset-x-3 flex justify-between items-center z-10 pointer-events-none">
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-650 text-white text-[10px] uppercase font-mono font-bold tracking-widest bg-red-600 shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              Ao Vivo
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950/75 border border-zinc-800 backdrop-blur-md text-zinc-300 text-[10px] font-mono">
              <Eye className="h-3.5 w-3.5" />
              {viewerCount} espectadores
            </span>
          </div>

          <span className="px-2 py-1 rounded bg-zinc-950/60 backdrop-blur-md text-[9px] font-mono text-zinc-400">
            Qualidade: 1080p (60fps)
          </span>
        </div>

        {/* Hover Action Overlay bottom panel */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-zinc-950/90 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-zinc-900 border border-zinc-700/50 rounded-lg hover:text-white transition-colors text-zinc-300"
              title={isPlaying ? 'Pausar' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 bg-zinc-900 border border-zinc-700/50 rounded-lg hover:text-white transition-colors text-zinc-300"
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 bg-zinc-900/50 px-2 py-1 rounded">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Latência ultra-baixa (0.3s)</span>
          </div>
        </div>

      </div>

      {/* Broadcasting specs layout for streamer dashboard */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="font-sans font-bold text-white text-sm line-clamp-1">
            {streamTitle}
          </h4>
          <p className="text-zinc-500 text-xs mt-0.5">
            Gerador RTMP configurado para stream de: <span className="text-zinc-300">{streamerName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors text-xs text-zinc-300 font-sans"
            id="btn-copy-rtmp"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span>Copiar URL RTMP</span>
              </>
            )}
          </button>
          
          <button className="p-1.5 bg-indigo-950/20 hover:bg-indigo-950/50 text-indigo-400 rounded-lg border border-indigo-900/30 text-xs flex items-center gap-1.5 transition-colors">
            <Rss className="h-3.5 w-3.5" />
            <span>Chave OBS</span>
          </button>
        </div>
      </div>

    </div>
  );
}
