import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuctionsQuery, useFeaturedAuctionsQuery } from "@/hooks/useAuction";
import { useCategoriesQuery } from "@/hooks/useCategory";

export default function HomePage() {
  const { data: featuredData, isLoading: loadingFeatured } = useFeaturedAuctionsQuery({ limit: 5 });
  const { data: upcomingData, isLoading: loadingUpcoming } = useAuctionsQuery({ limit: 4, status: "SCHEDULED" });
  const { data: categoriesData, isLoading: loadingCategories } = useCategoriesQuery();

  const featuredAuctions = featuredData?.results || [];
  const upcomingAuctions = upcomingData?.results || [];
  // Use either the first featured auction or the first upcoming as the hero
  const heroAuction = featuredAuctions.length > 0 ? featuredAuctions[0] : upcomingAuctions[0] || null;
  const categories = categoriesData || [];

  // Exclude hero from featured list
  const displayFeatured = featuredAuctions.filter(a => a.id !== heroAuction?.id).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      {/* Reused Global Header */}
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Hero - Main Highlight */}
          <div className="lg:col-span-2 bg-muted/30 border border-border rounded-2xl p-8 flex flex-col justify-between min-h-[400px] relative overflow-hidden group">
            {heroAuction?.item?.images?.[0] && (
               <div 
                 className="absolute inset-0 bg-cover bg-center z-0 opacity-40 group-hover:opacity-50 transition-opacity" 
                 style={{ backgroundImage: `url(${heroAuction.item.images[0]?.image_url})` }}
               />
            )}
            <div className="z-10 relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-sm">
                  {heroAuction?.status === "LIVE" ? "Ao Vivo" : "Em Destaque"}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {heroAuction?.status === "LIVE" ? "Leilão em andamento" : "Próximo grande evento"}
                </span>
              </div>
              
              {loadingFeatured ? (
                <>
                  <div className="w-3/4 h-12 bg-muted rounded mb-4 animate-pulse"></div>
                  <div className="w-1/2 h-6 bg-muted rounded mb-8 animate-pulse"></div>
                  <div className="w-1/3 h-10 bg-muted rounded mb-2 animate-pulse"></div>
                  <div className="w-1/4 h-4 bg-muted rounded mb-8 animate-pulse"></div>
                </>
              ) : heroAuction ? (
                <>
                  <h1 className="text-3xl font-bold mb-4 w-3/4">{heroAuction.item.title}</h1>
                  <p className="text-muted-foreground mb-8 w-3/4 line-clamp-2">{heroAuction.item.description}</p>
                  
                  <div className="mb-8">
                    <p className="text-sm text-muted-foreground mb-1">Lance Atual / Inicial</p>
                    <p className="text-3xl font-bold">R$ {heroAuction.item.current_price || heroAuction.item.starting_price}</p>
                  </div>
                </>
              ) : (
                 <div className="py-12 text-muted-foreground">Nenhum leilão em destaque no momento.</div>
              )}
            </div>
            
            <div className="flex items-end justify-between z-10 relative">
              <div className="flex gap-4">
                {heroAuction?.item?.images?.slice(1, 4).map((img, idx) => (
                  <img key={idx} src={img?.image_url} alt="Galeria" className="w-16 h-16 bg-muted rounded-md object-cover border border-border" />
                )) || (
                  <>
                    <div className="w-16 h-16 bg-muted rounded-md"></div>
                    <div className="w-16 h-16 bg-muted rounded-md"></div>
                    <div className="w-16 h-16 bg-muted rounded-md"></div>
                  </>
                )}
              </div>
              <Link to={heroAuction ? `/auction/${heroAuction.id}` : "#"} className="w-48 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                Dar lance agora
              </Link>
            </div>
          </div>
          
          {/* Right Hero - Video and Chat (Wireframe for now) */}
          <div className="flex flex-col gap-4">
            <div className="bg-muted border border-border rounded-2xl h-48 flex items-center justify-center relative overflow-hidden">
               <div className="w-12 h-12 rounded-full bg-background/50 flex items-center justify-center backdrop-blur-sm z-10">
                 <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-primary border-b-8 border-b-transparent ml-1"></div>
               </div>
            </div>
            <div className="bg-background border border-border rounded-2xl flex-1 p-4 flex flex-col shadow-sm">
              <div className="font-semibold mb-4 text-sm">Chat ao vivo (Simulação)</div>
              <div className="flex-1 space-y-4 mb-4 opacity-50">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="w-24 h-3 bg-muted rounded mb-2"></div>
                      <div className="w-full h-3 bg-muted/50 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full h-10 border border-border rounded-lg flex items-center px-3 justify-between">
                <div className="w-32 h-3 bg-muted/50 rounded"></div>
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categorias Populares */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold">Categorias populares</h2>
            <Link to="/categories" className="text-sm text-primary font-medium hover:underline">Ver todas</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {loadingCategories ? (
              [1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 border border-border rounded-xl animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="w-16 h-3 bg-muted rounded"></div>
                </div>
              ))
            ) : categories.slice(0, 8).map(cat => (
              <Link key={cat.id} to={`/categories/${cat.slug}`} className="flex flex-col items-center gap-3 p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm transition-colors">
                  {cat.name.charAt(0)}
                </div>
                <div className="text-xs font-medium text-center truncate w-full">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Leilões em destaque & Próximos */}
        <section className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          <div className="lg:col-span-3 xl:col-span-4">
             <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold">Leilões em destaque</h2>
              <Link to="/auctions?featured=true" className="text-sm text-primary font-medium hover:underline">Ver todas</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loadingFeatured ? (
                 [1,2,3,4].map(i => (
                  <div key={i} className="border border-border rounded-2xl overflow-hidden flex flex-col bg-card animate-pulse h-80">
                    <div className="h-48 bg-muted"></div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="w-4/5 h-5 bg-muted rounded mb-4"></div>
                      <div className="mt-auto space-y-3">
                        <div className="w-1/2 h-6 bg-muted rounded"></div>
                        <div className="w-full h-10 bg-muted rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                 ))
              ) : displayFeatured.length > 0 ? displayFeatured.map(auction => (
                <div key={auction.id} className="border border-border rounded-2xl overflow-hidden flex flex-col bg-card shadow-sm hover:shadow-md transition-shadow group">
                  <div className="h-48 bg-muted relative overflow-hidden">
                    {auction.item.images?.[0] ? (
                      <img src={auction.item.images[0]?.image_url} alt={auction.item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sem foto</div>
                    )}
                    {auction.status === "LIVE" && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Ao Vivo</div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-base mb-1 line-clamp-1">{auction.item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{auction.item.description}</p>
                    <div className="mt-auto space-y-3">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Lance atual</div>
                        <div className="font-bold text-lg">R$ {auction.item.current_price || auction.item.starting_price}</div>
                      </div>
                      <Link to={`/auction/${auction.id}`} className="w-full h-10 bg-primary/10 text-primary font-medium rounded-lg flex items-center justify-center border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                        Dar lance
                      </Link>
                    </div>
                  </div>
                </div>
              )) : (
                 <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                    Nenhum outro leilão em destaque no momento.
                 </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1 xl:col-span-1">
             <div className="flex justify-between items-end mb-6">
              <h2 className="text-lg font-bold">Próximos leilões</h2>
              <Link to="/auctions?status=SCHEDULED" className="text-sm text-primary font-medium hover:underline">Ver todas</Link>
            </div>
            <div className="space-y-4">
              {loadingUpcoming ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="flex gap-4 items-center animate-pulse">
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                       <div className="w-12 h-3 bg-muted rounded mb-2"></div>
                       <div className="w-full h-4 bg-muted rounded"></div>
                    </div>
                  </div>
                ))
              ) : upcomingAuctions.slice(0, 5).map(auction => (
                <Link key={auction.id} to={`/auction/${auction.id}`} className="flex gap-4 items-center group cursor-pointer hover:bg-muted/30 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                    {auction.item.images?.[0]?.image_url && <img src={auction.item.images[0]?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="text-[10px] text-primary font-bold mb-1 uppercase">Em breve</div>
                     <div className="text-sm font-medium truncate">{auction.item.title}</div>
                     <div className="text-xs text-muted-foreground mt-1">Inicial: R$ {auction.item.starting_price}</div>
                  </div>
                </Link>
              ))}
              {!loadingUpcoming && upcomingAuctions.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                  Sem próximos leilões
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Banners Promo */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted border border-border rounded-2xl p-8 h-48 flex items-center justify-between">
             <div className="flex-1">
               <div className="text-xl font-bold mb-2">Baixe o App BidLive</div>
               <div className="text-sm text-muted-foreground mb-4">Acompanhe leilões de qualquer lugar.</div>
             </div>
             <div className="w-24 h-32 bg-muted-foreground/30 rounded-lg hidden sm:flex items-center justify-center">📱</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 h-48 flex items-center justify-between shadow-sm">
             <div className="flex-1">
               <div className="text-xl font-bold mb-2">Venda conosco</div>
               <div className="text-sm text-muted-foreground mb-6">Alcance milhares de compradores em tempo real.</div>
               <Link to="/sell" className="w-32 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                 Quero vender
               </Link>
             </div>
             <div className="w-24 h-24 bg-muted rounded-full hidden sm:flex items-center justify-center text-3xl">💰</div>
          </div>
        </section>

        {/* Features / Trust */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10 border-t border-b border-border">
           {[
             { title: "Lances em Tempo Real", desc: "Plataforma super rápida e sem delay." },
             { title: "Pagamento Seguro", desc: "Transações criptografadas e protegidas." },
             { title: "Suporte 24/7", desc: "Equipe pronta para ajudar sempre." },
             { title: "Vendedores Verificados", desc: "Apenas leiloeiros confiáveis." }
           ].map((feat, i) => (
             <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-border bg-muted/30 flex items-center justify-center flex-shrink-0 text-primary font-bold">{i+1}</div>
                <div>
                   <div className="text-sm font-bold">{feat.title}</div>
                   <div className="text-xs text-muted-foreground">{feat.desc}</div>
                </div>
             </div>
           ))}
        </section>
      </main>


      {/* Footer Wireframe */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
           <div className="lg:col-span-1">
              <div className="w-24 h-8 bg-muted rounded mb-6"></div>
              <div className="space-y-3">
                <div className="w-full h-3 bg-muted/60 rounded"></div>
                <div className="w-5/6 h-3 bg-muted/60 rounded"></div>
                <div className="w-4/6 h-3 bg-muted/60 rounded"></div>
              </div>
           </div>
           {[1,2,3].map(i => (
             <div key={i}>
                <div className="w-24 h-4 bg-muted rounded mb-6"></div>
                <div className="space-y-4">
                  {[1,2,3,4,5].map(j => (
                    <div key={j} className="w-20 h-3 bg-muted/60 rounded"></div>
                  ))}
                </div>
             </div>
           ))}
           <div className="lg:col-span-1">
              <div className="w-32 h-4 bg-muted rounded mb-6"></div>
              <div className="w-full h-3 bg-muted/60 rounded mb-4"></div>
              <div className="w-full h-10 border border-border bg-background rounded-md"></div>
           </div>
        </div>
      </footer>
    </div>
  );
}