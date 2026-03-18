import { useTranslation } from 'react-i18next';

export function Interface() {
  const { t } = useTranslation();

  return (
    <section id="features" className="border-y border-[#E2DDD8] bg-[#FCFBFA] relative">
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-3">
        <div className="p-12 md:p-16 border-b md:border-b-0 md:border-r border-[#E2DDD8] relative">
          <div className="w-10 h-10 rounded-full border border-[#E2DDD8] flex items-center justify-center mb-8 bg-[#FCFBFA]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h4 className="font-['Playfair_Display'] text-2xl mb-4">{t('landing.interface.preciseExtraction.title')}</h4>
          <p className="text-[#7A7571] leading-relaxed">
            {t('landing.interface.preciseExtraction.description')}
          </p>
        </div>

        <div className="p-12 md:p-16 border-b md:border-b-0 md:border-r border-[#E2DDD8] relative bg-[#FCFBFA]">
          <div className="w-10 h-10 rounded-full border border-[#E2DDD8] flex items-center justify-center mb-8 bg-[#FAFAF9]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h4 className="font-['Playfair_Display'] text-2xl mb-4">{t('landing.interface.anomalyDetection.title')}</h4>
          <p className="text-[#7A7571] leading-relaxed">
            {t('landing.interface.anomalyDetection.description')}
          </p>
        </div>

        <div className="p-12 md:p-16 relative">
          <div className="w-10 h-10 rounded-full border border-[#E2DDD8] flex items-center justify-center mb-8 bg-[#FCFBFA]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h4 className="font-['Playfair_Display'] text-2xl mb-4">{t('landing.interface.legalArchiving.title')}</h4>
          <p className="text-[#7A7571] leading-relaxed">
            {t('landing.interface.legalArchiving.description')}
          </p>
        </div>
      </div>
    </section>
  );
}
