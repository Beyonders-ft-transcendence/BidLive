/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Filter, SlidersHorizontal, Grid, List, Search, RefreshCw, X } from 'lucide-react';
import { Auction } from '../types';
import AuctionCard from '../components/auction/AuctionCard';

interface AuctionsProps {
  auctions: Auction[];
  onSelectAuction: (id: string) => void;
  watchlist: string[];
  onWatchToggle: (id: string, e: React.MouseEvent) => void;
}

type SortOption = 'price-desc' | 'price-asc' | 'views-desc' | 'ending-soon';

export default function Auctions({
  auctions,
  onSelectAuction,
  watchlist,
  onWatchToggle
}: AuctionsProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [sortBy, setSortBy] = useState<SortOption>('ending-soon');

  // Categories helper
  const categories = ['All', 'Relógios de Luxo', 'Hardware & Tech', 'Colecionáveis Raros', 'Esportes & Outdoor', 'Geek & HQ'];

  // Perform filtering
  const filtered = auctions.filter(auc => {
    const matchSearch = auc.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
                        auc.description.toLowerCase().includes(filterQuery.toLowerCase());
    const matchCategory = filterCategory === 'All' ? true : auc.category === filterCategory;
    const matchStatus = filterStatus === 'All' ? true : auc.status === filterStatus;

    return matchSearch && matchCategory && matchStatus;
  });

  // Perform sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-desc') return b.currentPrice - a.currentPrice;
    if (sortBy === 'price-asc') return a.currentPrice - b.currentPrice;
    if (sortBy === 'views-desc') return b.views - a.views;
    if (sortBy === 'ending-soon') {
      const aEnd = new Date(a.endTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return aEnd - bEnd;
    }
    return 0;
  });

  const clearAllFilters = () => {
    setFilterQuery('');
    setFilterCategory('All');
    setFilterStatus('ACTIVE');
    setSortBy('ending-soon');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Page Title Header */}
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight font-sans">Leilões Disponíveis</h1>
        <p className="text-zinc-400 text-xs mt-0.5">Explore ativos verificados sob supervisão técnica da consultoria.</p>
      </div>

      {/* Control Strip (Search, Sort and Filters) */}
      <div className="flex flex-col md:flex-row gap-3.5 items-center justify-between pb-4 border-b border-zinc-900">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Pesquisar por leilões..."
            className="w-full h-10 pl-9.5 pr-4 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            id="listings-search"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Summary / Reset and Sort Selection */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs font-semibold px-3 py-2 border border-zinc-900 hover:bg-zinc-900/50 rounded-lg transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Limpar filtros
          </button>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs font-mono font-medium">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none pr-8 relative cursor-pointer"
              id="sort-select"
            >
              <option value="ending-soon">Término próximo</option>
              <option value="price-desc">Preço: Maior primeiro</option>
              <option value="price-asc">Preço: Menor primeiro</option>
              <option value="views-desc">Mais acessados</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Core Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Floating filtration sidebar column */}
        <aside className="lg:col-span-1 space-y-6">
          
          {/* Category Filter Group */}
          <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800/85">
            <h3 className="font-sans font-bold text-zinc-300 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-sky-400" />
              Categorias
            </h3>
            <div className="space-y-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between ${
                    filterCategory === cat
                      ? 'bg-sky-500/10 text-sky-300 font-medium'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                  }`}
                >
                  <span>{cat === 'All' ? 'Todas as Categorias' : cat}</span>
                  {filterCategory === cat && <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter Group */}
          <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800/85">
            <h3 className="font-sans font-bold text-zinc-300 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4 text-sky-400" />
              Estado do Registro
            </h3>
            <div className="space-y-1.5">
              {[
                { label: 'Ativos (Ao Vivo)', val: 'ACTIVE' },
                { label: 'Agendados (Próximos)', val: 'UPCOMING' },
                { label: 'Encerrados', val: 'ENDED' },
                { label: 'Todos os Status', val: 'All' }
              ].map(st => (
                <button
                  key={st.val}
                  onClick={() => setFilterStatus(st.val)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between ${
                    filterStatus === st.val
                      ? 'bg-sky-500/10 text-sky-300 font-medium'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                  }`}
                >
                  <span>{st.label}</span>
                  {filterStatus === st.val && <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Verification banner side element */}
          <div className="p-4 bg-gradient-to-br from-indigo-950/20 to-zinc-950/80 border border-indigo-900/40 rounded-xl">
            <p className="text-[11px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Garantia Integrada</p>
            <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed">
              Todos os lances registrados passam por nosso processador KYC em conformidade com as regras RBAC descritas no arquivo técnico.
            </p>
          </div>

        </aside>

        {/* Listings column */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 font-medium">
            <span>Listando {sorted.length} registros encontrados</span>
            <div className="flex items-center gap-1">
              <button className="p-2 border border-zinc-800 bg-zinc-900 rounded text-zinc-300 hover:text-white transition-colors cursor-pointer">
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-xl space-y-4">
              <p className="text-zinc-500 text-sm font-sans">Nenhum leilão corresponde aos filtros aplicados.</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-xs font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/35 rounded-lg transition-colors"
                id="btn-listing-reset-filters"
              >
                Limpar Todos os Ajustes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {sorted.map(auc => (
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
        </main>

      </div>
    </div>
  );
}
