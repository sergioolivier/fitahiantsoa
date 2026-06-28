import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr';
import en from './locales/en';
import zh from './locales/zh';
import mg from './locales/mg';
import ja from './locales/ja';
import de from './locales/de';

// Liste des langues disponibles sur la plateforme, utilisee par le selecteur de langue.
export const AVAILABLE_LANGUAGES = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'zh', flag: '🇨🇳' },
  { code: 'mg', flag: '🇲🇬' },
  { code: 'ja', flag: '🇯🇵' },
  { code: 'de', flag: '🇩🇪' },
];

i18n
  .use(LanguageDetector) // detecte la langue du navigateur au premier chargement
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      zh: { translation: zh },
      mg: { translation: mg },
      ja: { translation: ja },
      de: { translation: de },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'zh', 'mg', 'ja', 'de'],
    interpolation: {
      escapeValue: false, // React echappe deja le contenu, pas besoin de double echappement
    },
    detection: {
      // Persiste le choix de langue dans le localStorage sous une cle dediee FITAHIANTSOA,
      // pour ne pas entrer en conflit avec d'autres cles i18next par defaut.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'fitahiantsoa_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
