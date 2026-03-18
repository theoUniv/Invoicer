import { create } from 'zustand';
import { i18n } from '@/i18n';

interface TranslationState {
  currentLanguage: string;
  changeLanguage: (lng: string) => void;
  syncWithI18n: () => void;
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  currentLanguage: i18n.language,
  changeLanguage: (lng: string) => {
    i18n.changeLanguage(lng);
    set({ currentLanguage: lng });
  },
  syncWithI18n: () => {
    const currentI18nLanguage = i18n.language;
    if (get().currentLanguage !== currentI18nLanguage) {
      set({ currentLanguage: currentI18nLanguage });
    }
  },
}));
