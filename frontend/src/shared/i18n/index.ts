import { useMemo } from "react";
import { create } from "zustand";
import pt, { type Messages } from "./locales/pt";
import en from "./locales/en";
import ar from "./locales/ar";

export type Locale = "pt" | "en" | "ar";

export const LOCALES: Record<Locale, { nativeLabel: string; dir: "ltr" | "rtl" }> = {
    pt: { nativeLabel: "Português", dir: "ltr" },
    en: { nativeLabel: "English", dir: "ltr" },
    ar: { nativeLabel: "العربية", dir: "rtl" },
};

const MESSAGES: Record<Locale, Messages> = { pt, en, ar };
const STORAGE_KEY = "locale";

/** União de todas as chaves em notação de ponto, ex.: "hero.titleLead". */
type DotPaths<T> = {
    [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];

export type MessageKey = DotPaths<Messages>;

function detectLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en" || stored === "ar") return stored;
    const browser = navigator.language.toLowerCase();
    if (browser.startsWith("en")) return "en";
    if (browser.startsWith("ar")) return "ar";
    return "pt";
}

function applyLocale(locale: Locale) {
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALES[locale].dir;
}

interface I18nState {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
    locale: detectLocale(),
    setLocale: (locale) => {
        localStorage.setItem(STORAGE_KEY, locale);
        applyLocale(locale);
        set({ locale });
    },
}));

/**
 * Deve ser chamado uma vez no arranque (main.tsx), antes do primeiro render,
 * para aplicar `lang`/`dir` ao <html> — mesmo padrão do initTheme().
 */
export function initLocale() {
    applyLocale(useI18nStore.getState().locale);
}

function resolve(dict: Messages, key: string): unknown {
    return key.split(".").reduce<unknown>((acc, part) => {
        if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
        return undefined;
    }, dict);
}

/**
 * Traduz uma chave no locale dado, com interpolação `{var}`.
 * Cai para pt (fonte de verdade) se a chave faltar no locale ativo.
 */
export function translate(
    locale: Locale,
    key: MessageKey,
    vars?: Record<string, string | number>,
): string {
    const value = resolve(MESSAGES[locale], key) ?? resolve(MESSAGES.pt, key);
    if (typeof value !== "string") return key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in vars ? String(vars[name]) : match,
    );
}

export function useTranslation() {
    const locale = useI18nStore((s) => s.locale);
    const setLocale = useI18nStore((s) => s.setLocale);
    const t = useMemo(
        () =>
            (key: MessageKey, vars?: Record<string, string | number>) =>
                translate(locale, key, vars),
        [locale],
    );
    return { t, locale, setLocale, dir: LOCALES[locale].dir };
}
