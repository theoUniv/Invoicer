import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation();

  return (
    <section id="hero" className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 md:px-12 max-w-[1440px] mx-auto w-full flex flex-col items-center text-center border-b border-[#E2DDD8]">
      <div className="absolute inset-0 pointer-events-none flex justify-center opacity-30">
        <div className="w-full max-w-5xl flex justify-between h-full border-x border-[#E2DDD8]">
          <div className="w-px h-full bg-[#E2DDD8]" />
          <div className="w-px h-full bg-[#E2DDD8]" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E2DDD8] bg-[#FCFBFA]/50 backdrop-blur-sm mb-8">
        <span className="w-2 h-2 rounded-full bg-[#1A1817] animate-pulse" />
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#7A7571]">
          {t('landing.hero.liveBadge')}
        </span>
      </div>

      <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-5xl mb-8" dangerouslySetInnerHTML={{ __html: t('landing.hero.title') }} />

      <p className="text-lg md:text-xl text-[#7A7571] max-w-2xl mb-12 font-light leading-relaxed">
        {t('landing.hero.subtitle')}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#1A1817] text-[#FAFAF9] text-sm font-medium hover:bg-black transition-all">
          {t('landing.hero.startTrial')}
        </Link>
        <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-full border border-solid border-[#1A1817] text-[#1A1817] text-sm font-medium hover:bg-[#1A1817] hover:text-[#FAFAF9] transition-all">
          {t('landing.hero.discoverProduct')}
        </Link>
      </div>
    </section>
  );
}
