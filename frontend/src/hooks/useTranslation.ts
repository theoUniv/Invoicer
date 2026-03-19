'use client';

import { useTranslation } from 'react-i18next';
import { useTranslationStore } from '@/stores/translationStore';
import { useEffect } from 'react';

export function useAppTranslation() {
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage, syncWithI18n } = useTranslationStore();

  useEffect(() => {
    syncWithI18n();
  }, [syncWithI18n]);

  const getTranslations = () => {
    const lang = currentLanguage || i18n.language;
    return (i18n as any).getResourceBundle?.(lang, 'translation') || {};
  };

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage,
    translations: getTranslations(),
  };
}
