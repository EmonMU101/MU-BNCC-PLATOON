import { en, TranslationKeys } from './en';
import { bn } from './bn';

export type Language = 'en' | 'bn';

export const translations: Record<Language, TranslationKeys> = {
  en,
  bn,
};

export { en, bn };
export type { TranslationKeys };
