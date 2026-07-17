import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuctionsQuery, useFeaturedAuctionsQuery } from "@/hooks/useAuction";
import { useCategoriesQuery } from "@/hooks/useCategory";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useTranslation } from "@/shared/i18n";
import { formatCurrency } from "@/shared/utils/auction.utils";
import type { Auction } from "@/shared/types/auction.types";
import {
    ArrowRight, Bell, Gavel, Radio, ShieldCheck,
    Star, Trophy, UserPlus, Video, Zap,
} from "lucide-react";

function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-end justify-between gap-4 mb-8">
            <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
                {subtitle && <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function AuctionCard({ auction, variant }: { auction: Auction; variant: "live" | "featured" }) {
    const { t } = useTranslation();
    const item = auction.item;
    const currentPrice = item.current_price || item.starting_price;
    const imageUrl = item.images?.[0]?.image_url;

    return (
        <Link
            to={`/auction/${auction.id}`}
            className="group bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 dark:shadow-none transition-all duration-200 flex flex-col"
        >
            <div className="relative w-full h-40 sm:h-44 bg-muted/30 border-b border-border/50 overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <span className="text-muted-foreground text-xs p-2 text-center">{t("live.noPhoto")}</span>
                )}
                {variant === "live" ? (
                    <span className="absolute top-2 start-2 inline-flex items-center gap-1.5 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase shadow-md">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        {t("live.badge")}
                    </span>
                ) : (
                    <span className="absolute top-2 start-2 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase shadow-md">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {t("featured.badge")}
                    </span>
                )}
                {item.category?.name && (
                    <span className="absolute top-2 end-2 bg-background/90 border border-border text-[9px] font-semibold px-2 py-0.5 rounded-full text-muted-foreground uppercase">
                        {item.category.name}
                    </span>
                )}
            </div>

            <div className="p-3 flex-1">
                <h3 className="text-foreground font-semibold text-sm line-clamp-2" title={item.title}>
                    {item.title}
                </h3>
            </div>

            <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{t("live.currentBid")}</p>
                    <p className="text-sm sm:text-base font-bold text-primary leading-tight truncate">
                        {formatCurrency(currentPrice, true)}
                    </p>
                </div>
                <span className="bg-primary group-hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-colors">
                    {t("live.enter")}
                </span>
            </div>
        </Link>
    );
}

function AuctionCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="h-40 sm:h-44 bg-muted" />
            <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="p-3 border-t border-border flex items-center justify-between">
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-7 bg-muted rounded w-16" />
            </div>
        </div>
    );
}

export default function HomePage() {
    const { t, locale } = useTranslation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const { data: liveData, isLoading: isLoadingLive } = useAuctionsQuery({ status: "LIVE", page_size: 4 });
    const { data: totalData } = useAuctionsQuery({ page: 1, page_size: 1 });
    const { data: featuredData } = useFeaturedAuctionsQuery({ page_size: 4 });
    const { data: categoriesData } = useCategoriesQuery();

    const liveAuctions: Auction[] = liveData?.results || [];
    const liveCount = liveData?.count;
    const totalCount = totalData?.count;
    const categories = categoriesData || [];
    const featuredAuctions: Auction[] = (
        Array.isArray(featuredData)
            ? featuredData
            : (featuredData as { results?: Auction[] } | undefined)?.results || []
    ).slice(0, 4);

    const formatNumber = (value: number) => value.toLocaleString(locale);

    const stats = [
        { value: liveCount, label: t("hero.statLive"), live: true },
        { value: totalCount, label: t("hero.statTotal"), live: false },
        { value: categories.length > 0 ? categories.length : undefined, label: t("hero.statCategories"), live: false },
    ].filter((s) => s.value != null && s.value > 0);

    const steps = [
        { icon: UserPlus, title: t("how.step1Title"), text: t("how.step1Text") },
        { icon: Gavel, title: t("how.step2Title"), text: t("how.step2Text") },
        { icon: Trophy, title: t("how.step3Title"), text: t("how.step3Text") },
    ];

    const features = [
        { icon: Video, title: t("features.liveTitle"), text: t("features.liveText") },
        { icon: Zap, title: t("features.bidsTitle"), text: t("features.bidsText") },
        { icon: ShieldCheck, title: t("features.secureTitle"), text: t("features.secureText") },
        { icon: Bell, title: t("features.notifyTitle"), text: t("features.notifyText") },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
            <Header />

            {/* ============ HERO ============ */}
            <section className="relative overflow-hidden">
                <div aria-hidden className="absolute inset-0 -z-10">
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[820px] max-w-full rounded-full bg-primary/15 blur-3xl" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20 flex flex-col items-center text-center">
                    <span className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 text-primary rounded-full px-3.5 py-1.5 text-xs font-semibold mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        {t("hero.badge")}
                    </span>

                    <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl text-foreground">
                        {t("hero.titleLead")}{" "}
                        <span className="bg-gradient-to-r from-primary to-[var(--chart-1)] bg-clip-text text-transparent">
                            {t("hero.titleHighlight")}
                        </span>
                        .
                    </h1>

                    <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl">
                        {t("hero.subtitle")}
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <Link
                            to="/leiloes"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-7 py-3 rounded-md text-sm font-semibold transition-colors shadow-sm"
                        >
                            {t("hero.exploreCta")}
                            <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                        </Link>
                        <Link
                            to={isAuthenticated ? "/user" : "/signup"}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border bg-card hover:bg-muted text-foreground px-7 py-3 rounded-md text-sm font-semibold transition-colors"
                        >
                            {isAuthenticated ? t("hero.dashboardCta") : t("hero.sellCta")}
                        </Link>
                    </div>

                    {stats.length > 0 && (
                        <dl className={`mt-12 grid ${stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1"} divide-x divide-border border border-border rounded-xl bg-card/60 backdrop-blur-sm shadow-sm dark:shadow-none w-full max-w-xl overflow-hidden`}>
                            {stats.map((stat) => (
                                <div key={stat.label} className="px-4 py-4 sm:py-5 text-center">
                                    <dt className="sr-only">{stat.label}</dt>
                                    <dd className="flex flex-col items-center gap-0.5">
                                        <span className={`text-xl sm:text-2xl font-bold font-mono ${stat.live ? "text-red-500" : "text-foreground"}`}>
                                            {formatNumber(stat.value as number)}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</span>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            </section>

            <main className="flex-1">
                {/* ============ LIVE NOW ============ */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
                    <SectionHeading
                        title={t("live.title")}
                        subtitle={t("live.subtitle")}
                        action={
                            <Link to="/leiloes" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline whitespace-nowrap">
                                {t("live.seeAll")}
                                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                            </Link>
                        }
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isLoadingLive ? (
                            Array.from({ length: 4 }, (_, i) => <AuctionCardSkeleton key={i} />)
                        ) : liveAuctions.length > 0 ? (
                            liveAuctions.map((auction) => (
                                <AuctionCard key={auction.id} auction={auction} variant="live" />
                            ))
                        ) : (
                            <div className="col-span-full border border-dashed border-border rounded-xl bg-card/50 py-14 px-6 text-center">
                                <Radio className="w-8 h-8 mx-auto text-muted-foreground/60 mb-3" />
                                <p className="font-semibold text-foreground">{t("live.empty")}</p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{t("live.emptyHint")}</p>
                                <Link to="/leiloes" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                                    {t("live.viewScheduled")}
                                    <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* ============ FEATURED ============ */}
                {featuredAuctions.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-16">
                        <SectionHeading title={t("featured.title")} subtitle={t("featured.subtitle")} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {featuredAuctions.map((auction) => (
                                <AuctionCard key={auction.id} auction={auction} variant="featured" />
                            ))}
                        </div>
                    </section>
                )}

                {/* ============ CATEGORIES ============ */}
                {categories.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-16">
                        <SectionHeading title={t("categories.title")} subtitle={t("categories.subtitle")} />
                        <div className="flex flex-wrap gap-2.5">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to="/leiloes"
                                    className="border border-border bg-card hover:border-primary/50 hover:text-primary text-sm font-medium text-foreground/80 rounded-full px-4 py-2 transition-colors"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ============ HOW IT WORKS ============ */}
                <section className="border-y border-border bg-muted/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t("how.title")}</h2>
                            <p className="mt-2 text-muted-foreground">{t("how.subtitle")}</p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-5">
                            {steps.map((step, index) => (
                                <div key={step.title} className="relative bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
                                    <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
                                    <div className="mt-4 mb-4 w-11 h-11 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ WHY BIDLIVE ============ */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t("features.title")}</h2>
                        <p className="mt-2 text-muted-foreground">{t("features.subtitle")}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((feature) => (
                            <div key={feature.title} className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none hover:border-primary/40 transition-colors">
                                <div className="mb-4 w-11 h-11 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ============ CTA ============ */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[var(--chart-1)] px-6 py-12 sm:px-12 sm:py-16 text-center shadow-lg">
                        <div aria-hidden className="absolute -top-24 -end-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                        <div aria-hidden className="absolute -bottom-24 -start-24 h-64 w-64 rounded-full bg-black/10 blur-2xl" />
                        <h2 className="relative font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white">{t("cta.title")}</h2>
                        <p className="relative mt-3 text-white/85 max-w-xl mx-auto text-sm sm:text-base">{t("cta.text")}</p>
                        <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                to={isAuthenticated ? "/user" : "/signup"}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 px-7 py-3 rounded-md text-sm font-bold transition-colors shadow-sm"
                            >
                                {isAuthenticated ? t("hero.dashboardCta") : t("cta.primary")}
                                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                            </Link>
                            <Link
                                to="/leiloes"
                                className="w-full sm:w-auto inline-flex items-center justify-center border border-white/40 text-white hover:bg-white/10 px-7 py-3 rounded-md text-sm font-semibold transition-colors"
                            >
                                {t("cta.secondary")}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
