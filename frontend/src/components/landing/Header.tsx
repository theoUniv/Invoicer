import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const SmoothLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="w-full border-b border-[#E2DDD8] relative z-20 bg-[#FAFAF9]/80 backdrop-blur-md sticky top-0">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
        <SmoothLink href="#hero" className="text-xl font-medium tracking-tight">
          <Image src="/brand/logo_horizontal_black.png" alt="Invoicer Logo" width={100} height={100} />
        </SmoothLink>
        
        <nav className="hidden md:flex items-center gap-10">
          <SmoothLink href="#ecosystem" className="text-sm font-medium text-[#7A7571] hover:text-[#1A1817] transition-colors">
            {t('landing.header.ecosystem')}
          </SmoothLink>
          <SmoothLink href="#features" className="text-sm font-medium text-[#7A7571] hover:text-[#1A1817] transition-colors">
            {t('landing.header.features')}
          </SmoothLink>
          <SmoothLink href="#interface" className="text-sm font-medium text-[#7A7571] hover:text-[#1A1817] transition-colors">
            {t('landing.header.interface')}
          </SmoothLink>
          <SmoothLink href="#cta" className="text-sm font-medium text-[#7A7571] hover:text-[#1A1817] transition-colors">
            {t('landing.header.space')}
          </SmoothLink>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[#7A7571] hover:text-[#1A1817] transition-colors hidden sm:block">
            {t('landing.header.login')}
          </Link>
          <Link href="/register" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1A1817] text-[#FAFAF9] text-sm font-medium hover:bg-black transition-all">
            {t('landing.header.register')}
          </Link>
        </div>
      </div>
    </header>
  );
}
