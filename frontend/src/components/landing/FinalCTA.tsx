import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function FinalCTA() {
  const { t } = useTranslation();

  return (
    <section id="cta" className="py-24 md:py-32 px-6 md:px-12 bg-[#1A1817] text-[#FAFAF9] text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-['Playfair_Display'] text-4xl md:text-6xl mb-8" dangerouslySetInnerHTML={{ __html: t('landing.finalCTA.title') }} />
        <p className="text-[#E2DDD8]/70 mb-10 max-w-xl mx-auto font-light leading-relaxed">
          {t('landing.finalCTA.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/register" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-[#FCFBFA] text-[#1A1817] text-sm font-medium hover:bg-[#FAFAF9] transition-colors">
            {t('landing.finalCTA.createWorkspace')}
          </Link>
        </div>
      </div>
    </section>
  );
}
