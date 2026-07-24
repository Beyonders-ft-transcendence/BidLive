import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export function TermsPage() {
    const { t } = useTranslation();
    useDocumentTitle(t("legal.terms.title") + " - BidLive");

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
            <Header />
            <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 select-none">
                <div className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-10 md:p-16">
                    <header className="mb-10 text-center">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
                            {t("legal.terms.title")}
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {t("legal.terms.last_updated")}
                        </p>
                    </header>

                    <div className="space-y-8 text-foreground/80 leading-relaxed text-sm sm:text-base">
                        <p className="text-lg font-medium text-foreground">
                            {t("legal.terms.p1")}
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-foreground">{t("legal.terms.h1")}</h2>
                            <p>{t("legal.terms.c1")}</p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-foreground">{t("legal.terms.h2")}</h2>
                            <p>{t("legal.terms.c2")}</p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-foreground">{t("legal.terms.h3")}</h2>
                            <p>{t("legal.terms.c3")}</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
