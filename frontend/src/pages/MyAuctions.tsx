/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlusCircle, Info, Clock, Sparkles, Check } from 'lucide-react';
import { User } from '../types';
import { apiService, AuctionCategory } from '../services/api';

export interface CreateAuctionInput {
  title: string;
  description: string;
  categoryId: number | null;
  categoryName: string;
  images: string[];
  startPrice: number;
  buyNowPrice: number | null;
  minIncrement: number;
  startTime: string;
  endTime: string;
}

interface MyAuctionsProps {
  currentUser: User;
  onCreateAuction: (auctionData: CreateAuctionInput) => Promise<{ success: boolean; message?: string }>;
}

export default function MyAuctions({ currentUser, onCreateAuction }: MyAuctionsProps) {
  const [categories, setCategories] = useState<AuctionCategory[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('1000');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('100');
  const [endHours, setEndHours] = useState('24'); // Duration of the auction in hours
  const [mainImageUrl, setMainImageUrl] = useState('https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=600&h=400&q=80');

  const [formSuccess, setFormSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiService.getCategories().then((res) => {
      if (res.success && res.categories.length > 0) {
        setCategories(res.categories);
        setCategoryId(res.categories[0].id);
      }
    });
  }, []);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Por favor, preencha o título e a descrição contendo os detalhes do ativo.');
      return;
    }

    const startPr = parseFloat(startPrice);
    const buyNowPr = buyNowPrice ? parseFloat(buyNowPrice) : null;
    const minInc = parseFloat(minIncrement);
    const hrs = parseFloat(endHours);

    if (isNaN(startPr) || startPr <= 0) {
      setErrorMsg('O preço inicial do pregão deve ser um número positivo.');
      return;
    }

    if (buyNowPr !== null && buyNowPr <= startPr) {
      setErrorMsg('O preço de Arremate Imediato (Buy Now) deve exceder o preço inicial de lances.');
      return;
    }

    if (isNaN(minInc) || minInc <= 0) {
      setErrorMsg('O incremento mínimo de oferta deve ser positivo.');
      return;
    }

    const startTime = new Date().toISOString();
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hrs);

    setIsSubmitting(true);
    const result = await onCreateAuction({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      categoryName: selectedCategory?.name || 'Misto',
      images: [mainImageUrl],
      startPrice: startPr,
      buyNowPrice: buyNowPr,
      minIncrement: minInc,
      startTime,
      endTime: endTime.toISOString(),
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Erro ao publicar o lote no backend.');
      return;
    }

    setFormSuccess(true);
    setTitle('');
    setDescription('');
    setStartPrice('1000');
    setBuyNowPrice('');
    setMinIncrement('100');

    setTimeout(() => setFormSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title section */}
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight font-sans">Publicar Novo Lote</h1>
        <p className="text-zinc-500 text-xs mt-0.5">Cadastrar novos bens na plataforma. Lotes ativos aparecem imediatamente no feed de buscas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left side: Form creator fields (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-5">
          
          <h2 className="text-zinc-300 font-sans font-bold text-sm border-b border-zinc-900 pb-3 flex items-center gap-1.5">
            <PlusCircle className="h-4.5 w-4.5 text-sky-400" />
            Especificações do Leilão
          </h2>

          {formSuccess && (
            <div className="p-3 text-xs text-emerald-400 rounded-lg bg-emerald-950/40 border border-emerald-900/45 flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              Lote publicado e inserido no leilão ativo com sucesso! 🎉
            </div>
          )}

          {errorMsg && (
            <div className="p-3 text-xs text-red-400 rounded-lg bg-red-950/40 border border-red-900/40">
              {errorMsg}
            </div>
          )}

          {/* Form inputs */}
          <div className="space-y-1.5 text-left">
            <label className="text-zinc-500 text-xs font-mono font-bold block">Título do Anúncio</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Rolex Daytona Platinum Ice Blue Dial"
              className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-650 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              id="auction-title-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5 text-left">
              <label className="text-zinc-500 text-xs font-mono font-bold block">Categoria</label>
              <select
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer appearance-none"
                id="auction-category-select"
              >
                {categories.length === 0 ? (
                  <option value="">Carregando categorias...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-zinc-500 text-xs font-mono font-bold block">Duração do Pregão (Horas)</label>
              <select
                value={endHours}
                onChange={(e) => setEndHours(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer appearance-none"
                id="auction-duration-select"
              >
                <option value="1">1 hora (Pregão Rápido)</option>
                <option value="6">6 horas</option>
                <option value="12">12 horas</option>
                <option value="24">24 horas (Padrão)</option>
                <option value="48">48 horas</option>
              </select>
            </div>

          </div>

          {/* Image url preview */}
          <div className="space-y-1.5 text-left">
            <label className="text-zinc-500 text-xs font-mono font-bold block">Imagem Principal (URL)</label>
            <input
              type="text"
              required
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-900 border border-zinc-805 text-white text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono border-zinc-800"
              id="auction-image-input"
            />
            <span className="block text-[10px] text-zinc-650 font-mono">Para melhor exibição, preencha links retangulares (Aspecto 16:9).</span>
          </div>

          {/* Description text area */}
          <div className="space-y-1.5 text-left">
            <label className="text-zinc-500 text-xs font-mono font-bold block">Descrição Detalhada do Ativo</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as condições estéticas, selos mecânicos de autenticidade, histórico de proprietários e documentação acessória inclusa no envio..."
              className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-650 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed"
              id="auction-desc-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-1.5 text-left">
              <label className="text-zinc-500 text-xs font-mono font-bold block">Preço Inicial (Lance Base)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono">R$</span>
                <input
                  type="number"
                  required
                  value={startPrice}
                  onChange={(e) => setStartPrice(e.target.value)}
                  className="w-full h-10 pl-8 pr-2 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  id="auction-price-input"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-zinc-500 text-xs font-mono font-bold block">Incremento Mínimo</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono">R$</span>
                <input
                  type="number"
                  required
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(e.target.value)}
                  className="w-full h-10 pl-8 pr-2 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  id="auction-increment-input"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-zinc-500 text-xs font-mono font-bold block">Compra Imediata (Buy Now)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono">R$</span>
                <input
                  type="number"
                  value={buyNowPrice}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                  placeholder="Opcional"
                  className="w-full h-10 pl-8 pr-2 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-650 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  id="auction-buynow-input"
                />
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-zinc-900 text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 hover:text-white font-bold text-white text-xs rounded-lg shadow-md transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
              id="btn-create-auction-submit"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Publicar Lote Oficial
            </button>
          </div>

        </form>

        {/* Right side: Realtime responsive rendering mockup card preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <h3 className="text-zinc-500 text-[10px] tracking-wider uppercase font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-sky-400" />
            Visualização Prévia do Cartão
          </h3>

          <div className="border border-zinc-800 rounded-xl bg-zinc-900/25 p-4 flex flex-col pointer-events-none">
            
            {/* Simulation card layout wrapper */}
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 relative">
              <img
                src={mainImageUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=600&h=400&q=80'}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover opacity-80"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=600&h=400&q=80';
                }}
              />
              <div className="absolute top-2.5 left-2.5 flex gap-1">
                <span className="px-2 py-0.5 rounded bg-zinc-950/80 text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  Ativo Preview
                </span>
              </div>
              <div className="absolute bottom-2.5 inset-x-2.5 p-2 rounded bg-zinc-950/90 text-left flex items-center gap-1 text-[10px] font-mono text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span>Restam {endHours} horas</span>
              </div>
            </div>

            <div className="pt-4 text-left">
              <span className="text-[10px] font-mono text-zinc-500">{selectedCategory?.name || 'Categoria'}</span>
              <h4 className="text-white text-base font-bold mt-1 line-clamp-1">
                {title || 'Título provisório do ativo'}
              </h4>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed h-8">
                {description || 'Sua descrição detalhada aparecerá aqui assim que começar a digitar informações no editor esquerdo.'}
              </p>

              <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-zinc-500 font-mono uppercase">Preço Inicial</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm block">
                    R$ {(parseFloat(startPrice) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-zinc-500 font-mono uppercase">Mínimo Incremento</span>
                  <span className="text-zinc-300 font-mono font-bold text-xs block">
                    R$ {(parseFloat(minIncrement) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Validation conditions tip */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900/80 text-left space-y-2">
            <h4 className="text-zinc-400 text-xs font-bold leading-none flex items-center gap-1">
              <Info className="h-4 w-4 text-sky-400" />
              Regras do Pregão
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Os bens cadastrados entram imediatamente no ar para todos os investidores. O faturamento e entrega ficam condicionados à consolidação de faturamento via auditores autorizados.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
