import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslation from './locales/pt/translation.json';
import enTranslation from './locales/en/translation.json';
import arTranslation from './locales/ar/translation.json';

// Os resources carregam os diferentes idiomas
const resources = {
  pt: {
    translation: ptTranslation,
  },
  en: {
    translation: enTranslation,
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
    supportedLngs: ['pt', 'en', 'ar'],
    
    interpolation: {
      escapeValue: false, // react já faz escape contra XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // guarda a preferência no localstorage
    }
  });

// Atualizar a direção do layout (RTL / LTR) e classe do tailwind de rtl
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  
  if (lng === 'ar') {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
});

// Inicializa a direção com base no idioma carregado inicialmente
const initialLng = i18n.language || 'pt';
document.documentElement.dir = initialLng.startsWith('ar') ? 'rtl' : 'ltr';
document.documentElement.lang = initialLng;

export default i18n;
