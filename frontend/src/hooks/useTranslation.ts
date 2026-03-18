'use client';

import { useTranslation } from 'react-i18next';
import { useTranslationStore } from '@/stores/translationStore';
import { useEffect } from 'react';

export function useAppTranslation() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, syncWithI18n } = useTranslationStore();

  useEffect(() => {
    syncWithI18n();
  }, [syncWithI18n]);

  return {
    t,
    changeLanguage,
    currentLanguage,
  };
}
