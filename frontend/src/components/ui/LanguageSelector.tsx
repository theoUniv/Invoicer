'use client';

import { useAppTranslation } from '@/hooks/useTranslation';
import { Button } from './Button';

export function LanguageSelector() {
  const { changeLanguage, currentLanguage } = useAppTranslation();

  return (
    <div className="fixed top-12 right-12 z-40 flex gap-2">
      <Button
        variant='ghost'
        size="sm"
        onClick={() => changeLanguage('fr')}
      >
        [FR]
      </Button>
      <Button
        variant='ghost'
        size="sm"
        onClick={() => changeLanguage('en')}
      >
        [ENG]
      </Button>
    </div>
  );
}
