"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  ChevronRight,
  Clock,
  Gavel,
  Heart,
  X,
  Loader2,
  Tag,
  Filter,
  ChevronLeft,
  Flame,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import auctionService from "@/services/auction.service";
import { formatCurrency, getAuctionStatusLabel, auctionStatusColor } from "@/utils/auction";
import type { Auction, AuctionCategory } from "@/types/auction.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: "", label: "Todos", icon: <Sparkles size={14} /> },
  { value: "LIVE", label: "Ao Vivo", icon: <Flame size={14} /> },
  { value: "SCHEDULED", label: "Agendado", icon: <Clock size={14} /> },
  { value: "ENDED", label: "Finalizado", icon: <ShieldCheck size={14} /> },
  { value: "SOLD", label: "Vendido", icon: <Tag size={14} /> },
];

const CONDITION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "NEW", label: "Novo" },
  { value: "USED", label: "Usado" },
  { value: "REFURBISHED", label: "Recondicionado" },
  { value: "DAMAGED", label: "Danificado" },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "-created_at", label: "Mais Recentes" },
  { value: "created_at", label: "Mais Antigos" },
  { value: "item__current_price", label: "Preço: Menor" },
  { value: "-item__current_price", label: "Preço: Maior" },
  { value: "end_time", label: "Termina Primeiro" },
  { value: "-start_time", label: "Início Recente" },
];

const PAGE_SIZE = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeLeft(endTime: string): { label: string; urgent: boolean; ended: boolean } {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return { label: "Encerrado", urgent: false, ended: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (days > 0) return { label: `${days}d ${hours}h`, urgent: false, ended: false };
  if (hours > 0) return { label: `${hours}h ${minutes}m`, urgent: hours < 2, ended: false };
  return { label: `${minutes}m ${seconds}s`, urgent: true, ended: false };
}

function getPrimaryImage(auction: Auction): string | null {
  const images = auction.item?.images;
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.is_primary);
  return primary?.file?.url || images[0]?.file?.url || null;
}

function getConditionLabel(condition: string): string {
  switch (condition) {
    case "NEW": return "Novo";
    case "USED": return "Usado";
    case "REFURBISHED": return "Recondicionado";
    case "DAMAGED": return "Danificado";
    default: return condition;
  }
}

function getConditionColor(condition: string): string {
  switch (condition) {
    case "NEW": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "USED": return "bg-amber-50 text-amber-700 border-amber-200";
    case "REFURBISHED": return "bg-blue-50 text-blue-700 border-blue-200";
    case "DAMAGED": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

// ─── Countdown Component ──────────────────────────────────────────────────────

function CountdownTimer({ endTime, status }: { endTime: string; status: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime));

  useEffect(() => {
    if (status !== "LIVE") return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, status]);

  if (status !== "LIVE") return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
        timeLeft.urgent
          ? "bg-red-500/10 text-red-500 animate-pulse"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <Clock size={10} />
      {timeLeft.label}
    </span>
  );
}

// ─── Auction Card Component ───────────────────────────────────────────────────

function AuctionCard({ auction, viewMode }: { auction: Auction; viewMode: "grid" | "list" }) {
  const image = getPrimaryImage(auction);
  const isLive = auction.status === "LIVE";
  const statusLabel = getAuctionStatusLabel(auction.status);
  const statusClasses = auctionStatusColor(auction.status);

  const cardContent = (
    <>
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 ${
          viewMode === "grid" ? "aspect-[4/3]" : "w-48 h-36 shrink-0"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={auction.item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gavel size={40} className="text-slate-300" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isLive && (
            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          {!isLive && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${statusClasses}`}>
              {statusLabel}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <button
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
            title="Adicionar aos favoritos"
          >
            <Heart size={14} />
          </button>
        </div>

        {/* Condition Badge */}
        {auction.item.condition_type && (
          <div className="absolute bottom-3 left-3">
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getConditionColor(
                auction.item.condition_type
              )}`}
            >
              {getConditionLabel(auction.item.condition_type)}
            </span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className={`flex flex-col justify-between flex-1 p-4 ${viewMode === "list" ? "py-3" : ""}`}>
        {/* Category */}
        {auction.item.category_label && (
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
            {auction.item.category_label}
          </span>
        )}

        {/* Title */}
        <h3
          className={`font-bold text-slate-800 leading-tight mb-2 group-hover:text-primary transition-colors ${
            viewMode === "grid" ? "text-sm line-clamp-2" : "text-base"
          }`}
        >
          {auction.item.title}
        </h3>

        {/* Description in list view */}
        {viewMode === "list" && auction.item.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-2">{auction.item.description}</p>
        )}

        {/* Price Row */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-100">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              {isLive ? "Lance Atual" : "Preço Inicial"}
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              {formatCurrency(isLive ? auction.item.current_price : auction.item.starting_price)}
            </p>
            {auction.item.buy_now_price && (
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                Compra imediata: {formatCurrency(auction.item.buy_now_price)}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <CountdownTimer endTime={auction.end_time} status={auction.status} />
            {auction.bids_count !== undefined && (
              <span className="text-[10px] text-slate-400 font-medium">
                {auction.bids_count} lance{auction.bids_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Link
      href={`/auction/${auction.id}`}
      className={`group bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 ${
        viewMode === "list" ? "flex flex-row" : "flex flex-col"
      }`}
    >
      {cardContent}
    </Link>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/60 overflow-hidden animate-pulse ${
        viewMode === "list" ? "flex flex-row" : "flex flex-col"
      }`}
    >
      <div
        className={`bg-slate-100 ${viewMode === "grid" ? "aspect-[4/3]" : "w-48 h-36 shrink-0"}`}
      />
      <div className="flex-1 p-4 space-y-3">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
        <div className="h-3 w-1/2 bg-slate-100 rounded" />
        <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
          <div className="h-5 w-24 bg-slate-100 rounded" />
          <div className="h-4 w-16 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExplorePage() {
  // Data
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<AuctionCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // Fetch categories
  useEffect(() => {
    auctionService
      .listCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch auctions
  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = {
      page: currentPage,
      page_size: PAGE_SIZE,
      ordering,
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedStatus) params.status = selectedStatus;
    if (selectedCategory) params.category_id = selectedCategory;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    try {
      const res = await auctionService.list(params);
      if (res.success && res.data) {
        setAuctions(res.data.results);
        setTotalCount(res.data.count);
      } else {
        setAuctions([]);
        setTotalCount(0);
      }
    } catch {
      setError("Erro ao carregar leilões. Tente novamente.");
      setAuctions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, ordering, debouncedSearch, selectedStatus, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStatus, selectedCategory, minPrice, maxPrice, ordering]);

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedStatus("");
    setSelectedCategory(null);
    setSelectedCondition("");
    setMinPrice("");
    setMaxPrice("");
    setOrdering("-created_at");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    !!debouncedSearch ||
    !!selectedStatus ||
    selectedCategory !== null ||
    !!selectedCondition ||
    !!minPrice ||
    !!maxPrice;

  // Build parent/child category tree
  const parentCategories = categories.filter((c) => c.parent === null && c.is_active);
  const childCategories = (parentId: number) =>
    categories.filter((c) => c.parent === parentId && c.is_active);

  const toggleCategoryExpand = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* ── Hero / Breadcrumb ── */}
      <section className="bg-gradient-to-r from-[#0C1B33] via-[#132d55] to-[#0C1B33] text-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight size={12} />
                <span className="text-white font-medium">Explorar Leilões</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
                Explorar Leilões
              </h1>
              <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                Encontre oportunidades incríveis. Filtre por categoria, preço, status e muito mais.
              </p>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="w-full lg:w-[420px]">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar leilões..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Status Quick Filters ── */}
      <section className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedStatus === opt.value
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                <SlidersHorizontal size={14} />
                Filtros
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                >
                  <X size={12} />
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <section className="flex-1">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
          <div className="flex gap-8">
            {/* ─── SIDEBAR (Desktop) ─── */}
            <aside className="hidden lg:block w-[280px] shrink-0">
              <div className="sticky top-[140px] space-y-6">
                {/* Categories */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Tag size={14} className="text-primary" />
                    Categorias
                  </h3>
                  <ul className="space-y-0.5">
                    <li>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedCategory === null
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Todas as categorias
                      </button>
                    </li>
                    {parentCategories.map((cat) => {
                      const children = childCategories(cat.id);
                      const isExpanded = expandedCategories.has(cat.id);
                      return (
                        <li key={cat.id}>
                          <div className="flex items-center">
                            <button
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                selectedCategory === cat.id
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {cat.name}
                            </button>
                            {children.length > 0 && (
                              <button
                                onClick={() => toggleCategoryExpand(cat.id)}
                                className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                              >
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </div>
                          {isExpanded && children.length > 0 && (
                            <ul className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-3">
                              {children.map((child) => (
                                <li key={child.id}>
                                  <button
                                    onClick={() => setSelectedCategory(child.id)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                                      selectedCategory === child.id
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-slate-500 hover:bg-slate-50"
                                    }`}
                                  >
                                    {child.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Price Filter */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Filter size={14} className="text-primary" />
                    Faixa de Preço
                  </h3>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase mb-1 block">
                        Mín
                      </label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                      />
                    </div>
                    <div className="flex items-end pb-2.5 text-slate-300">&mdash;</div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase mb-1 block">
                        Máx
                      </label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="&#8734;"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary" />
                    Condição
                  </h3>
                  <div className="space-y-1">
                    {CONDITION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedCondition(opt.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedCondition === opt.value
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ─── Mobile Sidebar Overlay ─── */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">Filtros</h3>
                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-4 space-y-6">
                    {/* Categories (Mobile) */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Categorias
                      </h4>
                      <ul className="space-y-0.5">
                        <li>
                          <button
                            onClick={() => {
                              setSelectedCategory(null);
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                              selectedCategory === null
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            Todas
                          </button>
                        </li>
                        {parentCategories.map((cat) => (
                          <li key={cat.id}>
                            <button
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                selectedCategory === cat.id
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {cat.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price (Mobile) */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Faixa de Preço
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="Mín"
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="Máx"
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    {/* Condition (Mobile) */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Condição
                      </h4>
                      <div className="space-y-1">
                        {CONDITION_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSelectedCondition(opt.value);
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                              selectedCondition === opt.value
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Apply button */}
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="w-full bg-primary text-white font-bold text-sm py-3 rounded-xl transition-colors hover:bg-primary/90"
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── MAIN CONTENT ─── */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-500">
                    {loading ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" />
                        Carregando...
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-slate-800">{totalCount}</span> leilão
                        {totalCount !== 1 ? "ões" : ""} encontrado{totalCount !== 1 ? "s" : ""}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={ordering}
                      onChange={(e) => setOrdering(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>

                  {/* View Toggle */}
                  <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "grid"
                          ? "bg-white text-primary shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      title="Visualização em grade"
                    >
                      <Grid3X3 size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "list"
                          ? "bg-white text-primary shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      title="Visualização em lista"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Pills */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap mb-5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Filtros:</span>
                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      &quot;{debouncedSearch}&quot;
                      <button onClick={() => setSearch("")} className="hover:text-primary/70">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {STATUS_OPTIONS.find((o) => o.value === selectedStatus)?.label}
                      <button onClick={() => setSelectedStatus("")} className="hover:text-primary/70">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {categories.find((c) => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory(null)} className="hover:text-primary/70">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {minPrice || "0"} &mdash; {maxPrice || "&#8734;"} AOA
                      <button
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                        }}
                        className="hover:text-primary/70"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
                  <AlertTriangle size={18} />
                  <p className="text-sm font-medium">{error}</p>
                  <button
                    onClick={fetchAuctions}
                    className="ml-auto text-xs font-bold bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                      : "flex flex-col gap-4"
                  }
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} viewMode={viewMode} />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && auctions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                    <Search size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum leilão encontrado</h3>
                  <p className="text-sm text-slate-400 text-center max-w-sm mb-6">
                    Tente ajustar os filtros ou a pesquisa para encontrar o que procura.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}

              {/* Auction Grid / List */}
              {!loading && !error && auctions.length > 0 && (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                      : "flex flex-col gap-4"
                  }
                >
                  {auctions.map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} viewMode={viewMode} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-400">
                    Página <span className="font-bold text-slate-600">{currentPage}</span> de{" "}
                    <span className="font-bold text-slate-600">{totalPages}</span>
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                            currentPage === page
                              ? "bg-primary text-white shadow-sm shadow-primary/20"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}