import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[#E2DDD8] bg-[#FCFBFA] relative z-10 pt-16 pb-8 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
        <div className="col-span-2 lg:col-span-2">
          <Link href="#hero" className="text-2xl font-medium tracking-tight block mb-6">
            <Image src="/brand/logo_horizontal_black.png" alt="Invoicer AI" width={150} height={50} />
          </Link>
          <p className="text-[#7A7571] text-sm leading-relaxed max-w-xs">
            {t('landing.footer.description')}
          </p>
        </div>

        <div>
          <h5 className="text-xs font-medium uppercase tracking-[0.15em] mb-6 text-[#1A1817]">{t('landing.footer.product')}</h5>
          <ul className="flex flex-col gap-3">
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.aiExtraction')}</Link></li>
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.approvalWorkflows')}</Link></li>
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.supplierPayments')}</Link></li>
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.erpIntegrations')}</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-medium uppercase tracking-[0.15em] mb-6 text-[#1A1817]">{t('landing.footer.company')}</h5>
          <ul className="flex flex-col gap-3">
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.about')}</Link></li>
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.careers')}</Link></li>
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.press')}</Link></li>
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-medium uppercase tracking-[0.15em] mb-6 text-[#1A1817]">{t('landing.footer.legal')}</h5>
          <ul className="flex flex-col gap-3">
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.privacy')}</Link></li>
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.termsOfUse')}</Link></li>
            <li><Link href="#" className="text-sm text-[#7A7571] hover:text-[#1A1817] transition-colors">{t('landing.footer.security')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#E2DDD8] text-xs text-[#7A7571]">
        <p>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-[#1A1817] transition-colors">{t('landing.footer.linkedin')}</Link>
        </div>
      </div>
    </footer>
  );
}
