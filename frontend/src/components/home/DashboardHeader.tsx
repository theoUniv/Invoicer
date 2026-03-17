import { Search } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useTranslation';

interface DashboardHeaderProps {
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onDateFilterChange?: (value: string) => void;
}

export function DashboardHeader({ onSearchChange, onStatusFilterChange, onDateFilterChange }: DashboardHeaderProps) {
  const { t } = useAppTranslation();

  return (
    <div className="flex justify-between items-end mb-8">
      <h1 className="font-['Playfair_Display'] text-[3.5rem] leading-none tracking-[-0.02em] text-black">
        {t('dashboard.myFiles')}
      </h1>
      
      <div className="flex gap-6 items-end">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A8580]" />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            className="bg-transparent border-b border-[rgba(26,24,23,0.12)] py-2 pr-3 pl-10 text-sm text-[#1A1817] outline-none transition-colors focus:border-[#1A1817] w-48 placeholder:text-[#8A8580]"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
        <select 
          className="bg-transparent border-b border-[rgba(26,24,23,0.12)] py-2 text-sm text-[#1A1817] outline-none transition-colors focus:border-[#1A1817] w-30"
          onChange={(e) => onStatusFilterChange?.(e.target.value)}
        >
          <option>{t('dashboard.allStatus')}</option>
          <option>{t('dashboard.paid')}</option>
          <option>{t('dashboard.pending')}</option>
        </select>
        <select 
          className="bg-transparent border-b border-[rgba(26,24,23,0.12)] py-2 text-sm text-[#1A1817] outline-none transition-colors focus:border-[#1A1817] w-30"
          onChange={(e) => onDateFilterChange?.(e.target.value)}
        >
          <option>{t('dashboard.thisMonth')}</option>
          <option>{t('dashboard.lastMonth')}</option>
          <option>{t('dashboard.yearToDate')}</option>
        </select>
      </div>
    </div>
  );
}
