import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function PrivacyPage() {
    const { t } = useTranslation();
    useDocumentTitle(t("legal.privacy.title") + " - BidLive");

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 select-none">
            <div className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-10 md:p-16">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
                        {t("legal.privacy.title")}
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {t("legal.privacy.last_updated")}
                    </p>
                </header>

                <div className="space-y-8 text-foreground/80 leading-relaxed text-sm sm:text-base">
                    <p className="text-lg font-medium text-foreground">
                        {t("legal.privacy.p1")}
                    </p>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground">{t("legal.privacy.h1")}</h2>
                        <p>{t("legal.privacy.c1")}</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground">{t("legal.privacy.h2")}</h2>
                        <p>{t("legal.privacy.c2")}</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground">{t("legal.privacy.h3")}</h2>
                        <p>{t("legal.privacy.c3")}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
