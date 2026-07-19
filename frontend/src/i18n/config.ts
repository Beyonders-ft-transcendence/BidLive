import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslation from './locales/pt/translation.json';
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';

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
};

i18n
  .use(LanguageDetector) // deteta o idioma do navegador ou localStorage
  .use(initReactI18next) // injeta no react-i18next
  .init({
    resources,
    fallbackLng: 'pt', // idioma por defeito se não encontrar o selecionado
    supportedLngs: ['pt', 'en', 'fr'],
    
    interpolation: {
      escapeValue: false, // react já faz escape contra XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // guarda a preferência no localstorage
    }
  });

// Todos os idiomas suportados sao LTR, mas mantemos o dir explicito no <html>
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = lng;
  document.body.classList.remove('rtl');
});

// Inicializa lang/dir com base no idioma carregado inicialmente
const initialLng = i18n.language || 'pt';
document.documentElement.dir = 'ltr';
document.documentElement.lang = initialLng;

export default i18n;
