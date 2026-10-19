import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEYS = ['mu_bncc_theme', 'theme'] as const;

/**
 * Determine initial theme:
 * 1. Check localStorage for saved user choice ('dark' or 'light')
 * 2. Check document.documentElement classes (set by pre-hydration script)
 * 3. Fallback to OS prefers-color-scheme
 */
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved === 'dark' || saved === 'light') {
        return saved as Theme;
      }
    }

    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Storage access may be restricted in some environments
  }

  return 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Synchronize document.documentElement class and localStorage with state
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body?.classList.add('dark');
      body?.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body?.classList.add('light');
      body?.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    // Persist to localStorage across page refreshes
    try {
      STORAGE_KEYS.forEach((key) => localStorage.setItem(key, theme));
    } catch (err) {
      console.warn('Unable to persist theme to localStorage', err);
    }
  }, [theme]);

  // Sync across tabs and windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mu_bncc_theme' || e.key === 'theme') {
        const val = e.newValue;
        if (val === 'light' || val === 'dark') {
          setThemeState(val);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync with OS preference when user hasn't explicitly set a stored choice
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const hasStoredPreference = STORAGE_KEYS.some((key) => {
        try {
          return localStorage.getItem(key) !== null;
        } catch {
          return false;
        }
      });

      if (!hasStoredPreference) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
