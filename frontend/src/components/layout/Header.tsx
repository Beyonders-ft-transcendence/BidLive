import Logo2 from "@/assets/images/logo2.png";
import Logo from "@/assets/images/logo.png";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { getTheme, setTheme as setGlobalTheme, type Theme } from "@/shared/utils/themes.utils";

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
        <header className="relative z-10 flex items-center justify-between px-8 py-4 bg-background/80 backdrop-blur-sm border-b border-border">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <img src={theme === "dark" || document.documentElement.classList.contains("dark") ? Logo2 : Logo} alt="BidLive Logo" className="h-8 object-contain" />
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
                <a href="#" className="hover:text-primary transition-colors">Início</a>
                <a href="#" className="hover:text-primary transition-colors">Sobre nós</a>
                <a href="#" className="hover:text-primary transition-colors">Funcionalidades</a>
                <a href="#" className="hover:text-primary transition-colors">Documentos</a>
                <a href="#" className="hover:text-primary transition-colors">Contato</a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button onClick={handleToggleTheme} title="Mudar Tema" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    {theme === "dark" || document.documentElement.classList.contains("dark") ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="hidden sm:block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-sm text-sm font-medium transition-colors shadow-sm">
                    Registrar / Entrar
                </button>
            </div>
        </header>
    );
}