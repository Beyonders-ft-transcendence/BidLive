import Header from "@/components/layout/Header";
import { 
    Search, 
    Filter, 
    ChevronDown, 
    Heart, 
    List, 
    Grid2X2, 
    Minus, 
    Plus,
    CarFront,
    Car,
    Truck,
    Star
} from "lucide-react";

export default function AuctionsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
                
                {/* Search / Active Filters Bar */}
                <div className="flex items-center justify-between w-full border border-border bg-card rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Search className="w-5 h-5 text-muted-foreground ml-2" />
                        <div className="flex items-center gap-2 bg-muted/50 border border-border px-3 py-1.5 rounded-md text-sm">
                            <span>Mercedes-Benz</span>
                            <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex items-center justify-center cursor-pointer">
                                <span className="text-[10px] text-foreground">✕</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 border border-border px-3 py-1.5 rounded-md text-sm">
                            <span>2016 - 2018</span>
                            <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex items-center justify-center cursor-pointer">
                                <span className="text-[10px] text-foreground">✕</span>
                            </div>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-primary font-medium text-sm px-4">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Left Sidebar - Filters */}
                    <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-6">
                        
                        {/* Filters Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Filters</h2>
                            <Minus className="w-5 h-5 text-muted-foreground cursor-pointer" />
                        </div>

                        {/* Car Types Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {['Hatchback', 'Sedan', 'Coupe', 'Wagon', 'SUV', 'Van'].map((type, idx) => (
                                <div 
                                    key={type} 
                                    className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${idx === 1 || idx === 4 ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:bg-muted/50'}`}
                                >
                                    {idx % 2 === 0 ? <Car className="w-6 h-6 mb-2 opacity-70" /> : idx === 5 ? <Truck className="w-6 h-6 mb-2 opacity-70" /> : <CarFront className="w-6 h-6 mb-2 opacity-70" />}
                                    <span className="text-xs font-medium">{type}</span>
                                </div>
                            ))}
                        </div>

                        {/* Dropdowns */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border border-border bg-card px-3 py-2.5 rounded-md cursor-pointer">
                                <span className="text-sm">Mercedes-Benz</span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center justify-between border border-border bg-card px-3 py-2.5 rounded-md cursor-pointer">
                                    <span className="text-sm">USA</span>
                                    <div className="flex flex-col opacity-50">
                                        <span className="text-[8px] leading-[6px]">▲</span>
                                        <span className="text-[8px] leading-[6px]">▼</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-between border border-border bg-card px-3 py-2.5 rounded-md cursor-pointer">
                                    <span className="text-sm">UK</span>
                                    <div className="flex flex-col opacity-50">
                                        <span className="text-[8px] leading-[6px]">▲</span>
                                        <span className="text-[8px] leading-[6px]">▼</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="text" value="2016" readOnly className="w-full border border-border bg-card px-3 py-2.5 rounded-md text-sm text-center" />
                                <span className="text-muted-foreground">-</span>
                                <input type="text" value="2018" readOnly className="w-full border border-border bg-card px-3 py-2.5 rounded-md text-sm text-center" />
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Price Range</h3>
                                <Minus className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="w-full h-1 bg-muted rounded-full relative">
                                <div className="absolute left-1/4 right-1/4 h-full bg-primary rounded-full"></div>
                                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="text" value="$21,500" readOnly className="w-full border border-border bg-card px-3 py-2 rounded-md text-sm text-center" />
                                <span className="text-muted-foreground">-</span>
                                <input type="text" value="$250,000" readOnly className="w-full border border-border bg-card px-3 py-2 rounded-md text-sm text-center" />
                            </div>
                        </div>

                        {/* Condition Checkboxes */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium">Condition</h3>
                                <Minus className="w-4 h-4 text-muted-foreground" />
                            </div>
                            {['All', 'Excellent', 'Good', 'Bad', 'Broken'].map((cond, idx) => (
                                <div key={cond} className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${idx === 1 || idx === 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-card'}`}>
                                        {(idx === 1 || idx === 2) && <span className="text-[10px]">✓</span>}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{cond}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* Collapse Items */}
                        <div className="pt-4 border-t border-border flex items-center justify-between cursor-pointer">
                             <h3 className="text-sm font-medium">Kilometer</h3>
                             <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        {/* Apply Button */}
                        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-sm font-medium transition-colors shadow-sm mt-6">
                            Apply Filters
                        </button>
                    </aside>

                    {/* Right Content - Results */}
                    <div className="flex-1 flex flex-col gap-4">
                        
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                            <h1 className="text-lg font-semibold">Search Results <span className="text-muted-foreground font-normal text-sm">(126)</span></h1>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 border-r border-border pr-3">
                                    <button className="p-1.5 text-primary bg-primary/10 rounded-md">
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md">
                                        <Grid2X2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between border border-border bg-card px-3 py-1.5 rounded-md cursor-pointer text-sm gap-2 min-w-[120px]">
                                    <span>10 Per Page</span>
                                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <div className="flex items-center justify-between border border-border bg-card px-3 py-1.5 rounded-md cursor-pointer text-sm gap-2 min-w-[140px]">
                                    <span>Date (Down)</span>
                                    <div className="flex flex-col opacity-50">
                                        <span className="text-[8px] leading-[6px]">▲</span>
                                        <span className="text-[8px] leading-[6px]">▼</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="space-y-4">
                            {[
                                { title: "Mercedes-Benz C63 2017", isBuyNow: true, price: "$93,000", condition: "Excellent" },
                                { title: "Mercedes-Benz CLA200 2017", isBuyNow: true, price: "$45,500", condition: "Good" },
                                { title: "Mercedes-Benz E300 2017", isBuyNow: false, price: "$35,000", condition: "Excellent" },
                                { title: "Mercedes-Benz GLE450 AMG 2016", isBuyNow: false, price: "$25,000", condition: "Excellent" },
                                { title: "Mercedes-Benz GLA200 2016", isBuyNow: true, price: "$55,000", condition: "Good" },
                                { title: "Mercedes-Benz C300 2019", isBuyNow: false, price: "$55,100", condition: "Good" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col md:flex-row bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    
                                    {/* Image Area */}
                                    <div className="w-full md:w-[260px] h-[180px] bg-muted relative flex-shrink-0">
                                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center text-foreground hover:bg-background/80 transition-colors">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-3 left-3 bg-background/70 backdrop-blur-md text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                                            <span className="w-3 h-3 bg-muted-foreground/30 rounded-sm"></span> 5
                                        </div>
                                    </div>
                                    
                                    {/* Info Area */}
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-primary font-semibold text-lg">{item.title}</h3>
                                                <span className="text-muted-foreground text-xs bg-muted px-1.5 py-0.5 rounded">$$$</span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="text-xs bg-muted/50 border border-border px-2 py-1 rounded">Sedan</span>
                                                <span className="text-xs bg-muted/50 border border-border px-2 py-1 rounded">Used Car</span>
                                                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded">{item.isBuyNow ? 'Buy Now' : 'Auction'}</span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-xs">
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Kilometers:</span>
                                                    <span className="font-medium">49,000 km</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Engine:</span>
                                                    <span className="font-medium">AMG 4.0L8</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Horsepower:</span>
                                                    <span className="font-medium">486</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Location:</span>
                                                    <span className="font-medium flex items-center gap-1">
                                                        <div className="w-3 h-2 bg-blue-500 rounded-sm"></div> New-York
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Acceleration:</span>
                                                    <span className="font-medium">4.0 sec</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Condition:</span>
                                                    <span className={`font-medium ${item.condition === 'Excellent' ? 'text-green-500' : 'text-orange-500'}`}>{item.condition}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="w-full md:w-[220px] p-5 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center items-center gap-3">
                                        {item.isBuyNow ? (
                                            <>
                                                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                                                    Buy Now
                                                </button>
                                                <div className="w-full bg-muted/30 border border-border py-2.5 rounded-lg text-center font-bold text-lg">
                                                    {item.price}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <button className="w-full bg-transparent border border-green-500 text-green-500 hover:bg-green-50 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                                    Make Bid
                                                </button>
                                                <div className="w-full flex items-center border border-border rounded-lg overflow-hidden h-11">
                                                    <button className="w-10 h-full flex items-center justify-center bg-muted/30 border-r border-border hover:bg-muted text-muted-foreground">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <input type="text" value={item.price} readOnly className="flex-1 w-full h-full text-center bg-transparent font-bold text-sm outline-none" />
                                                    <button className="w-10 h-full flex items-center justify-center bg-muted/30 border-l border-border hover:bg-muted text-muted-foreground">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                        
                                        <div className="flex items-center gap-1 mt-2 w-full justify-center text-xs">
                                            <div className="flex text-orange-400">
                                                <Star className="w-3 h-3 fill-current" />
                                                <Star className="w-3 h-3 fill-current" />
                                                <Star className="w-3 h-3 fill-current" />
                                                <Star className="w-3 h-3 fill-current" />
                                                <Star className="w-3 h-3 text-muted-foreground opacity-30" />
                                            </div>
                                            <span className="text-muted-foreground ml-1">(23 Reviews)</span>
                                            <div className="w-3 h-3 rounded-full bg-green-500 text-white flex items-center justify-center ml-auto">
                                                <span className="text-[8px]">✓</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center mt-6 py-4">
                            <div className="flex border border-border rounded-md overflow-hidden bg-card">
                                <button className="px-3 py-2 text-muted-foreground hover:bg-muted border-r border-border">&lt;</button>
                                <button className="px-4 py-2 text-primary font-medium hover:bg-muted border-r border-border">1</button>
                                <button className="px-4 py-2 text-muted-foreground hover:bg-muted border-r border-border">2</button>
                                <button className="px-4 py-2 text-muted-foreground hover:bg-muted border-r border-border">3</button>
                                <span className="px-3 py-2 text-muted-foreground border-r border-border">...</span>
                                <button className="px-4 py-2 text-muted-foreground hover:bg-muted border-r border-border">8</button>
                                <button className="px-3 py-2 text-muted-foreground hover:bg-muted">&gt;</button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
