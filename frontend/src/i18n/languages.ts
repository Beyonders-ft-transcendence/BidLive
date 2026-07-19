/**
 * Fonte unica dos idiomas suportados.
 * Importado pelo config do i18next, pelo LanguageSwitcher (navbar) e pelo Footer,
 * para que todos ofereçam exatamente as mesmas opções.
 */
export type Direction = "ltr" | "rtl";

export interface Language {
    code: string;
    name: string;
    flag: string;
    dir: Direction;
}

export const LANGUAGES: Language[] = [
    { code: "pt", name: "Português", flag: "🇵🇹", dir: "ltr" },
    { code: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
    { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
    { code: "ar", name: "العربية", flag: "🇦🇪", dir: "rtl" },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

/** Idioma base, ignorando a região ("fr-FR" -> "fr"). */
export function baseLanguage(lng: string | undefined): string {
    return lng?.split("-")[0] || "pt";
}

/** Direção do layout do idioma dado; cai para "ltr" se desconhecido. */
export function directionOf(lng: string | undefined): Direction {
    const code = baseLanguage(lng);
    return LANGUAGES.find((l) => l.code === code)?.dir ?? "ltr";
}
