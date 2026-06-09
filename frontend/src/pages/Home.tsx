/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Compass, Tv, ArrowRight, Gavel, Star, Flame, Award } from 'lucide-react';
import { Auction, Stream } from '../types';
import AuctionCard from '../components/auction/AuctionCard';

interface HomeProps {
  auctions: Auction[];
  streams: Stream[];
  onSelectAuction: (id: string) => void;
  onSelectStream: (streamId: string, watchPage: boolean) => void;
  watchlist: string[];
  onWatchToggle: (id: string, e: React.MouseEvent) => void;
}

const CATEGORIES = [
  'Relógios de Luxo',
  'Hardware & Tech',
  'Colecionáveis Raros',
  'Esportes & Outdoor',
  'Geek & HQ'
];

export default function Home({
  auctions,
  streams,
  onSelectAuction,
  onSelectStream,
  watchlist,
  onWatchToggle
}: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  // Filter hot items (status active, highest views)
  const featuredAuctions = auctions
    .filter(a => a.status === 'ACTIVE')
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  // Filter listings by search / category
  const filteredGrid = auctions
    .filter(a => {
      const matchSearch = searchQuery
        ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchCat = selectedCat ? a.category === selectedCat : true;
      return matchSearch && matchCat;
    })
    .slice(0, 6);

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Visual Immersive Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-tr from-zinc-950 via-zinc-900 to-indigo-950/40 border border-zinc-800/80 p-8 sm:p-12 md:p-16 flex flex-col justify-center text-center">
        <div className="absolute inset-0 bg-radial-at-t from-sky-500/10 via-transparent to-transparent opacity-80" />
        
        <div className="relative max-w-2xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
            <Sparkles className="h-4 w-4 text-sky-400" />
            Leilões de Alta Performance em Tempo Real
          </span>
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
            Descubra Ativos de Valor em <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Alta Velocidade</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Participe de disputas em frações de segundos, assista transmissões ao vivo direto com os leiloeiros e garanta colecionáveis exclusivos com tecnologia RTMP.
          </p>

          {/* Search bar helper */}
          <div className="w-full max-w-lg mx-auto relative mt-4">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar relógios, estações de IA, colecionáveis PSA..."
              className="w-full h-12 pl-11 pr-4 bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-md"
              id="hero-search"
            />
          </div>
        </div>
      </section>

      {/* 2. Horizontal Categories Strip */}
      <section className="space-y-4">
        <h2 className="text-zinc-100 text-xs uppercase tracking-wider font-mono font-bold flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-sky-400" />
          Navegar por Categorias
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedCat(null)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
              selectedCat === null
                ? 'bg-sky-500/10 border-sky-400/40 text-sky-300'
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                selectedCat === cat
                  ? 'bg-sky-500/10 border-sky-400/40 text-sky-300'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Hot Carousels (Only visible if showing general catalog) */}
      {!searchQuery && !selectedCat && featuredAuctions.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-zinc-100 text-xs uppercase tracking-wider font-mono font-bold flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-red-500 animate-pulse" />
            Em Destaque Agora (Realtime)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAuctions.map(auc => {
              const connectedStream = streams.find(s => s.auctionId === auc.id);
              return (
                <div
                  key={auc.id}
                  onClick={() => onSelectAuction(auc.id)}
                  className="group relative rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/70 to-zinc-950 p-5 hover:border-zinc-700/80 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-950">
                    <img
                      src={auc.images[0]}
                      alt={auc.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform group-hover:scale-103 duration-500"
                    />
                    {connectedStream && (
                      <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded bg-red-650 text-white font-mono font-bold text-[9px] uppercase tracking-wider bg-red-600 animate-pulse">
                        <Tv className="h-3 w-3" />
                        Live Stream
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-sans font-bold text-white text-base group-hover:text-sky-400 transition-colors line-clamp-1">
                      {auc.title}
                    </h3>
                    <div className="mt-3 flex justify-between items-center bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
                      <div>
                        <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Última Oferta</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm">
                          R$ {auc.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Visualizações</span>
                        <span className="text-zinc-300 font-mono text-xs font-semibold">{auc.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Live Broadcast channels streams (Twitch layout teaser) */}
      {streams.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-zinc-100 text-xs uppercase tracking-wider font-mono font-bold flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              Canais Transmitindo Ao Vivo
            </h2>
            <button
              onClick={() => onSelectStream(streams[0].id, false)}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors"
            >
              Ver todas as lives
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {streams.map(str => (
              <div
                key={str.id}
                onClick={() => onSelectStream(str.id, true)}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700/80 cursor-pointer transition-all"
              >
                <div className="relative aspect-video w-full sm:w-44 rounded-lg overflow-hidden bg-zinc-950 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                  
                  {/* Decorative waveform equalizer icons to signify live status */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-mono font-bold text-white px-1.5 py-0.5 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-650 animate-pulse bg-red-500" />
                    <span>Live</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-sky-400 font-semibold mb-1 block">
                      {str.auctionTitle}
                    </span>
                    <h3 className="font-sans font-bold text-white text-sm line-clamp-2 leading-relaxed">
                      {str.title}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <img
                      src={str.streamerAvatar}
                      alt={str.streamerName}
                      referrerPolicy="no-referrer"
                      className="h-6 w-6 rounded-md object-cover"
                    />
                    <div className="text-left text-[11px] font-medium text-zinc-400">
                      <span>{str.streamerName}</span>
                      <span className="text-zinc-600 block text-[9px] font-mono">
                        {str.viewersCount} assistindo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. General Grid List */}
      <section className="space-y-5">
        <h2 className="text-zinc-100 text-xs uppercase tracking-wider font-mono font-bold flex items-center gap-1.5">
          <Gavel className="h-4 w-4 text-sky-400" />
          Leilões Disponíveis
        </h2>
        {filteredGrid.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl space-y-2">
            <p className="text-zinc-400 text-sm">Nenhum leilão correspondente localizado no banco.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCat(null); }}
              className="text-xs text-sky-400 font-semibold underline"
            >
              Redefinir filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGrid.map(auc => (
              <AuctionCard
                key={auc.id}
                auction={auc}
                onSelect={onSelectAuction}
                onWatchToggle={onWatchToggle}
                isWatched={watchlist.includes(auc.id)}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

// Sparkles helper icon declaration
function Sparkles(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </svg>
  );
}
