import Image from 'next/image';
import Link from 'next/link';
import { useAppTranslation } from '@/hooks/useTranslation';

export function Navbar() {
  const { t } = useAppTranslation();

  return (
    <header className="absolute w-full flex justify-between items-center px-12 py-9 border-b border-[rgba(26,24,23,0.12)]">
      <Image src="/brand/logo_horizontal_black.png" alt="Invoicer AI" width={100} height={100} />
      <nav className="flex gap-8">
        <Link href="#" className="text-[#1A1817] text-xs uppercase tracking-[0.05em]">
          {t('dashboard.myFiles')}
        </Link>
        <Link href="#" className="text-[#8A8580] text-xs uppercase tracking-[0.05em] hover:text-[#1A1817] transition-colors">
          {t('dashboard.overview')}
        </Link>
        <Link href="#" className="text-[#8A8580] text-xs uppercase tracking-[0.05em] hover:text-[#1A1817] transition-colors">
          {t('dashboard.settings')}
        </Link>
        <Link href="#" className="text-[#8A8580] text-xs uppercase tracking-[0.05em] hover:text-[#1A1817] transition-colors">
          {t('dashboard.signOut')}
        </Link>
      </nav>
      <div></div>
    </header>
  );
}
