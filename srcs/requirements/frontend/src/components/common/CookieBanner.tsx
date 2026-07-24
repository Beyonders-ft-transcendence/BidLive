import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

export default function CookieBanner() {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Pequeno delay para animação
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pointer-events-none">
            <div className="max-w-4xl mx-auto bg-card border border-border shadow-2xl rounded-lg p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-auto relative">
                
                {/* Close Button Mobile (optional for just hiding, but usually we require accept) */}
                <button 
                    onClick={handleAccept} 
                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground sm:hidden"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>

                <div className="text-sm text-foreground/80 leading-relaxed pr-4 sm:pr-0">
                    {t("legal.cookie_banner.message")}
                    <Link to="/privacy" className="font-bold text-primary hover:underline whitespace-nowrap">
                        {t("legal.cookie_banner.privacy_link")}
                    </Link>.
                </div>
                
                <button
                    onClick={handleAccept}
                    className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
                >
                    {t("legal.cookie_banner.accept")}
                </button>
            </div>
        </div>
    );
}
