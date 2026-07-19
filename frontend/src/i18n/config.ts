import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { LANGUAGE_CODES, directionOf } from './languages';

import ptTranslation from './locales/pt/translation.json';
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import arTranslation from './locales/ar/translation.json';

// Os resources carregam os diferentes idiomas
const resources = {
  pt: {
    translation: ptTranslation,
  },
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

i18n
  .use(LanguageDetector) // deteta o idioma do navegador ou localStorage
  .use(initReactI18next) // injeta no react-i18next
  .init({
    resources,
    fallbackLng: 'pt', // idioma por defeito se não encontrar o selecionado
    supportedLngs: LANGUAGE_CODES,
    
    interpolation: {
      escapeValue: false, // react já faz escape contra XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // guarda a preferência no localstorage
    }
  });

// Aplica a direção do layout (RTL / LTR) e a classe rtl usada pelo Tailwind
function applyDirection(lng: string) {
  const dir = directionOf(lng);
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  document.body.classList.toggle('rtl', dir === 'rtl');
}

i18n.on('languageChanged', applyDirection);

// Inicializa lang/dir com base no idioma carregado inicialmente
applyDirection(i18n.language || 'pt');

export default i18n;
