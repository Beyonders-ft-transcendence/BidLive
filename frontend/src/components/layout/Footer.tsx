import Logo2 from "@/assets/images/logo2.png";
import Logo from "@/assets/images/logo.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();
    const isDark = document.documentElement.classList.contains("dark");
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-card border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                    
                    {/* Logo & Description */}
                    <div className="flex flex-col items-center md:items-start gap-4 max-w-sm text-center md:text-left">
                        <Link to="/">
                            <img src={isDark ? Logo2 : Logo} alt="BidLive Logo" className="h-10 object-contain" />
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A plataforma premium número 1 de Angola para leilões em tempo real. Descubra oportunidades únicas e faça as suas licitações de onde estiver.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 text-center sm:text-left">
                        <div className="flex flex-col gap-3">
                            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs mb-1">Navegação</h4>
                            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("header.home")}</Link>
                            <Link to="/leiloes" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("header.auctions")}</Link>
                            <Link to="/signin" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("header.login_register")}</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs mb-1">Legal</h4>
                            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Termos de Serviço</a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Suporte</a>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-border/50 my-8"></div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-muted-foreground">
                    <p>&copy; {currentYear} BidLive. Todos os direitos reservados.</p>
                    <p>
                        Feito com <span className="text-red-500">♥</span> em Angola
                    </p>
                </div>
            </div>
        </footer>
    );
}
