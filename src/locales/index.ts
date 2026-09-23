// Barrel — centralized resources for i18n
import ar from './ar';
import de from './de';
import en from './en';
import es from './es';
import fr from './fr';
import it from './it';
import ja from './ja';
import pt from './pt';
import ru from './ru';
import zh from './zh';

export const resources = {
  ar: { translation: ar },
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
  ja: { translation: ja },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
} as const;

export type Lang = keyof typeof resources;
