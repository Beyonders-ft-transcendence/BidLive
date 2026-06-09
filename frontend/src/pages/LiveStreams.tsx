/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tv, Users, Flame, Eye, Video, Trophy, ArrowUpRight, Award } from 'lucide-react';
import { Stream } from '../types';

interface LiveStreamsProps {
  streams: Stream[];
  onSelectStream: (streamId: string, watchPage: boolean) => void;
}

export default function LiveStreams({ streams, onSelectStream }: LiveStreamsProps) {
  
  // Calculate analytics
  const totalViewers = streams.reduce((acc, curr) => acc + curr.viewersCount, 0);

  // Sort channels for leaderboards ranking (by viewer count)
  const rankingStreamers = [...streams].sort((a, b) => b.viewersCount - a.viewersCount);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page header block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight font-sans flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            Transmissões em Tempo Real
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">Assista aos leilões em live, interaja no chat e dê lances de buy now sincronizados.</p>
        </div>

        {/* Live Network Analytics counts stats */}
        <div className="flex items-center gap-2 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">Espectadores Globais:</span>
          <span className="text-white font-mono font-bold text-xs flex items-center gap-1">
            <Users className="h-4 w-4 text-emerald-400" />
            {totalViewers} ON
          </span>
        </div>
      </div>

      {/* Hero broadcast banner (Highlight) */}
      {streams.length > 0 && (
        <section
          onClick={() => onSelectStream(streams[0].id, true)}
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-950/20 via-zinc-950 to-indigo-950/20 border border-red-500/10 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center cursor-pointer hover:border-red-500/35 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-radial-at-t from-red-650/10 via-transparent to-transparent opacity-40 bg-red-500" />
          
          <div className="relative aspect-video w-full md:w-80 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl shrink-0">
            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center pointer-events-none">
              <span className="h-14 w-14 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 animate-pulse">
                <Video className="h-7 w-7" />
              </span>
            </div>
            
            <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-650 text-white font-mono font-bold text-[9px] uppercase tracking-wider bg-red-600 shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              Destaque
            </span>
          </div>

          <div className="flex-1 space-y-4 text-left">
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">
                {streams[0].auctionTitle}
              </span>
              <h2 className="text-white text-xl sm:text-2xl font-black leading-tight group-hover:text-red-400 transition-colors">
                {streams[0].title}
              </h2>
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg">
              Em transmissão direta de nossa central autorizada de faturamento. Assista a apresentação detalhada do ativo e realize ofertas por intermédio das chaves WebRTC.
            </p>

            <div className="flex items-center gap-3.5 flex-wrap">
              <div className="flex items-center gap-2">
                <img src={streams[0].streamerAvatar} alt="Broadcaster" referrerPolicy="no-referrer" className="h-8 w-8 rounded-lg object-cover" />
                <span className="text-zinc-300 text-xs font-semibold">{streams[0].streamerName}</span>
              </div>
              
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                <Eye className="h-4 w-4 text-zinc-600" />
                {streams[0].viewersCount} assistindo
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main double column grid (Active Rooms list VS Rankings Leaderboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left lists (Active streams grid - 2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-zinc-100 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="h-4.5 w-4.5 text-zinc-400" />
            Canais Ativos Agora
          </h2>

          {streams.length === 0 ? (
            <div className="p-16 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-xs">
              Nenhuma transmissão ativa neste momento.
            </div>
          ) : (
            <div className="space-y-4">
              {streams.map(str => (
                <div
                  key={str.id}
                  onClick={() => onSelectStream(str.id, true)}
                  className="p-5 rounded-xl border border-zinc-850/80 bg-zinc-900/15 hover:bg-zinc-900/35 hover:border-zinc-700/85 cursor-pointer transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center border-zinc-800/40"
                  id={`stream-list-${str.id}`}
                >
                  <div className="relative aspect-video w-full sm:w-36 rounded-lg overflow-hidden bg-zinc-950 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                    <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-650 text-white font-mono font-bold text-[8px] uppercase tracking-wider bg-red-600">
                      Live
                    </span>
                  </div>

                  <div className="flex-1 text-left space-y-2">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-mono text-sky-400 font-bold block mb-0.5">
                        {str.auctionTitle}
                      </span>
                      <h3 className="font-sans font-bold text-white text-base leading-snug line-clamp-1">
                        {str.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                      <div className="flex items-center gap-1.5 font-sans font-medium text-zinc-400">
                        <img src={str.streamerAvatar} alt="Streamer" className="h-5 w-5 rounded-md object-cover" />
                        <span>{str.streamerName}</span>
                      </div>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Users className="h-3.5 w-3.5 text-zinc-500" />
                        {str.viewersCount} observadores
                      </span>
                    </div>
                  </div>

                  <button className="self-end sm:self-center px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0">
                    Assistir
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right list (Leaderboard index panel - 1 col) */}
        <div className="lg:col-span-1 space-y-5">
          <h2 className="text-zinc-100 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="h-4.5 w-4.5 text-zinc-400" />
            Ranking de Audiência
          </h2>

          <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800/85 space-y-4">
            <p className="text-[11px] text-zinc-500 leading-normal">
              Os streamers e leiloeiros mais populares das últimas 24 horas, ranqueados por pico acumulado de engajamento e lances simultâneos.
            </p>

            <div className="space-y-3.5">
              {rankingStreamers.map((str, idx) => (
                <div key={str.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/35 border border-zinc-900 flex-wrap">
                  <div className="flex items-center gap-3.5">
                    
                    {/* Rank indicator */}
                    <span className={`h-6 w-6 font-mono text-[11px] font-bold rounded-md flex items-center justify-center border ${
                      idx === 0
                        ? 'bg-amber-950/50 text-amber-500 border-amber-900/30'
                        : idx === 1
                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                      #{idx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <img src={str.streamerAvatar} alt="Broadcaster" className="h-6 w-6 rounded-md object-cover" />
                      <div className="text-left leading-normal">
                        <span className="block text-xs font-sans font-semibold text-zinc-200">{str.streamerName}</span>
                        <span className="block text-[9px] text-zinc-500 font-mono line-clamp-1">{str.streamerName} Oficial</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                      <Users className="h-3.5 w-3.5" />
                      {str.viewersCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-zinc-900/15 border border-zinc-900 rounded-lg text-[10px] text-zinc-500 font-sans leading-normal">
              Quer iniciar sua própria transmissão de leilão? Acesse o painel de anunciante e copie o RTMP Endpoint no OBS Studio.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
