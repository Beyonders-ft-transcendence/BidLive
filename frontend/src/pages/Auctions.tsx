import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuctionsQuery } from "@/hooks/useAuction";
import { useCategoriesQuery } from "@/hooks/useCategory";
import { 
    Filter, Heart, List, Grid2X2, Tag
} from "lucide-react";

export default function AuctionsPage() {
    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const { data: auctionsData, isLoading } = useAuctionsQuery({ 
        limit: 10, 
        offset: (page - 1) * 10,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined
    });
    
    const { data: categoriesData } = useCategoriesQuery();
    
    const auctions = auctionsData?.results || [];
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

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
                
                <div className="flex flex-col lg:flex-row gap-8 items-start mt-4">
                    
                    {/* Left Sidebar - Filters */}
                    <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-6">
                        
                        {/* Filters Header */}
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Filter className="w-5 h-5" /> Filtros
                            </h2>
                            {(selectedCategory || selectedStatus) && (
                                <button 
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setSelectedStatus(null);
                                        setPage(1);
                                    }}
                                    className="text-xs text-muted-foreground hover:text-primary underline"
                                >
                                    Limpar
                                </button>
                            )}
                        </div>

                        {/* Categorias */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Categorias</h3>
                            <div className="flex flex-col gap-2">
                                {categories.map((cat) => (
                                    <div 
                                        key={cat.id} 
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-sm ${selectedCategory === cat.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-muted-foreground'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 opacity-70" />
                                            <span>{cat.name}</span>
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div className="text-xs text-muted-foreground p-2">Nenhuma categoria</div>
                                )}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <h3 className="text-sm font-medium">Status</h3>
                            <div className="flex flex-col gap-2">
                                {[
                                    { value: 'LIVE', label: 'Ao Vivo' },
                                    { value: 'SCHEDULED', label: 'Agendados' },
                                    { value: 'ENDED', label: 'Encerrados' }
                                ].map((status) => (
                                    <div 
                                        key={status.value}
                                        onClick={() => handleStatusClick(status.value)}
                                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer text-sm transition-colors ${selectedStatus === status.value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-muted-foreground'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${selectedStatus === status.value ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-card'}`}>
                                            {selectedStatus === status.value && <span className="text-[10px]">✓</span>}
                                        </div>
                                        <span>{status.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Right Content - Results */}
                    <div className="flex-1 flex flex-col gap-4">
                        
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                            <h1 className="text-lg font-semibold">Resultados da Busca <span className="text-muted-foreground font-normal text-sm">({totalCount})</span></h1>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 border-r border-border pr-3">
                                    <button className="p-1.5 text-primary bg-primary/10 rounded-md">
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md opacity-50 cursor-not-allowed" title="Em breve">
                                        <Grid2X2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="py-20 text-center text-muted-foreground animate-pulse">Buscando leilões...</div>
                            ) : auctions.length === 0 ? (
                                <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                                    Nenhum leilão encontrado para os filtros selecionados.
                                </div>
                            ) : auctions.map((auction) => {
                                const item = auction.item;
                                const currentPrice = item.current_price || item.starting_price;
                                
                                return (
                                <div key={auction.id} className="flex flex-col md:flex-row bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    
                                    {/* Image Area */}
                                    <div className="w-full md:w-[260px] h-[180px] bg-muted relative flex-shrink-0">
                                        {item.images?.[0]?.image_url ? (
                                            <img src={item.images[0].image_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Sem foto</div>
                                        )}
                                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center text-foreground hover:bg-background/80 transition-colors">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                        {auction.status === 'LIVE' && (
                                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                                                Ao Vivo
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Info Area */}
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-primary font-semibold text-lg line-clamp-1">{item.title}</h3>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {item.category?.name && (
                                                    <span className="text-xs bg-muted/50 border border-border px-2 py-1 rounded">{item.category.name}</span>
                                                )}
                                                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded">
                                                    {auction.status === 'LIVE' ? 'Ao Vivo' : auction.status === 'SCHEDULED' ? 'Agendado' : 'Encerrado'}
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                                {item.description || "Nenhuma descrição informada para este item."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="w-full md:w-[220px] p-5 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center items-center gap-3">
                                        <div className="w-full bg-muted/30 border border-border py-2.5 rounded-lg text-center font-bold text-lg text-primary">
                                            R$ {currentPrice}
                                        </div>
                                        <Link to={`/auction/${auction.id}`} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg text-center text-sm font-medium transition-colors">
                                            Ver Detalhes
                                        </Link>
                                    </div>
                                </div>
                            )})}
                        </div>

                        {/* Pagination */}
                        {totalCount > 10 && (
                            <div className="flex items-center justify-center mt-6 py-4">
                                <div className="flex border border-border rounded-md overflow-hidden bg-card">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-muted-foreground hover:bg-muted border-r border-border disabled:opacity-50">&lt;</button>
                                    <button className="px-4 py-2 text-primary font-medium bg-primary/10 border-r border-border">{page}</button>
                                    <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= totalCount} className="px-3 py-2 text-muted-foreground hover:bg-muted disabled:opacity-50">&gt;</button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
