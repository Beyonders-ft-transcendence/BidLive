/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, Heart, Gavel, Tv, Clock, Award } from 'lucide-react';
import { Auction } from '../../types';

interface AuctionCardProps {
  key?: string | number;
  auction: Auction;
  onSelect: (id: string) => void;
  onWatchToggle?: (id: string, e: React.MouseEvent) => void;
  isWatched?: boolean;
}

export default function AuctionCard({
  auction,
  onSelect,
  onWatchToggle,
  isWatched = false
}: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEndingSoon, setIsEndingSoon] = useState<boolean>(false);

  useEffect(() => {
    if (auction.status !== 'ACTIVE') {
      setTimeLeft(auction.status === 'UPCOMING' ? 'Agendado' : auction.status === 'ENDED' ? 'Encerrado' : 'Cancelado');
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Encerrado');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours === 0 && minutes < 30) {
        setIsEndingSoon(true);
      } else {
        setIsEndingSoon(false);
      }

      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMins = minutes.toString().padStart(2, '0');
      const formattedSecs = seconds.toString().padStart(2, '0');

      setTimeLeft(`${formattedHours}h ${formattedMins}m ${formattedSecs}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, auction.status]);

  return (
    <div
      onClick={() => onSelect(auction.id)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/35 hover:bg-zinc-900/60 hover:border-zinc-700/80 transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-md hover:shadow-xl"
      id={`auction-card-${auction.id}`}
    >
      
      {/* Card Image and badging */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={auction.images[0]}
          alt={auction.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-90" />

        {/* Absolute indicators */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          
          {/* Auction Status Badge */}
          {auction.status === 'ACTIVE' && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-950/75 border border-zinc-800 backdrop-blur-md px-2 py-1 text-xs font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ativo
            </span>
          )}

          {auction.status === 'UPCOMING' && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-950/70 border border-sky-800/30 backdrop-blur-md px-2 py-1 text-xs font-semibold text-sky-300">
              Agendado
            </span>
          )}

          {auction.status === 'ENDED' && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-950/80 border border-zinc-800/50 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-zinc-400">
              Encerrado
            </span>
          )}

          {/* Connected Live Stream indicator */}
          {auction.status === 'ACTIVE' && auction.streamId && (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-650/80 backdrop-blur-md px-2 py-1 text-xs font-bold text-white uppercase tracking-wider bg-red-600 animate-pulse border border-red-500/50">
              <Tv className="h-3.5 w-3.5" />
              Ao Vivo
            </span>
          )}
        </div>

        {/* Watchlist Toggle Heart */}
        {onWatchToggle && (
          <button
            onClick={(e) => onWatchToggle(auction.id, e)}
            className={`absolute top-3 right-3 z-10 p-2 rounded-lg border backdrop-blur-md transition-colors ${
              isWatched
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
            title={isWatched ? 'Remover dos favoritos' : 'Acompanhar leilão'}
            id={`btn-watch-${auction.id}`}
          >
            <Heart className="h-4 w-4" fill={isWatched ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Countdown overlay banner */}
        {auction.status === 'ACTIVE' && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-zinc-950/85 border border-zinc-900 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <Clock className={`h-3.5 w-3.5 ${isEndingSoon ? 'text-red-500 animate-spin' : 'text-zinc-400'}`} />
              <span className={`text-[11px] font-mono font-medium tracking-wide ${isEndingSoon ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                {timeLeft}
              </span>
            </div>
            {isEndingSoon && (
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse font-mono">
                Últimos minutos!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Item metadata specifications */}
      <div className="flex flex-1 flex-col p-4.5">
        
        {/* Category & Stream host labels */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>{auction.category}</span>
          <span className="hover:text-zinc-400">por {auction.creatorName}</span>
        </div>

        {/* Main Product Title */}
        <h3 className="mt-1.5 font-sans font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-sky-400 transition-colors">
          {auction.title}
        </h3>

        {/* Description Snippet */}
        <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {auction.description}
        </p>

        {/* Price specs layout */}
        <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {auction.status === 'ENDED' ? 'Arremate Final' : 'Lance Atual'}
            </span>
            <span className="block text-base font-mono font-bold text-emerald-400 mt-0.5">
              R$ {auction.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {auction.status === 'ENDED' ? 'Arrematante' : 'Ofertas'}
            </span>
            {auction.status === 'ENDED' && auction.currentBidderName ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 font-sans mt-0.5">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                {auction.currentBidderName}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-zinc-300 mt-0.5">
                <Gavel className="h-3.5 w-3.5 text-sky-500" />
                {auction.bidsCount}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
