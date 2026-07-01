import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuctionsQuery, useAuctionStreamsQuery } from "@/hooks/useAuction";
import { useCategoriesQuery } from "@/hooks/useCategory";
import {
    List, Grid2X2, Search, ChevronRight,
    Clock, DollarSign, Activity,
    SlidersHorizontal, X
} from "lucide-react";

const AuctionLiveBadge = ({ auctionId, status }: { auctionId: number, status: string }) => {
    const { data: streams } = useAuctionStreamsQuery(auctionId, status === 'LIVE');
    const isActuallyLive = status === 'LIVE' && streams?.some((s: any) => s.status === 'LIVE');
    
    if (isActuallyLive) {
        return <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase shadow-md">Ao Vivo</div>;
    }
    return null;
};

const AuctionLiveText = ({ auctionId, status, viewType }: { auctionId: number, status: string, viewType?: 'list' | 'grid' }) => {
    const { data: streams } = useAuctionStreamsQuery(auctionId, status === 'LIVE');
    const isActuallyLive = status === 'LIVE' && streams?.some((s: any) => s.status === 'LIVE');
    
    return (
        <span className={`inline-flex items-center gap-1 ${viewType === 'list' ? 'text-[9px] sm:text-[10px]' : 'text-[9px] sm:text-[10px]'} font-semibold uppercase ${isActuallyLive ? 'text-red-500' : 'text-muted-foreground'}`}>
            <Activity className={viewType === 'list' ? "w-2.5 h-2.5 sm:w-3 sm:h-3" : "w-2.5 h-2.5"} />
            {isActuallyLive ? 'Ao Vivo' : status === 'LIVE' ? 'Agendado' : status === 'SCHEDULED' ? 'Agendado' : 'Encerrado'}
        </span>
    );
};

export default function AuctionsPage() {
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
    const [sellerId, setSellerId] = useState<string>("");
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
        seller_id: sellerId ? Number(sellerId) : undefined,
    });

    const { data: categoriesData } = useCategoriesQuery();

    const auctions = auctionsData?.results || [];
    const totalCount = auctionsData?.count || 0;
    const categories = categoriesData || [];

    const hasActiveFilters = !!(selectedCategory || selectedStatus || search || minPrice || maxPrice || startsAfter || endsBefore || isFeatured || sellerId);

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
        setSellerId("");
        setPage(1);
    };

    const FilterPanel = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold mb-3 text-foreground">Buscar</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Termo de busca..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full border border-input bg-background rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
                    />
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>
            <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Status</h3>
                <div className="flex flex-col gap-2.5">
                    {[{ value: 'LIVE', label: 'Ao Vivo' }, { value: 'SCHEDULED', label: 'Agendados' }, { value: 'ENDED', label: 'Encerrados' }].map((status) => (
                        <label key={status.value} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selectedStatus === status.value ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                                {selectedStatus === status.value && <span className="text-xs">✓</span>}
                            </div>
                            <span className={`text-sm ${selectedStatus === status.value ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{status.label}</span>
                            <input type="checkbox" className="hidden" checked={selectedStatus === status.value} onChange={() => handleStatusClick(status.value)} />
                        </label>
                    ))}
                </div>
            </div>
            <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Categorias</h3>
                <div className="flex flex-col gap-2.5">
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selectedCategory === cat.id ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                                {selectedCategory === cat.id && <span className="text-xs">✓</span>}
                            </div>
                            <span className={`text-sm ${selectedCategory === cat.id ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{cat.name}</span>
                            <input type="checkbox" className="hidden" checked={selectedCategory === cat.id} onChange={() => handleCategoryClick(cat.id)} />
                        </label>
                    ))}
                    {categories.length === 0 && <div className="text-xs text-muted-foreground">Nenhuma categoria</div>}
                </div>
            </div>
            <div className="border-t border-border pt-5">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isFeatured ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                        {isFeatured && <span className="text-xs">✓</span>}
                    </div>
                    <span className={`text-sm ${isFeatured ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Apenas Destaques</span>
                    <input type="checkbox" className="hidden" checked={isFeatured} onChange={(e) => { setIsFeatured(e.target.checked); setPage(1); }} />
                </label>
            </div>
            <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Faixa de Preço (Kz)</h3>
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground" />
                    <span className="text-muted-foreground">-</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground" />
                </div>
            </div>
            <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Período (Inicia / Termina)</h3>
                <div className="flex flex-col gap-2">
                    <input type="datetime-local" value={startsAfter} onChange={(e) => { setStartsAfter(e.target.value); setPage(1); }} className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground" title="Inicia depois de" />
                    <input type="datetime-local" value={endsBefore} onChange={(e) => { setEndsBefore(e.target.value); setPage(1); }} className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground" title="Termina antes de" />
                </div>
            </div>
            <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold mb-3 text-foreground">ID do Vendedor</h3>
                <input type="number" placeholder="ID do Vendedor" value={sellerId} onChange={(e) => { setSellerId(e.target.value); setPage(1); }} className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground" />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <Header />

            {/* Top Bar */}
            <div className="w-full bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
                    <div className="flex items-center text-sm text-muted-foreground gap-1 min-w-0">
                        <Link to="/" className="text-primary hover:underline whitespace-nowrap">Início</Link>
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-primary font-medium whitespace-nowrap">Leilões</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                            value={ordering}
                            onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                            className="hidden sm:block border border-border rounded px-2 py-1 text-xs bg-muted/50 outline-none hover:border-primary/50 transition-colors text-foreground"
                        >
                            <option value="">Relevância</option>
                            <option value="-created_at">Mais Recentes</option>
                            <option value="current_price">Menor Preço</option>
                            <option value="-current_price">Maior Preço</option>
                            <option value="end_time">Terminando em Breve</option>
                        </select>
                        <div className="flex items-center gap-0.5 border border-border rounded p-0.5 bg-muted/50">
                            <button onClick={() => setViewType("list")} className={`p-1.5 rounded ${viewType === 'list' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`} title="Lista">
                                <List className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setViewType("grid")} className={`p-1.5 rounded ${viewType === 'grid' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`} title="Grelha">
                                <Grid2X2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className={`lg:hidden flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors ${hasActiveFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'}`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Filtros
                            {hasActiveFilters && <span className="bg-primary-foreground/20 text-[10px] font-bold px-1 rounded-full leading-none">!</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sort bar */}
            <div className="sm:hidden bg-card border-b border-border px-4 py-2">
                <select value={ordering} onChange={(e) => { setOrdering(e.target.value); setPage(1); }} className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background outline-none text-foreground">
                    <option value="">Ordenar: Relevância</option>
                    <option value="-created_at">Mais Recentes</option>
                    <option value="current_price">Menor Preço</option>
                    <option value="-current_price">Maior Preço</option>
                    <option value="end_time">Terminando em Breve</option>
                </select>
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-row gap-6 items-start">

                    {/* Results */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">
                        {!isLoading && auctions.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">{totalCount}</span> leilões encontrados
                            </p>
                        )}

                        <div className={viewType === 'list' ? "space-y-3" : "grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"}>
                            {isLoading ? (
                                <div className="py-20 text-center text-muted-foreground animate-pulse col-span-full">Buscando leilões...</div>
                            ) : auctions.length === 0 ? (
                                <div className="py-20 text-center text-muted-foreground bg-card border border-border rounded-xl col-span-full">
                                    Nenhum leilão encontrado.
                                </div>
                            ) : auctions.map((auction) => {
                                const item = auction.item;
                                const currentPrice = item.current_price || item.starting_price;
                                return (
                                    <div key={auction.id} className={`bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-all duration-200 flex ${viewType === 'list' ? 'flex-row' : 'flex-col'}`}>

                                        {/* Image */}
                                        <div className={`${viewType === 'list' ? 'w-[90px] sm:w-[150px] md:w-[200px] flex-shrink-0 border-r' : 'w-full h-[130px] sm:h-[160px] border-b'} bg-muted/30 relative flex items-center justify-center border-border/50 overflow-hidden`}>
                                            {item.images?.[0]?.image_url ? (
                                                <img src={item.images[0].image_url} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-muted-foreground text-xs p-2 text-center">Sem foto</div>
                                            )}
                                            <AuctionLiveBadge auctionId={auction.id} status={auction.status} />
                                            {viewType === 'grid' && item.category?.name && (
                                                <div className="absolute top-2 right-2 bg-background/90 border border-border text-[9px] font-semibold px-2 py-0.5 rounded-full text-muted-foreground uppercase">{item.category.name}</div>
                                            )}
                                        </div>

                                        {viewType === 'list' ? (
                                            <>
                                                <div className="flex-1 min-w-0 p-2.5 sm:p-4 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="text-foreground font-semibold text-xs sm:text-sm md:text-base line-clamp-1 mb-1" title={item.title}>{item.title}</h3>
                                                        {item.category?.name && (
                                                            <span className="inline-block text-[9px] sm:text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full mb-1.5">{item.category.name}</span>
                                                        )}
                                                        <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
                                                            {item.description 
                                                                ? (item.description.length > 120 ? item.description.substring(0, 120) + "..." : item.description) 
                                                                : "Sem descrição disponível."
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                                                        <AuctionLiveText auctionId={auction.id} status={auction.status} viewType="list" />
                                                        {auction.end_time && (
                                                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(auction.end_time).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <DollarSign className="w-3 h-3" />
                                                            Mín: {item.starting_price} Kz
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 p-2.5 sm:p-4 border-l border-border flex flex-col justify-center items-center bg-muted/10 w-[100px] sm:w-[140px] md:w-[170px]">
                                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">Lance Atual</p>
                                                    <div className="text-sm sm:text-lg md:text-xl font-bold text-primary text-center leading-tight">
                                                        {currentPrice}<span className="text-[10px] sm:text-xs font-medium"> Kz</span>
                                                    </div>
                                                    {item.buy_now_price && (
                                                        <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 text-center hidden sm:block">Já: {item.buy_now_price} Kz</p>
                                                    )}
                                                    <Link to={`/auction/${auction.id}`} className="mt-2 sm:mt-3 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 rounded text-center text-[10px] sm:text-xs font-semibold transition-colors">
                                                        Ver Leilão
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col flex-1">
                                                <div className="p-2.5 sm:p-3 flex-1">
                                                    <h3 className="text-foreground font-semibold text-xs sm:text-sm line-clamp-2 mb-1.5" title={item.title}>{item.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                        <AuctionLiveText auctionId={auction.id} status={auction.status} viewType="grid" />
                                                        {auction.end_time && (
                                                            <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-muted-foreground">
                                                                <Clock className="w-2.5 h-2.5" />
                                                                {new Date(auction.end_time).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-2.5 sm:p-3 border-t border-border bg-muted/10 flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-[9px] text-muted-foreground">Lance</p>
                                                        <div className="text-sm sm:text-base font-bold text-primary leading-tight">
                                                            {currentPrice}<span className="text-[9px] sm:text-[10px] font-medium"> Kz</span>
                                                        </div>
                                                    </div>
                                                    <Link to={`/auction/${auction.id}`} className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-colors whitespace-nowrap">
                                                        Ver
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {totalCount > 10 && (
                            <div className="flex items-center justify-center mt-6">
                                <div className="flex border border-border rounded-md overflow-hidden bg-card shadow-sm">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-sm text-muted-foreground hover:bg-muted border-r border-border disabled:opacity-50 transition-colors">&lt; Ant</button>
                                    <button className="px-4 py-2 text-sm text-primary font-bold bg-primary/10 border-r border-border">{page}</button>
                                    <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= totalCount} className="px-3 py-2 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors">Próx &gt;</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-[290px] flex-shrink-0">
                        <div className="bg-card border border-border rounded-lg p-5 shadow-sm dark:shadow-none sticky top-20">
                            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                                <h2 className="font-semibold text-base flex items-center gap-2 text-foreground">
                                    <SlidersHorizontal className="w-4 h-4" /> Filtros
                                </h2>
                                {hasActiveFilters && (
                                    <button onClick={handleClearFilters} className="text-xs text-primary font-medium hover:underline">Limpar</button>
                                )}
                            </div>
                            <FilterPanel />
                        </div>
                    </aside>
                </div>
            </main>

            {/* Mobile Filter Drawer */}
            {isFilterDrawerOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end lg:hidden">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
                    <div className="relative w-[85%] max-w-xs h-full bg-background shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                            <h2 className="font-semibold text-base flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" /> Filtros
                            </h2>
                            <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 text-foreground hover:bg-muted rounded-md transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <FilterPanel />
                        </div>
                        <div className="p-4 border-t border-border flex gap-2 flex-shrink-0">
                            {hasActiveFilters && (
                                <button onClick={handleClearFilters} className="flex-1 border border-border text-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-muted transition-colors">Limpar</button>
                            )}
                            <button onClick={() => setIsFilterDrawerOpen(false)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-md text-sm font-semibold transition-colors">Aplicar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
