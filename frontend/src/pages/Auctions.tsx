import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuctionsQuery } from "@/hooks/useAuction";
import { useCategoriesQuery } from "@/hooks/useCategory";
import { 
    List, Grid2X2, Search, ChevronRight, ChevronDown, Calendar, Clock, DollarSign, Activity
} from "lucide-react";

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
    const [viewType, setViewType] = useState<"list" | "grid">("list");

    const { data: auctionsData, isLoading } = useAuctionsQuery({ 
        page: page,
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
    console.log(auctions)
    const totalCount = auctionsData?.count || 0;
    const categories = categoriesData || [];

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

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <Header />

            {/* Top Bar matching image */}
            <div className="w-full bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Link to="/" className="text-primary hover:underline">Início</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-primary font-medium">Escolher Leilão</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="opacity-60 hidden sm:inline">Informações e Pagamento</span>
                    </div>
                    
                    {/* Top Actions */}
                    <div className="flex items-center gap-6 text-sm hidden md:flex">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Moeda</span>
                            <div className="flex items-center gap-1 border border-border rounded px-3 py-1 bg-muted/50 cursor-pointer hover:bg-muted">
                                AOA (Kz) <ChevronDown className="w-4 h-4 opacity-50" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Ordenar por</span>
                            <select 
                                value={ordering} 
                                onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                                className="border border-border rounded px-3 py-1 bg-muted/50 outline-none hover:border-primary/50 transition-colors focus:ring-1 focus:ring-primary/20"
                            >
                                <option value="">Mais Relevante</option>
                                <option value="-created_at">Mais Recentes</option>
                                <option value="current_price">Menor Preço</option>
                                <option value="-current_price">Maior Preço</option>
                                <option value="end_time">Terminando em Breve</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Visualização</span>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setViewType("list")}
                                    className={`p-1.5 rounded-md ${viewType === 'list' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setViewType("grid")}
                                    className={`p-1.5 rounded-md ${viewType === 'grid' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
                                >
                                    <Grid2X2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
                
                <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
                    
                    {/* Left Content - Results */}
                    <div className="flex-1 w-full flex flex-col gap-4">
                        
                        {/* List Items */}
                        <div className={viewType === 'list' ? "space-y-6" : "grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                            {isLoading ? (
                                <div className="py-20 text-center text-muted-foreground animate-pulse col-span-full">Buscando leilões...</div>
                            ) : auctions.length === 0 ? (
                                <div className="py-20 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-sm dark:shadow-none col-span-full">
                                    Nenhum leilão encontrado para os filtros selecionados.
                                </div>
                            ) : auctions.map((auction) => {
                                const item = auction.item;
                                const currentPrice = item.current_price || item.starting_price;
                                
                                return (
                                <div key={auction.id} className={`bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-all duration-300 flex ${viewType === 'list' ? 'flex-col md:flex-row' : 'flex-col'}`}>
                                    
                                    {/* Image Area */}
                                    <div className={`${viewType === 'list' ? 'w-full md:w-[280px] h-[200px] md:h-auto border-b md:border-b-0 md:border-r' : 'w-full h-[200px] border-b'} bg-muted/30 relative flex-shrink-0 p-4 flex items-center justify-center border-border/50`}>
                                        {item.images?.[0]?.image_url ? (
                                            <img src={item.images[0].image_url} alt={item.title} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Sem foto</div>
                                        )}
                                        {auction.status === 'LIVE' && (
                                            <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                                                Ao Vivo
                                            </div>
                                        )}
                                        {item.category?.name && (
                                            <div className="absolute top-4 right-4 bg-background border border-border text-[10px] font-semibold px-3 py-1 rounded-full text-muted-foreground uppercase tracking-wider shadow-sm dark:shadow-none">
                                                {item.category.name}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Info Area */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <h3 className="text-foreground font-semibold text-2xl line-clamp-1">{item.title}</h3>
                                                <button className="text-primary hover:text-primary/80 text-sm hidden md:flex items-center gap-1 whitespace-nowrap">
                                                    <Search className="w-3.5 h-3.5" /> 
                                                    <span className="underline">Ver detalhes</span>
                                                </button>
                                            </div>
                                            
                                            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                                                {item.description || "Sem descrição disponível."}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-t border-border pt-5 mt-auto">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Activity className="w-5 h-5 opacity-70" />
                                                    <span className="text-[10px] font-semibold tracking-wider uppercase text-center">
                                                        {auction.status === 'LIVE' ? 'Ao Vivo' : auction.status === 'SCHEDULED' ? 'Agendado' : 'Encerrado'}
                                                    </span>
                                                </div>
                                                {auction.start_time && (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Calendar className="w-5 h-5 opacity-70" />
                                                    <span className="text-[10px] font-semibold tracking-wider uppercase text-center">
                                                        {new Date(auction.start_time).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                )}
                                                {auction.end_time && (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Clock className="w-5 h-5 opacity-70" />
                                                    <span className="text-[10px] font-semibold tracking-wider uppercase text-center">
                                                        {new Date(auction.end_time).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                )}
                                                <div className="flex flex-col items-center gap-2">
                                                    <DollarSign className="w-5 h-5 opacity-70" />
                                                    <span className="text-[10px] font-semibold tracking-wider uppercase text-center">
                                                        Lance Mín: {item.starting_price}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className={`${viewType === 'list' ? 'w-full md:w-[240px] border-t md:border-t-0 md:border-l' : 'w-full border-t'} p-6 border-border flex flex-col justify-center items-center bg-muted/10`}>
                                        <div className="text-center mb-4">
                                            <p className="text-sm text-muted-foreground font-medium mb-1">Lance Atual</p>
                                            <div className="text-3xl font-bold text-primary flex items-end justify-center gap-1">
                                                {currentPrice} <span className="text-base font-semibold mb-1">Kz</span>
                                            </div>
                                            {item.buy_now_price && (
                                                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                                                    Comprar Já: {item.buy_now_price} Kz
                                                </p>
                                            )}
                                        </div>
                                        <Link to={`/auction/${auction.id}`} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-md text-center text-sm font-semibold transition-colors shadow-sm hover:shadow-md dark:shadow-none">
                                            Ver Leilão
                                        </Link>
                                    </div>
                                </div>
                            )})}
                        </div>

                        {/* Pagination */}
                        {totalCount > 10 && (
                            <div className="flex items-center justify-center mt-8 py-4">
                                <div className="flex border border-border rounded-md overflow-hidden bg-card shadow-sm dark:shadow-none">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-muted-foreground hover:bg-muted border-r border-border disabled:opacity-50 transition-colors">&lt; Ant</button>
                                    <button className="px-5 py-2 text-primary font-bold bg-primary/10 border-r border-border">{page}</button>
                                    <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= totalCount} className="px-4 py-2 text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors">Próx &gt;</button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Sidebar - Filters */}
                    <aside className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
                        


                        {/* Filters Container */}
                        <div className="bg-card border border-border rounded-lg p-5 shadow-sm dark:shadow-none">
                            
                            {/* Filters Header */}
                            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                                <h2 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                                    Filtros
                                </h2>
                                {(selectedCategory || selectedStatus || search || minPrice || maxPrice || startsAfter || endsBefore || isFeatured || sellerId) && (
                                    <button 
                                        onClick={handleClearFilters}
                                        className="text-xs text-primary font-medium hover:underline"
                                    >
                                        Limpar
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-6">
                                {/* Search */}
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

                                {/* Status */}
                                <div className="border-t border-border pt-5">
                                    <h3 className="text-sm font-semibold mb-3 text-foreground">Status</h3>
                                    <div className="flex flex-col gap-2.5">
                                        {[
                                            { value: 'LIVE', label: 'Ao Vivo' },
                                            { value: 'SCHEDULED', label: 'Agendados' },
                                            { value: 'ENDED', label: 'Encerrados' }
                                        ].map((status) => (
                                            <label key={status.value} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedStatus === status.value ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                                                    {selectedStatus === status.value && <span className="text-xs">✓</span>}
                                                </div>
                                                <span className={`text-sm ${selectedStatus === status.value ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{status.label}</span>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={selectedStatus === status.value} 
                                                    onChange={() => handleStatusClick(status.value)} 
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Categorias */}
                                <div className="border-t border-border pt-5">
                                    <h3 className="text-sm font-semibold mb-3 text-foreground">Categorias</h3>
                                    <div className="flex flex-col gap-2.5">
                                        {categories.map((cat) => (
                                            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat.id ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                                                    {selectedCategory === cat.id && <span className="text-xs">✓</span>}
                                                </div>
                                                <span className={`text-sm ${selectedCategory === cat.id ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{cat.name}</span>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={selectedCategory === cat.id} 
                                                    onChange={() => handleCategoryClick(cat.id)} 
                                                />
                                            </label>
                                        ))}
                                        {categories.length === 0 && (
                                            <div className="text-xs text-muted-foreground">Nenhuma categoria</div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Featured */}
                                <div className="border-t border-border pt-5">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isFeatured ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                                            {isFeatured && <span className="text-xs">✓</span>}
                                        </div>
                                        <span className={`text-sm ${isFeatured ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Apenas Destaques</span>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={isFeatured} 
                                            onChange={(e) => { setIsFeatured(e.target.checked); setPage(1); }} 
                                        />
                                    </label>
                                </div>

                                {/* Preço */}
                                <div className="border-t border-border pt-5">
                                    <h3 className="text-sm font-semibold mb-3 text-foreground">Faixa de Preço (Kz)</h3>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            placeholder="Min" 
                                            value={minPrice}
                                            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                                            className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground"
                                        />
                                        <span className="text-muted-foreground">-</span>
                                        <input 
                                            type="number" 
                                            placeholder="Max" 
                                            value={maxPrice}
                                            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                                            className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground"
                                        />
                                    </div>
                                </div>
                                
                                {/* Datas */}
                                <div className="border-t border-border pt-5">
                                    <h3 className="text-sm font-semibold mb-3 text-foreground">Período (Inicia / Termina)</h3>
                                    <div className="flex flex-col gap-2">
                                        <input 
                                            type="datetime-local" 
                                            value={startsAfter}
                                            onChange={(e) => { setStartsAfter(e.target.value); setPage(1); }}
                                            className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground"
                                            title="Inicia depois de"
                                        />
                                        <input 
                                            type="datetime-local" 
                                            value={endsBefore}
                                            onChange={(e) => { setEndsBefore(e.target.value); setPage(1); }}
                                            className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground"
                                            title="Termina antes de"
                                        />
                                    </div>
                                </div>

                                {/* Seller ID */}
                                <div className="border-t border-border pt-5">
                                    <h3 className="text-sm font-semibold mb-3 text-foreground">ID do Vendedor</h3>
                                    <input 
                                        type="number" 
                                        placeholder="ID do Vendedor" 
                                        value={sellerId}
                                        onChange={(e) => { setSellerId(e.target.value); setPage(1); }}
                                        className="w-full border border-input bg-background rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground"
                                    />
                                </div>

                            </div>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}
