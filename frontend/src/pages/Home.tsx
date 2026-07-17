import { useEffect, useState } from "react";
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
    ArrowRight, Bell, Eye, Gavel, Radio, ShieldCheck,
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

const MOCK_BIDDERS = ["Marta N.", "Kiala F.", "Paulo T.", "Aisha B.", "Nelson K.", "Luena S."];
const MOCK_INCREMENTS = [2500, 3000, 2000, 3500, 2500, 4000];
const MOCK_BASE_AMOUNT = 145000;
const MOCK_AVATAR_STYLES = [
    "bg-purple-500/15 text-purple-600 dark:text-purple-300",
    "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
];

interface MockBid {
    id: number;
    name: string;
    amount: number;
}

/**
 * Mockup animado de um leilão ao vivo para o hero: leiloeiro ilustrado,
 * espectadores e um feed de lances que se atualiza sozinho. Puramente
 * decorativo — não depende do backend.
 */
function LiveShowcase() {
    const { t } = useTranslation();
    const [bids, setBids] = useState<MockBid[]>([
        { id: 2, name: MOCK_BIDDERS[2], amount: MOCK_BASE_AMOUNT + 5500 },
        { id: 1, name: MOCK_BIDDERS[1], amount: MOCK_BASE_AMOUNT + 2500 },
        { id: 0, name: MOCK_BIDDERS[0], amount: MOCK_BASE_AMOUNT },
    ]);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = setInterval(() => {
            setBids((prev) => {
                const nextId = prev[0].id + 1;
                const amount = prev[0].amount + MOCK_INCREMENTS[nextId % MOCK_INCREMENTS.length];
                const next = { id: nextId, name: MOCK_BIDDERS[nextId % MOCK_BIDDERS.length], amount };
                return [next, ...prev].slice(0, 3);
            });
        }, 2800);
        return () => clearInterval(timer);
    }, []);

    const topBid = bids[0];
    const viewers = 124 + topBid.id;

    return (
        <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full -z-10" />

            <div className="relative bg-card border border-border rounded-2xl shadow-xl dark:shadow-none overflow-hidden animate-float">
                {/* "Vídeo" da transmissão: cena ilustrada do leiloeiro */}
                <div className="relative h-52 sm:h-60 bg-gradient-to-br from-primary via-[#6d0fa8] to-[#2b1140] overflow-hidden">
                    <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full" aria-hidden preserveAspectRatio="xMidYMax slice">
                        {/* Foco de luz sobre o palco */}
                        <polygon points="200,-30 90,240 310,240" fill="white" opacity="0.08" />
                        <ellipse cx="200" cy="212" rx="120" ry="14" fill="white" opacity="0.10" />
                        {/* Leiloeiro: cabeça, tronco e braço erguido com martelo */}
                        <circle cx="200" cy="88" r="17" fill="white" opacity="0.92" />
                        <rect x="172" y="108" width="56" height="42" rx="18" fill="white" opacity="0.92" />
                        <g transform="rotate(30 236 112)">
                            <rect x="231" y="70" width="9" height="46" rx="4.5" fill="white" opacity="0.92" />
                            <rect x="219" y="56" width="34" height="13" rx="5" fill="white" opacity="0.92" />
                        </g>
                        {/* Púlpito */}
                        <rect x="160" y="146" width="80" height="60" rx="8" fill="white" opacity="0.25" />
                        <rect x="150" y="140" width="100" height="10" rx="5" fill="white" opacity="0.35" />
                        {/* Plateia em silhueta */}
                        <circle cx="60" cy="234" r="20" fill="white" opacity="0.16" />
                        <circle cx="118" cy="240" r="24" fill="white" opacity="0.13" />
                        <circle cx="284" cy="240" r="24" fill="white" opacity="0.13" />
                        <circle cx="342" cy="234" r="20" fill="white" opacity="0.16" />
                        <circle cx="24" cy="244" r="18" fill="white" opacity="0.10" />
                        <circle cx="376" cy="244" r="18" fill="white" opacity="0.10" />
                    </svg>

                    <span className="absolute top-3 start-3 inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase shadow-md">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        {t("live.badge")}
                    </span>
                    <span className="absolute top-3 end-3 inline-flex items-center gap-1.5 bg-black/45 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        <Eye className="w-3 h-3" />
                        {t("mock.viewers", { count: viewers })}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pt-10 pb-3">
                        <p className="text-white text-xs font-semibold">{t("mock.itemTitle")}</p>
                    </div>
                </div>

                {/* Feed de lances */}
                <div className="p-4 space-y-2">
                    {bids.map((bid, index) => (
                        <div
                            key={bid.id}
                            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-background/60 ${index === 0 ? "animate-bid-in border-primary/40" : "border-border/60"}`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${MOCK_AVATAR_STYLES[bid.id % MOCK_AVATAR_STYLES.length]}`}>
                                    {bid.name.split(" ").map((part) => part[0]).join("")}
                                </span>
                                <span className="text-xs font-semibold text-foreground truncate">{bid.name}</span>
                            </div>
                            <span className="text-xs font-bold font-mono text-primary whitespace-nowrap">
                                {formatCurrency(bid.amount, true)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{t("live.currentBid")}</p>
                        <p className="text-lg font-bold text-primary leading-tight">{formatCurrency(topBid.amount, true)}</p>
                    </div>
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-xs font-bold whitespace-nowrap">
                        {t("live.enter")}
                    </span>
                </div>
            </div>

            {/* Elementos flutuantes decorativos */}
            <div className="absolute -top-5 -end-3 sm:-end-8 animate-float-delayed">
                <div className="bg-card border border-border rounded-full px-3.5 py-2 shadow-lg dark:shadow-none flex items-center gap-2 text-xs font-bold text-foreground">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    {t("mock.newBid")}
                </div>
            </div>
            <div className="absolute -bottom-5 -start-3 sm:-start-8 animate-float">
                <div className="bg-primary text-primary-foreground rounded-xl p-3 shadow-lg dark:shadow-none">
                    <Gavel className="w-5 h-5" />
                </div>
            </div>
        </div>
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

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-20 sm:pb-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
                    {/* Coluna de texto */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-start">
                        <span className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 text-primary rounded-full px-3.5 py-1.5 text-xs font-semibold mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                            {t("hero.badge")}
                        </span>

                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.1] max-w-3xl text-foreground">
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

                    {/* Coluna visual: leilão ao vivo simulado */}
                    <LiveShowcase />
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
