'use client';

import { useAppTranslation } from '@/hooks/useTranslation';

export default function Overview() {
  const { t } = useAppTranslation();

  return (
    <div className="min-h-screen bg-[#F4F1ED] pt-24"
         style={{
           backgroundImage: 'radial-gradient(circle at 80% 90%, rgba(212, 197, 211, 1) 0%, transparent 50%), radial-gradient(circle at 10% 10%, rgba(220, 224, 228, 0.5) 0%, transparent 40%)',
           backgroundAttachment: 'fixed'
         }}>
      
      <div className="container mx-auto px-12 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-2xl">
            <h1 className="font-['Playfair_Display'] font-normal text-5xl mb-6 tracking-tight text-[#121212]">
              {t('dashboard.overview')}
            </h1>
            <p className="text-lg text-[#8A8580] mb-8 leading-relaxed">
              {t('dashboard.folders.descriptions.overviewInDevelopment')}
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1817]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
