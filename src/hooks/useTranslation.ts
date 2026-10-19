import { useLanguage, Language } from '../context/LanguageContext';
import { translations, TranslationKeys } from '../locales';

export type { Language, TranslationKeys };

export interface UseTranslationReturn {
  t: (key: string, fallback?: string, variables?: Record<string, string | number>) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isBn: boolean;
  translations: typeof translations;
}

/**
 * useTranslation
 * Custom hook that interfaces with centralized translation dictionary and context
 */
export const useTranslation = (): UseTranslationReturn => {
  const { t, language, setLanguage, toggleLanguage, isBn } = useLanguage();

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
    isBn,
    translations,
  };
};

export default useTranslation;
