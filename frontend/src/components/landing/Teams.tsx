import { useTranslation } from 'react-i18next';

export function Teams() {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-[#FCFBFA]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#7A7571]">
          {t('landing.teams.usedBy')}
        </span>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="w-8 h-8 bg-[#1A1817] rounded" />
          <div className="w-8 h-8 bg-[#1A1817] rounded" />
          <div className="w-8 h-8 bg-[#1A1817] rounded" />
          <div className="w-8 h-8 bg-[#1A1817] rounded" />
        </div>
      </div>
    </section>
  );
}
