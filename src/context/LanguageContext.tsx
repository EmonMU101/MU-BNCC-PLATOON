import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { translations, Language, TranslationKeys } from '../locales';

export type { Language };

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string, variables?: Record<string, string | number>) => string;
  isBn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEYS = ['mu_bncc_lang', 'language', 'lang'] as const;

/**
 * Helper to retrieve nested object value by dot notation: e.g. "nav.home"
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const segments = path.split('.');
  let current: any = obj;
  for (const seg of segments) {
    if (current && typeof current === 'object' && seg in current) {
      current = current[seg];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Determine initial language:
 * 1. Check localStorage for saved user choice ('en' or 'bn')
 * 2. Check HTML lang attribute
 * 3. Fallback to 'en'
 */
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';

  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved === 'en' || saved === 'bn') {
        return saved;
      }
    }

    const docLang = document.documentElement.lang;
    if (docLang === 'bn' || docLang.startsWith('bn')) {
      return 'bn';
    }

    // Check browser languages
    if (navigator.language && navigator.language.startsWith('bn')) {
      return 'bn';
    }
  } catch {
    // Storage access might fail in restricted iframe environments
  }

  return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [, startTransition] = useTransition();

  // Keep <html lang="..."> in sync with the active language & persist choice
  useEffect(() => {
    try {
      document.documentElement.lang = language;
      if (language === 'bn') {
        document.documentElement.setAttribute('data-lang', 'bn');
      } else {
        document.documentElement.setAttribute('data-lang', 'en');
      }

      STORAGE_KEYS.forEach((key) => {
        localStorage.setItem(key, language);
      });
    } catch (err) {
      console.warn('Could not persist language choice to localStorage:', err);
    }
  }, [language]);

  // Sync across tabs & windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (STORAGE_KEYS.includes(e.key as any)) {
        const val = e.newValue;
        if (val === 'en' || val === 'bn') {
          startTransition(() => {
            setLanguageState(val);
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setLanguage = (newLang: Language) => {
    startTransition(() => {
      setLanguageState(newLang);
    });
  };

  const toggleLanguage = () => {
    startTransition(() => {
      setLanguageState((prev) => (prev === 'en' ? 'bn' : 'en'));
    });
  };

  /**
   * Translate key with dotted path, fallback, and dynamic variables
   * Example: t('events.viewFullCalendar', undefined, { count: 5 })
   */
  const t = (
    key: string,
    fallback?: string,
    variables?: Record<string, string | number>
  ): string => {
    const activeDict = translations[language];
    const enDict = translations.en;

    let text = getNestedValue(activeDict, key);

    // Fall back to English dictionary if missing in target
    if (text === undefined || text === null) {
      text = getNestedValue(enDict, key);
    }

    // Fall back to explicit provided fallback or key itself
    if (text === undefined || text === null) {
      text = fallback !== undefined ? fallback : key;
    }

    if (typeof text !== 'string') {
      return String(text);
    }

    // Variable interpolation: e.g. {count} -> 5
    if (variables) {
      let interpolated = text;
      Object.entries(variables).forEach(([varKey, varValue]) => {
        // If language is Bengali, convert numeric digits to Bengali numerals if helpful
        let formattedValue = String(varValue);
        if (language === 'bn' && typeof varValue === 'number') {
          const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
          formattedValue = formattedValue.replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)] || d);
        }
        interpolated = interpolated.replace(
          new RegExp(`\\{${varKey}\\}`, 'g'),
          formattedValue
        );
      });
      return interpolated;
    }

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isBn: language === 'bn',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = useLanguage;
