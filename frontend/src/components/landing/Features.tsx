import { Plus, PlusSquare } from "lucide-react";
import Link from "next/link";
import { useTranslation } from 'react-i18next';

export function Features() {
  const { t } = useTranslation();

  return (
    <section id="ecosystem" className="py-24 md:py-32 px-6 md:px-12 max-w-[1440px] mx-auto w-full">
      <div className="text-center mb-16">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#7A7571] mb-4 block">
          {t('landing.header.ecosystem')}
        </span>
        <h2 className="font-serif text-4xl md:text-5xl max-w-3xl mx-auto tracking-tight" dangerouslySetInnerHTML={{ __html: t('landing.features.title') }} />
      </div>

      <div className="max-w-6xl mx-auto bg-stone-50 rounded-3xl border border-stone-300 overflow-hidden shadow-sm relative">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-stone-300 flex flex-col justify-center relative">
            <div className="absolute top-[-6px] right-[-9px] text-black text-xl leading-none font-light pointer-events-none select-none z-10 hidden lg:block">
              <Plus size={18} />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-300 mb-8 w-fit bg-stone-100/50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <span className="text-xs font-medium">{t('landing.features.badge')}</span>
            </div>

            <h3 className="font-serif text-3xl md:text-4xl leading-tight mb-6 tracking-tight" dangerouslySetInnerHTML={{ __html: t('landing.features.subtitle') }} />
            <p className="text-stone-500 mb-10 leading-relaxed">
              {t('landing.features.description')}
            </p>

            <div className="flex items-center gap-4 mt-auto">
              <Link href="/login" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-stone-900 text-stone-50 text-sm font-medium hover:bg-black transition-all">
                {t('landing.features.seeIntegrations')}
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 md:grid-cols-3 bg-stone-100">
            <div className="aspect-square flex items-center justify-center border-b border-r border-stone-300 relative group hover:bg-stone-50 transition-colors">
              <div className="absolute bottom-[-10px] right-[-9px] text-stone-900 text-xl leading-none font-light pointer-events-none select-none z-10">
                <Plus size={18} />
              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF] group-hover:scale-110 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.143-3.356-2.077 0-.676.677-1.196 1.83-1.196 1.154 0 2.527.468 3.514 1.092l1.092-3.116C15.803 2.912 14.192 2.5 12.53 2.5c-3.69 0-6.184 1.766-6.184 4.883 0 3.273 2.91 4.26 5.508 5.143 2.38.805 3.106 1.35 3.106 2.234 0 .883-1.038 1.402-2.284 1.402-1.714 0-3.377-.675-4.468-1.402l-1.143 3.272c1.35.83 3.325 1.455 5.35 1.455 4.05 0 6.495-1.92 6.495-5.038 0-2.857-2.13-4.05-4.935-5.297z"></path></svg>
              </div>
            </div>

            <div className="aspect-square flex items-center justify-center border-b border-r md:border-r-0 lg:border-r border-stone-300 relative group hover:bg-stone-50 transition-colors">
              <div className="absolute bottom-[-10px] right-[-9px] text-stone-900 text-xl leading-none font-light pointer-events-none select-none z-10 hidden md:block lg:block">
                <Plus size={18} />
              </div>
              <div className="absolute bottom-[-10px] right-[-9px] text-stone-900 text-xl leading-none font-light pointer-events-none select-none z-10 block md:hidden">
                <Plus size={18} />
              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#7141E1]/10 flex items-center justify-center text-[#7141E1] group-hover:scale-110 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
              </div>
            </div>

            <div className="aspect-square flex items-center justify-center border-b border-stone-300 relative group hover:bg-stone-50 transition-colors md:border-b">
              <div className="w-16 h-16 rounded-2xl bg-[#00A170]/10 flex items-center justify-center text-[#00A170] group-hover:scale-110 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path></svg>
              </div>
            </div>

            <div className="aspect-square flex items-center justify-center border-b md:border-b-0 border-r border-stone-300 relative group hover:bg-stone-50 transition-colors">
              <div className="absolute bottom-[-10px] right-[-9px] text-stone-900 text-xl leading-none font-light pointer-events-none select-none z-10 block md:hidden">
                <Plus size={18} />
              </div>
              <div className="absolute top-[-10px] right-[-9px] text-stone-900 text-xl leading-none font-light pointer-events-none select-none z-10 hidden md:block lg:block">
                <Plus size={18} />
              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#13B5EA]/10 flex items-center justify-center text-[#13B5EA] group-hover:scale-110 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </div>
            </div>


            <div className="aspect-square flex items-center justify-center border-r border-stone-300 relative group hover:bg-stone-50 transition-colors">
              <div className="absolute top-[-10px] right-[-9px] text-stone-900 text-xl leading-none font-light pointer-events-none select-none z-10 hidden md:block lg:block">
                <Plus size={18} />
              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#1FA463]/10 flex items-center justify-center text-[#1FA463] group-hover:scale-110 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 19h7l5-9h10L12 2zm0 13l-5 9h10l5-9H12z"></path></svg>
              </div>
            </div>


            <div className="aspect-square flex items-center justify-center relative group hover:bg-stone-50 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-stone-900/5 flex items-center justify-center text-stone-900 group-hover:scale-110 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
