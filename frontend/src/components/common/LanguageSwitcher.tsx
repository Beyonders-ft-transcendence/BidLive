import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪', dir: 'rtl' },
];

export default function LanguageSwitcher({ variant = 'default' }: { variant?: 'topbar' | 'default' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Consider base language to match correctly
  const currentLangCode = i18n.language?.split('-')[0] || 'pt';
  const currentLang = languages.find((lang) => lang.code === currentLangCode) || languages[0];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={
          variant === 'topbar'
            ? "flex items-center gap-1.5 px-2 py-1 text-[11px] sm:text-xs font-bold text-zinc-300 bg-transparent rounded-md hover:bg-white/10 hover:text-white transition-all focus:outline-none"
            : "flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted transition-colors focus:outline-none"
        }
      >
        <Globe size={variant === 'topbar' ? 14 : 16} className={variant === 'topbar' ? "" : "text-muted-foreground"} />
        <span className="hidden sm:inline-block tracking-wide">{currentLang.flag} {currentLang.name}</span>
        <span className="sm:hidden">{currentLang.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 origin-top-right bg-card border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted/50 ${
                  currentLangCode === lang.code ? 'bg-muted font-bold text-primary' : 'text-foreground'
                }`}
                dir={lang.dir || 'ltr'}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
