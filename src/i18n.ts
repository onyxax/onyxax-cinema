import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from './locales';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

function applyArabicFont(lng: string) {
  if (lng === 'ar') {
    document.documentElement.style.setProperty('--font-sans', 'Tajawal');
    document.body.style.fontFamily = 'Tajawal, sans-serif';
  } else {
    document.documentElement.style.removeProperty('--font-sans');
    document.body.style.fontFamily = '';
  }
}

// Apply font on initial load (scripts run inside <body>, so body is available)
applyArabicFont(i18n.language);

// RTL disabled temporarily — keep LTR for all languages (Arabic stays available)
// Set document direction and lang on initial load (persists across reloads)
document.documentElement.dir = 'ltr';
document.documentElement.lang = i18n.language;

// Update document direction and font on language change
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = lng;
  applyArabicFont(lng);
  // Clear TMDB cache to force refetch with new language
  Object.keys(localStorage)
    .filter(k => k.startsWith('onyxax_cache_'))
    .forEach(k => localStorage.removeItem(k));
  // Reload page to ensure all TMDB data updates immediately
  window.location.reload();
});

export default i18n;
