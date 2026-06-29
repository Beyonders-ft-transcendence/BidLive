import Logo2 from "@/assets/images/logo2.png";
import Logo from "@/assets/images/logo.png";
import { useState, useEffect } from "react";
import { Sun, Moon, Search, ChevronDown, Heart, Menu, X, Globe } from "lucide-react";
import { getTheme, setTheme as setGlobalTheme, type Theme } from "@/shared/utils/themes.utils";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function Header() {
    const [theme, setCurrentTheme] = useState<Theme>("light");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [language, setLanguage] = useState("PT"); // PT, EN, AR

    useEffect(() => {
        setCurrentTheme(getTheme());
    }, []);

    const handleToggleTheme = () => {
        const isDark = document.documentElement.classList.contains("dark");
        const newTheme = isDark ? "light" : "dark";
        setGlobalTheme(newTheme);
        setCurrentTheme(newTheme);
    };

    return (
        <>
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
            <nav className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src={theme === "dark" || document.documentElement.classList.contains("dark") ? Logo2 : Logo} alt="BidLive Logo" className="h-8 object-contain" />
                </Link>

                {/* Middle Section: Nav Links & Search (Desktop) */}
                <div className="hidden md:flex items-center gap-8 flex-1 justify-center px-4">
                    <nav className="flex items-center gap-6 text-sm font-medium text-foreground/80">
                        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                        <Link to="/leiloes" className="hover:text-primary transition-colors">Leilões</Link>
                    </nav>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            type="text" 
                            placeholder="Pesquisar leilões..." 
                            className="pl-9 h-9 bg-background/50 border-border focus-visible:ring-primary rounded-md text-sm w-full"
                        />
                    </div>
                </div>

                {/* Right Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    
                    {/* Language Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors h-full py-2 text-sm font-medium">
                            <Globe size={18} />
                            {language}
                            <ChevronDown size={14} />
                        </button>
                        <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="w-32 bg-card border border-border rounded-md shadow-lg overflow-hidden flex flex-col py-1">
                                <button onClick={() => setLanguage("PT")} className="px-4 py-2 hover:bg-muted text-sm text-left transition-colors text-foreground">Português</button>
                                <button onClick={() => setLanguage("EN")} className="px-4 py-2 hover:bg-muted text-sm text-left transition-colors text-foreground">Inglês</button>
                                <button onClick={() => setLanguage("AR")} className="px-4 py-2 hover:bg-muted text-sm text-left transition-colors text-foreground">Árabe</button>
                            </div>
                        </div>
                    </div>

                    <Link to="/favoritos" className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Favoritos">
                        <Heart size={20} />
                    </Link>
                    <button onClick={handleToggleTheme} title="Mudar Tema" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        {theme === "dark" || document.documentElement.classList.contains("dark") ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link to="/signin" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-sm text-sm font-medium transition-colors shadow-sm text-center">
                        Registrar / Entrar
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-2">
                    <button onClick={handleToggleTheme} title="Mudar Tema" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        {theme === "dark" || document.documentElement.classList.contains("dark") ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-foreground">
                        <Menu size={24} />
                    </button>
                </div>
            </nav>
        </header>

        {/* Mobile Menu Side Drawer */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[60] flex justify-end md:hidden">
                {/* Backdrop overlay */}
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                
                {/* Drawer */}
                <div className="relative w-[80%] max-w-sm h-full bg-background shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <span className="font-semibold text-lg">Menu</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-foreground rounded-md hover:bg-muted transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-4 overflow-y-auto space-y-6 flex-1">
                        {/* Mobile Search */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                type="text" 
                                placeholder="Pesquisar leilões..." 
                                className="pl-9 h-10 bg-background/50 border-border focus-visible:ring-primary rounded-md text-sm w-full"
                            />
                        </div>
                        
                        <nav className="flex flex-col gap-2 font-medium text-foreground">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary py-3 border-b border-border/50">Início</Link>
                            <Link to="/leiloes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary py-3 border-b border-border/50">Leilões</Link>
                            <Link to="/favoritos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary py-3 border-b border-border/50 flex items-center gap-2">
                                <Heart size={18} /> Favoritos
                            </Link>
                            
                            {/* Mobile Language Selection */}
                            <div className="py-4 border-b border-border/50">
                                <p className="text-muted-foreground text-sm mb-3 flex items-center gap-2"><Globe size={16} /> Idioma</p>
                                <div className="flex gap-2">
                                    <button onClick={() => { setLanguage("PT"); setIsMobileMenuOpen(false); }} className={`flex-1 py-1.5 text-sm rounded border ${language === "PT" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}>PT</button>
                                    <button onClick={() => { setLanguage("EN"); setIsMobileMenuOpen(false); }} className={`flex-1 py-1.5 text-sm rounded border ${language === "EN" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}>EN</button>
                                    <button onClick={() => { setLanguage("AR"); setIsMobileMenuOpen(false); }} className={`flex-1 py-1.5 text-sm rounded border ${language === "AR" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"}`}>AR</button>
                                </div>
                            </div>
                        </nav>
                    </div>

                    <div className="p-4 border-t border-border mt-auto bg-card">
                        <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold transition-colors shadow-sm text-center">
                            Registrar / Entrar
                        </Link>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}