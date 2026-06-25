import Logo2 from "@/assets/images/logo2.png";
import Logo from "@/assets/images/logo.png";
import { useState, useEffect } from "react";
import { Sun, Moon, Search, ChevronDown } from "lucide-react";
import { getTheme, setTheme as setGlobalTheme, type Theme } from "@/shared/utils/themes.utils";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function Header() {
    const [theme, setCurrentTheme] = useState<Theme>("light");

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
        <header className="relative z-10 w-full bg-background/80 backdrop-blur-sm border-b border-border">
            <nav className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
                <img src={theme === "dark" || document.documentElement.classList.contains("dark") ? Logo2 : Logo} alt="BidLive Logo" className="h-8 object-contain" />
            </Link>

            {/* Middle Section: Nav Links & Search */}
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center px-4">
                <nav className="flex items-center gap-6 text-sm font-medium text-foreground/80">
                    <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                    <Link to="/leiloes" className="hover:text-primary transition-colors">Leilões</Link>
                    
                    {/* Categories Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors h-full py-2">
                            Categorias <ChevronDown size={16} />
                        </button>
                        <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="w-48 bg-card border border-border rounded-md shadow-lg overflow-hidden flex flex-col py-1">
                                <a href="#" className="px-4 py-2 hover:bg-muted text-sm transition-colors text-foreground">Veículos</a>
                                <a href="#" className="px-4 py-2 hover:bg-muted text-sm transition-colors text-foreground">Imóveis</a>
                                <a href="#" className="px-4 py-2 hover:bg-muted text-sm transition-colors text-foreground">Eletrônicos</a>
                                <a href="#" className="px-4 py-2 hover:bg-muted text-sm transition-colors text-foreground">Joias</a>
                            </div>
                        </div>
                    </div>
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

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button onClick={handleToggleTheme} title="Mudar Tema" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    {theme === "dark" || document.documentElement.classList.contains("dark") ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Link to="/signin" className="hidden sm:block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-sm text-sm font-medium transition-colors shadow-sm text-center">
                    Registrar / Entrar
                </Link>
            </div>
          

            </nav>
        </header>
    );
}