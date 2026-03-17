'use client';

import { useTranslation } from 'react-i18next';
import { i18n } from '@/i18n';

export function useAppTranslation() {
  const { t } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return {
    t,
    changeLanguage,
    currentLanguage,
  };
}
