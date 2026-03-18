import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function CTA() {
  const { t } = useTranslation();

  return (
    <section id="interface" className="py-24 md:py-32 px-6 md:px-12 max-w-[1440px] mx-auto w-full text-center">
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#7A7571] mb-8 block">
        {t('landing.cta.title')}
      </span>
      
      <div className="max-w-4xl mx-auto border border-[#E2DDD8] rounded-2xl bg-[#FCFBFA] shadow-sm overflow-hidden text-left p-2">
        <div className="border border-[#E2DDD8] rounded-xl bg-[#FCFBFA] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#E2DDD8] bg-[#FCFBFA]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#E2DDD8]" />
              <div className="w-3 h-3 rounded-full bg-[#E2DDD8]" />
              <div className="w-3 h-3 rounded-full bg-[#E2DDD8]" />
            </div>
            <div className="text-xs font-medium text-[#7A7571]">invoicer.com/home</div>
          </div>
          
          <div className="p-8">
            <h4 className="font-['Playfair_Display'] text-2xl mb-6">{t('landing.cta.invoicesQueue')}</h4>
            <div className="flex flex-col">
              <div className="grid grid-cols-4 pb-3 border-b border-[#1A1817] text-xs uppercase tracking-[0.15em] text-[#7A7571] font-medium">
                <div>{t('landing.cta.vendor')}</div>
                <div>{t('landing.cta.date')}</div>
                <div>{t('landing.cta.amount')}</div>
                <div>{t('landing.cta.status')}</div>
              </div>
              
              <div className="grid grid-cols-4 py-4 border-b border-[#E2DDD8] items-center hover:bg-[#FCFBFA] transition-colors cursor-pointer">
                <div className="font-medium">{t('landing.cta.data.stripe.name')}</div>
                <div className="text-[#7A7571] text-sm">{t('landing.cta.data.stripe.date')}</div>
                <div className="font-['Playfair_Display'] text-lg">{t('landing.cta.data.stripe.amount')}</div>
                <div><span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.15em] rounded-full border border-[#1A1817] bg-[#1A1817] text-[#FAFAF9]">{t('landing.cta.extracted')}</span></div>
              </div>
              
              <div className="grid grid-cols-4 py-4 border-b border-[#E2DDD8] items-center hover:bg-[#FCFBFA] transition-colors cursor-pointer">
                <div className="font-medium">{t('landing.cta.data.adobe.name')}</div>
                <div className="text-[#7A7571] text-sm">{t('landing.cta.data.adobe.date')}</div>
                <div className="font-['Playfair_Display'] text-lg">{t('landing.cta.data.adobe.amount')}</div>
                <div><span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.15em] rounded-full border border-[#1A1817] bg-[#1A1817] text-[#FAFAF9]">{t('landing.cta.paid')}</span></div>
              </div>
              
              <div className="grid grid-cols-4 py-4 border-b border-[#E2DDD8] items-center hover:bg-[#FCFBFA] transition-colors cursor-pointer opacity-50">
                <div className="font-medium">{t('landing.cta.data.unseen.name')}</div>
                <div className="text-[#7A7571] text-sm">{t('landing.cta.data.unseen.date')}</div>
                <div className="font-['Playfair_Display'] text-lg">{t('landing.cta.data.unseen.amount')}</div>
                <div><span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#7A7571] animate-pulse" /> <span className="text-xs text-[#7A7571]">{t('landing.cta.processing')}</span></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
