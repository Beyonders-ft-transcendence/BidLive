import Logo from "@/assets/images/logo.png";
import Logo2 from "@/assets/images/logo2.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGUAGES, baseLanguage } from "@/i18n/languages";

export default function Footer() {
    const { t, i18n } = useTranslation();
    const currentLang = baseLanguage(i18n.language);
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
                {/* Brand */}
                <div>
                    <Link to="/" className="inline-block">
                        <img src={Logo} alt="BidLive" className="h-8 object-contain dark:hidden" />
                        <img src={Logo2} alt="BidLive" className="h-8 object-contain hidden dark:block" />
                    </Link>
                    <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                        {t("footer.tagline")}
                    </p>
                </div>

                {/* Navigation */}
                <nav aria-label={t("footer.navigation")}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        {t("footer.navigation")}
                    </h3>
                    <ul className="space-y-2.5 text-sm">
                        <li><Link to="/" className="text-foreground/80 hover:text-primary transition-colors">{t("nav.home")}</Link></li>
                        <li><Link to="/leiloes" className="text-foreground/80 hover:text-primary transition-colors">{t("nav.auctions")}</Link></li>
                    </ul>
                </nav>

                {/* Account */}
                <nav aria-label={t("footer.account")}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        {t("footer.account")}
                    </h3>
                    <ul className="space-y-2.5 text-sm">
                        <li><Link to="/signin" className="text-foreground/80 hover:text-primary transition-colors">{t("footer.signin")}</Link></li>
                        <li><Link to="/signup" className="text-foreground/80 hover:text-primary transition-colors">{t("footer.signup")}</Link></li>
                    </ul>
                </nav>

                {/* Language */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        {t("footer.language")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => i18n.changeLanguage(lang.code)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                                    currentLang === lang.code
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>© {year} BidLive. {t("footer.rights")}</span>
                    <div className="flex items-center gap-4">
                        <Link to="/terms" className="hover:text-primary transition-colors">
                            {t("legal.terms.title")}
                        </Link>
                        <Link to="/privacy" className="hover:text-primary transition-colors">
                            {t("legal.privacy.title")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
