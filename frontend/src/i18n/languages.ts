/**
 * Fonte unica dos idiomas suportados.
 * Importado pelo LanguageSwitcher (navbar) e pelo Footer para que ambos
 * ofereçam exatamente as mesmas opções.
 */
export interface Language {
    code: string;
    name: string;
    flag: string;
}

export const LANGUAGES: Language[] = [
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
];

/** Idioma base, ignorando a região ("fr-FR" -> "fr"). */
export function baseLanguage(lng: string | undefined): string {
    return lng?.split("-")[0] || "pt";
}
