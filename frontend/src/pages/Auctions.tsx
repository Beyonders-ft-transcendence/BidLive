import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuctionsQuery, useAuctionStreamsQuery } from "@/hooks/useAuction";
import { useCategoriesQuery } from "@/hooks/useCategory";
import {
    List, Grid2X2, Search, ChevronRight,
    Clock, DollarSign, Activity,
    SlidersHorizontal, X, ArrowRight, PlayCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

const AuctionLiveBadge = ({ auctionId, status }: { auctionId: number, status: string }) => {
    const { t } = useTranslation();
    const { data: streams } = useAuctionStreamsQuery(auctionId, status === 'LIVE');
    const isActuallyLive = status === 'LIVE' && streams?.some((s: any) => s.status === 'LIVE');
    
    if (isActuallyLive) {
        return (
            <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md border border-red-400/50 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5 z-10 transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {t('auctions.live')}
            </div>
        );
    }
    return null;
};

const AuctionLiveText = ({ auctionId, status, viewType }: { auctionId: number, status: string, viewType?: 'list' | 'grid' }) => {
    const { t } = useTranslation();
    const { data: streams } = useAuctionStreamsQuery(auctionId, status === 'LIVE');
    const isActuallyLive = status === 'LIVE' && streams?.some((s: any) => s.status === 'LIVE');
    
    return (
        <span className={`inline-flex items-center gap-1.5 ${viewType === 'list' ? 'text-[10px] sm:text-[11px]' : 'text-[10px]'} font-bold uppercase tracking-wider ${isActuallyLive ? 'text-red-500' : 'text-primary/70'}`}>
            <Activity className={viewType === 'list' ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-3 h-3"} />
            {isActuallyLive ? t('auctions.live') : status === 'LIVE' ? t('auctions.scheduled') : status === 'SCHEDULED' ? t('auctions.scheduled') : t('auctions.ended')}
        </span>
    );
};

export default function AuctionsPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('auctions.title'));

    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");
    const [ordering, setOrdering] = useState<string>("");
    const [isFeatured, setIsFeatured] = useState<boolean>(false);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [startsAfter, setStartsAfter] = useState<string>("");
    const [endsBefore, setEndsBefore] = useState<string>("");
    const [viewType, setViewType] = useState<"grid" | "list">("grid");
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const { data: auctionsData, isLoading } = useAuctionsQuery({
        page,
        page_size: 10,
        category_id: selectedCategory || undefined,
        status: selectedStatus || undefined,
        search: search || undefined,
        ordering: ordering || undefined,
        is_featured: isFeatured || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        starts_after: startsAfter ? new Date(startsAfter).toISOString() : undefined,
        ends_before: endsBefore ? new Date(endsBefore).toISOString() : undefined,
    });

    const { data: categoriesData } = useCategoriesQuery();

    const auctions = auctionsData?.results || [];
    const totalCount = auctionsData?.count || 0;
    const categories = categoriesData || [];

    const hasActiveFilters = !!(selectedCategory || selectedStatus || search || minPrice || maxPrice || startsAfter || endsBefore || isFeatured);

    const handleCategoryClick = (id: number) => {
        setSelectedCategory(prev => prev === id ? null : id);
        setPage(1);
    };
    const handleStatusClick = (status: string) => {
        setSelectedStatus(prev => prev === status ? null : status);
        setPage(1);
    };
    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedStatus(null);
        setSearch("");
        setOrdering("");
        setIsFeatured(false);
        setMinPrice("");
        setMaxPrice("");
        setStartsAfter("");
        setEndsBefore("");
        setPage(1);
    };

    const FilterPanel = () => (
        <div className="space-y-7">
            {/* Search */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-foreground/80">{t('auctions.search_title')}</h3>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder={t('auctions.search_placeholder')}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full border border-border/80 bg-background/50 backdrop-blur-sm rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground shadow-sm group-hover:border-primary/50"
                    />
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                </div>
            </div>

            {/* Status */}
            <div className="border-t border-border/40 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-foreground/80">{t('auctions.status')}</h3>
                <div className="flex flex-col gap-3">
                    {[{ value: 'LIVE', label: t('auctions.live') }, { value: 'SCHEDULED', label: t('auctions.scheduled_pl') }, { value: 'ENDED', label: t('auctions.ended_pl') }].map((status) => (
                        <label key={status.value} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 flex-shrink-0 ${selectedStatus === status.value ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)] scale-110' : 'border-border/80 bg-muted/30 group-hover:border-primary/50 group-hover:bg-muted/50'}`}>
                                {selectedStatus === status.value && <span className="text-[10px] font-black">✓</span>}
                            </div>
                            <span className={`text-sm transition-colors ${selectedStatus === status.value ? 'font-bold text-foreground' : 'text-muted-foreground group-hover:text-foreground/80'}`}>{status.label}</span>
                            <input type="checkbox" className="hidden" checked={selectedStatus === status.value} onChange={() => handleStatusClick(status.value)} />
                        </label>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="border-t border-border/40 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-foreground/80">{t('auctions.categories')}</h3>
                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 flex-shrink-0 ${selectedCategory === cat.id ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)] scale-110' : 'border-border/80 bg-muted/30 group-hover:border-primary/50 group-hover:bg-muted/50'}`}>
                                {selectedCategory === cat.id && <span className="text-[10px] font-black">✓</span>}
                            </div>
                            <span className={`text-sm transition-colors line-clamp-1 ${selectedCategory === cat.id ? 'font-bold text-foreground' : 'text-muted-foreground group-hover:text-foreground/80'}`}>{cat.name}</span>
                            <input type="checkbox" className="hidden" checked={selectedCategory === cat.id} onChange={() => handleCategoryClick(cat.id)} />
                        </label>
                    ))}
                    {categories.length === 0 && <div className="text-xs text-muted-foreground italic">{t('auctions.no_categories')}</div>}
                </div>
            </div>

            {/* Featured */}
            <div className="border-t border-border/40 pt-6">
                <label className="flex items-center gap-3 cursor-pointer group bg-gradient-to-r from-yellow-500/10 to-transparent p-3 rounded-md border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 flex-shrink-0 ${isFeatured ? 'bg-yellow-500 border-yellow-500 text-white shadow-[0_0_10px_rgba(234,179,8,0.4)] scale-110' : 'border-yellow-500/50 bg-background group-hover:border-yellow-500'}`}>
                        {isFeatured && <span className="text-[10px] font-black">✓</span>}
                    </div>
                    <span className={`text-sm ${isFeatured ? 'font-bold text-yellow-600 dark:text-yellow-400' : 'text-yellow-600/80 dark:text-yellow-400/80'}`}>{t('auctions.only_featured')}</span>
                    <input type="checkbox" className="hidden" checked={isFeatured} onChange={(e) => { setIsFeatured(e.target.checked); setPage(1); }} />
                </label>
            </div>

            {/* Price Range */}
            <div className="border-t border-border/40 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-foreground/80">{t('auctions.price_range')}</h3>
                <div className="flex items-center gap-3">
                    <input type="number" placeholder={t('auctions.min')} value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} className="w-full border border-border/80 bg-background/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground" />
                    <span className="text-muted-foreground/50 font-light">-</span>
                    <input type="number" placeholder={t('auctions.max')} value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} className="w-full border border-border/80 bg-background/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground" />
                </div>
            </div>

            {/* Period */}
            <div className="border-t border-border/40 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-foreground/80">{t('auctions.period')}</h3>
                <div className="flex flex-col gap-3">
                    <input type="datetime-local" value={startsAfter} onChange={(e) => { setStartsAfter(e.target.value); setPage(1); }} className="w-full border border-border/80 bg-background/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-muted-foreground dark:[color-scheme:dark]" title={t('auctions.starts_after')} />
                    <input type="datetime-local" value={endsBefore} onChange={(e) => { setEndsBefore(e.target.value); setPage(1); }} className="w-full border border-border/80 bg-background/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-muted-foreground dark:[color-scheme:dark]" title={t('auctions.ends_before')} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <Header />

            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-card border-b border-border/50">
                {/* Decorative Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-foreground">
                            {t('auctions.title')}
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
                            Descubra lotes exclusivos, faça os seus lances em tempo real e assista a leilões ao vivo com transmissão em vídeo. A sua próxima grande aquisição começa aqui.
                        </p>
                    </div>
                </div>
            </div>

            {/* TOP BAR / BREADCRUMB */}
            <div className="w-full bg-background/80 backdrop-blur-md sticky top-[72px] z-40 border-b border-border/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
                    <div className="flex items-center text-sm font-medium text-muted-foreground gap-2 min-w-0">
                        <Link to="/" className="hover:text-primary transition-colors whitespace-nowrap">{t('auctions.home')}</Link>
                        <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50" />
                        <span className="text-foreground whitespace-nowrap">{t('auctions.title')}</span>
                        {!isLoading && (
                            <span className="hidden sm:inline-flex ml-3 px-2.5 py-0.5 rounded-full bg-muted border border-border text-[10px] uppercase tracking-wider font-bold text-foreground">
                                {totalCount} {t('auctions.auctions_found')}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <select
                            value={ordering}
                            onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                            className="hidden sm:block border border-border/80 rounded-md px-3 py-1.5 text-xs font-semibold bg-muted/30 outline-none hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground cursor-pointer"
                        >
                            <option value="">{t('auctions.order_relevance')}</option>
                            <option value="-created_at">{t('auctions.order_recent')}</option>
                            <option value="current_price">{t('auctions.order_price_asc')}</option>
                            <option value="-current_price">{t('auctions.order_price_desc')}</option>
                            <option value="end_time">{t('auctions.order_ending_soon')}</option>
                        </select>
                        <div className="flex items-center gap-1 border border-border/80 rounded-md p-1 bg-muted/30">
                            <button onClick={() => setViewType("list")} className={`p-1.5 rounded-md transition-all ${viewType === 'list' ? 'text-primary bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted/80'}`} title={t('auctions.view_list')}>
                                <List className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewType("grid")} className={`p-1.5 rounded-md transition-all ${viewType === 'grid' ? 'text-primary bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted/80'}`} title={t('auctions.view_grid')}>
                                <Grid2X2 className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className={`lg:hidden flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-md border transition-all shadow-sm ${hasActiveFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:bg-muted'}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {t('auctions.filters')}
                            {hasActiveFilters && <span className="bg-background text-primary w-4 h-4 flex items-center justify-center rounded-full leading-none ml-1 shadow-sm">!</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sort bar */}
            <div className="sm:hidden bg-background border-b border-border/60 px-4 py-3">
                <select value={ordering} onChange={(e) => { setOrdering(e.target.value); setPage(1); }} className="w-full border border-border/80 rounded-md px-3 py-2.5 text-sm font-semibold bg-muted/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground cursor-pointer">
                    <option value="">{t('auctions.order_relevance_mobile')}</option>
                    <option value="-created_at">{t('auctions.order_recent')}</option>
                    <option value="current_price">{t('auctions.order_price_asc')}</option>
                    <option value="-current_price">{t('auctions.order_price_desc')}</option>
                    <option value="end_time">{t('auctions.order_ending_soon')}</option>
                </select>
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="flex flex-row gap-8 items-start">

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-[300px] flex-shrink-0">
                        <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm sticky top-[160px]">
                            <div className="flex items-center justify-between pb-5 mb-6 border-b border-border/40">
                                <h2 className="font-black text-lg tracking-tight flex items-center gap-2 text-foreground">
                                    <SlidersHorizontal className="w-5 h-5 text-primary" /> {t('auctions.filters')}
                                </h2>
                                {hasActiveFilters && (
                                    <button onClick={handleClearFilters} className="text-xs text-muted-foreground hover:text-primary font-bold uppercase tracking-wider transition-colors">{t('auctions.clear')}</button>
                                )}
                            </div>
                            <FilterPanel />
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="flex-1 min-w-0 flex flex-col gap-6">
                        
                        <div className={viewType === 'list' ? "space-y-4 sm:space-y-5" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"}>
                            {isLoading ? (
                                <div className="py-32 flex flex-col items-center justify-center gap-4 text-muted-foreground col-span-full">
                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <span className="font-bold tracking-wider uppercase text-xs">{t('auctions.fetching')}</span>
                                </div>
                            ) : auctions.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center text-center bg-card border border-dashed border-border/80 rounded-md col-span-full px-6">
                                    <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-bold text-foreground mb-1">Nenhum leilão encontrado</h3>
                                    <p className="text-sm text-muted-foreground max-w-md">{t('auctions.no_auctions')}</p>
                                    {hasActiveFilters && (
                                        <button onClick={handleClearFilters} className="mt-6 px-6 py-2.5 bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider rounded-md hover:bg-primary/20 transition-colors">
                                            Limpar Filtros
                                        </button>
                                    )}
                                </div>
                            ) : auctions.map((auction) => {
                                const item = auction.item;
                                const currentPrice = item.current_price || item.starting_price;
                                return (
                                    <Link key={auction.id} to={`/auction/${auction.id}`} className={`group bg-card border border-border/50 rounded-md overflow-hidden hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 dark:shadow-none transition-all duration-500 flex ${viewType === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}>

                                        {/* Image Container */}
                                        <div className={`${viewType === 'list' ? 'w-full sm:w-[240px] md:w-[280px] h-[200px] sm:h-auto flex-shrink-0 border-b sm:border-b-0 sm:border-r' : 'w-full h-[220px] sm:h-[240px] border-b'} bg-muted relative flex items-center justify-center border-border/50 overflow-hidden`}>
                                            {item.images?.[0]?.image_url ? (
                                                <img src={item.images[0].image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                            ) : (
                                                <div className="text-muted-foreground font-semibold text-sm p-4 text-center">{t('auctions.no_photo')}</div>
                                            )}
                                            
                                            {/* Gradient Overlay for legibility */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 sm:opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                                            
                                            <AuctionLiveBadge auctionId={auction.id} status={auction.status} />
                                            
                                            {viewType === 'grid' && item.category?.name && (
                                                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md border border-border/50 text-[10px] font-bold px-2.5 py-1 rounded-full text-foreground uppercase tracking-wider shadow-sm z-10">
                                                    {item.category.name}
                                                </div>
                                            )}

                                            {/* Hover Play/View Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                                <div className="w-14 h-14 bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-lg backdrop-blur-md">
                                                    {auction.status === 'LIVE' ? <PlayCircle className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
                                                </div>
                                            </div>
                                        </div>

                                        {viewType === 'list' ? (
                                            <>
                                                <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <h3 className="text-foreground font-black text-lg sm:text-xl line-clamp-2 group-hover:text-primary transition-colors" title={item.title}>{item.title}</h3>
                                                            {item.category?.name && (
                                                                <span className="hidden sm:inline-flex flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-full">{item.category.name}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4">
                                                            {item.description || t('auctions.no_description')}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-border/50">
                                                        <AuctionLiveText auctionId={auction.id} status={auction.status} viewType="list" />
                                                        {auction.end_time && (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(auction.end_time).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                            <DollarSign className="w-4 h-4" />
                                                            {t('auctions.min_bid')} {item.starting_price} Kz
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 p-5 sm:p-6 sm:border-l border-t sm:border-t-0 border-border/50 flex flex-col justify-center items-center bg-muted/5 w-full sm:w-[200px] xl:w-[240px]">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('auctions.current_bid_label')}</p>
                                                    <div className="text-2xl sm:text-3xl font-black text-primary text-center tracking-tight mb-1">
                                                        {currentPrice}<span className="text-sm font-bold text-primary/60 ml-1">Kz</span>
                                                    </div>
                                                    {item.buy_now_price && (
                                                        <p className="text-xs font-semibold text-muted-foreground mt-1 text-center bg-background border border-border px-3 py-1 rounded-full">{t('auctions.buy_now_already')} {item.buy_now_price} Kz</p>
                                                    )}
                                                    
                                                    <div className="mt-5 w-full bg-foreground text-background group-hover:bg-primary group-hover:text-primary-foreground py-3 rounded-md text-center text-sm font-bold transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
                                                        Entrar no Leilão <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col flex-1">
                                                <div className="p-5 flex-1">
                                                    <h3 className="text-foreground font-black text-base line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug" title={item.title}>{item.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <AuctionLiveText auctionId={auction.id} status={auction.status} viewType="grid" />
                                                        {auction.end_time && (
                                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(auction.end_time).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-5 py-4 border-t border-border/50 bg-muted/5 flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Lance Atual</p>
                                                        <div className="text-lg font-black text-primary tracking-tight">
                                                            {currentPrice}<span className="text-[10px] font-bold text-primary/60 ml-1">Kz</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-background border border-border text-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-sm group-hover:shadow-md">
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {totalCount > 10 && (
                            <div className="flex items-center justify-center mt-10">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                                        disabled={page === 1} 
                                        className="h-10 px-4 flex items-center justify-center rounded-md border border-border bg-card text-sm font-bold text-foreground hover:bg-muted hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        &lt; {t('auctions.btn_prev')}
                                    </button>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary text-primary-foreground font-black text-sm shadow-md shadow-primary/20">
                                        {page}
                                    </div>
                                    <button 
                                        onClick={() => setPage(p => p + 1)} 
                                        disabled={page * 10 >= totalCount} 
                                        className="h-10 px-4 flex items-center justify-center rounded-md border border-border bg-card text-sm font-bold text-foreground hover:bg-muted hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        {t('auctions.btn_next')} &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Filter Drawer */}
            {isFilterDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end lg:hidden">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterDrawerOpen(false)} />
                    <div className="relative w-[85%] max-w-sm h-full bg-card shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-5 border-b border-border/50 flex-shrink-0 bg-muted/10">
                            <h2 className="font-black text-lg tracking-tight flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-primary" /> {t('auctions.filters')}
                            </h2>
                            <button onClick={() => setIsFilterDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            <FilterPanel />
                        </div>
                        <div className="p-5 border-t border-border/50 flex flex-col gap-3 flex-shrink-0 bg-muted/10">
                            <button onClick={() => setIsFilterDrawerOpen(false)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-md text-sm font-black uppercase tracking-wider transition-all shadow-md shadow-primary/20">
                                {t('auctions.apply')}
                            </button>
                            {hasActiveFilters && (
                                <button onClick={handleClearFilters} className="w-full border border-border/80 bg-background text-foreground py-3.5 rounded-md text-sm font-bold uppercase tracking-wider hover:bg-muted transition-all">
                                    {t('auctions.clear')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
