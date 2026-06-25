
import Header from "@/components/layout/Header";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      {/* Reused Global Header */}
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Hero - Main Highlight */}
          <div className="lg:col-span-2 bg-muted/30 border border-border rounded-2xl p-8 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-sm">Ao Vivo</span>
                <span className="text-sm font-medium text-muted-foreground">Leilão em andamento</span>
              </div>
              <div className="w-3/4 h-12 bg-muted rounded mb-4"></div>
              <div className="w-1/2 h-6 bg-muted rounded mb-8"></div>
              
              <div className="w-1/3 h-10 bg-muted rounded mb-2"></div>
              <div className="w-1/4 h-4 bg-muted rounded mb-8"></div>
            </div>
            
            <div className="flex items-end justify-between">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-muted rounded-md"></div>
                <div className="w-16 h-16 bg-muted rounded-md"></div>
                <div className="w-16 h-16 bg-muted rounded-md"></div>
              </div>
              <div className="w-48 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-medium text-sm">
                Dar lance agora
              </div>
            </div>
          </div>
          
          {/* Right Hero - Video and Chat */}
          <div className="flex flex-col gap-4">
            <div className="bg-muted border border-border rounded-2xl h-48 flex items-center justify-center relative">
               <div className="w-12 h-12 rounded-full bg-background/50 flex items-center justify-center backdrop-blur-sm">
                 <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-primary border-b-8 border-b-transparent ml-1"></div>
               </div>
            </div>
            <div className="bg-background border border-border rounded-2xl flex-1 p-4 flex flex-col shadow-sm">
              <div className="font-semibold mb-4 text-sm">Chat ao vivo</div>
              <div className="flex-1 space-y-4 mb-4">
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
            <a href="#" className="text-sm text-primary font-medium hover:underline">Ver todas</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="w-16 h-3 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Leilões em destaque */}
        <section className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          <div className="lg:col-span-3 xl:col-span-4">
             <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold">Leilões em destaque</h2>
              <a href="#" className="text-sm text-primary font-medium hover:underline">Ver todas</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="border border-border rounded-2xl overflow-hidden flex flex-col bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 bg-muted relative">
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Ao Vivo</div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="w-4/5 h-5 bg-muted rounded mb-4"></div>
                    <div className="mt-auto space-y-3">
                      <div className="w-1/2 h-6 bg-muted rounded"></div>
                      <div className="w-2/3 h-3 bg-muted/60 rounded mb-4"></div>
                      <div className="w-full h-10 bg-primary/10 text-primary font-medium rounded-lg flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                        Dar lance
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1 xl:col-span-1">
             <div className="flex justify-between items-end mb-6">
              <h2 className="text-lg font-bold">Próximos leilões</h2>
              <a href="#" className="text-sm text-primary font-medium hover:underline">Ver todas</a>
            </div>
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                     <div className="w-12 h-3 bg-muted/60 rounded mb-2"></div>
                     <div className="w-full h-4 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Banners Promo */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted border border-border rounded-2xl p-8 h-48 flex items-center justify-between">
             <div className="flex-1">
               <div className="w-48 h-6 bg-muted-foreground/30 rounded mb-4"></div>
               <div className="w-64 h-4 bg-muted-foreground/20 rounded"></div>
             </div>
             <div className="w-24 h-32 bg-muted-foreground/30 rounded-lg hidden sm:block"></div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 h-48 flex items-center justify-between shadow-sm">
             <div className="flex-1">
               <div className="w-32 h-6 bg-muted rounded mb-4"></div>
               <div className="w-48 h-4 bg-muted/60 rounded mb-6"></div>
               <div className="w-32 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-medium">
                 Quero vender
               </div>
             </div>
             <div className="w-24 h-24 bg-muted rounded-full hidden sm:block"></div>
          </div>
        </section>

        {/* Features / Trust */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10 border-t border-b border-border">
           {[1,2,3,4].map(i => (
             <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-border bg-muted/30 flex items-center justify-center flex-shrink-0"></div>
                <div>
                   <div className="w-32 h-4 bg-muted rounded mb-2"></div>
                   <div className="w-24 h-3 bg-muted/60 rounded"></div>
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