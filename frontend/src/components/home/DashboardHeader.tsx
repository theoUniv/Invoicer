import { useAppTranslation } from '@/hooks/useTranslation';
import { FileType } from '@/lib/files';
import { Search } from 'lucide-react';

interface DashboardHeaderProps {
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onDateFilterChange?: (value: string) => void;
  activeView?: 'list' | 'folders';
  currentFolder?: {
    type: FileType;
    year?: string;
    month?: string;
  };
  onBreadcrumbClick?: (level: 'root' | 'type' | 'year' | 'month', folder?: { type: FileType; year?: string; month?: string }) => void;
}

const getFolderLabel = (type: FileType) => {
  switch (type) {
    case 'invoice':
      return 'Factures';
    case 'contract':
      return 'Contrats';
    case 'quote':
      return 'Devis';
    case 'expense':
      return 'Notes de frais';
    default:
      return 'Documents';
  }
};

const getMonthLabel = (month: string) => {
  const months: { [key: string]: string } = {
    '01': 'Janvier',
    '02': 'Février', 
    '03': 'Mars',
    '04': 'Avril',
    '05': 'Mai',
    '06': 'Juin',
    '07': 'Juillet',
    '08': 'Août',
    '09': 'Septembre',
    '10': 'Octobre',
    '11': 'Novembre',
    '12': 'Décembre'
  };
  return months[month] || month;
};

export function DashboardHeader({ 
  onSearchChange, 
  onStatusFilterChange, 
  onDateFilterChange, 
  activeView = 'list',
  currentFolder,
  onBreadcrumbClick
}: DashboardHeaderProps) {
  const { t } = useAppTranslation();

  if (activeView === 'folders') {
    const breadcrumbParts = [];
    
    if (currentFolder) {
      breadcrumbParts.push({
        label: getFolderLabel(currentFolder.type),
        level: 'type' as const,
        folder: { type: currentFolder.type }
      });
      
      if (currentFolder.year) {
        breadcrumbParts.push({
          label: currentFolder.year,
          level: 'year' as const,
          folder: { type: currentFolder.type, year: currentFolder.year }
        });
      }
      
      if (currentFolder.month) {
        breadcrumbParts.push({
          label: getMonthLabel(currentFolder.month),
          level: 'month' as const,
          folder: currentFolder
        });
      }
    }

    return (
      <div className="flex flex-col">
        <div className="mb-8">
          <h1 className="text-5xl font-serif mb-2 tracking-tight text-[#121212]">
            {currentFolder ? 
              (currentFolder.month ? getMonthLabel(currentFolder.month) : 
               currentFolder.year ? currentFolder.year :
               getFolderLabel(currentFolder.type)) : 
              'Tous les documents'
            }
            {currentFolder?.year && !currentFolder.month && ` ${currentFolder.year}`}
          </h1>
          <p className="text-xs uppercase tracking-wider text-[#6B6B66]">
            {currentFolder?.month ? 'Fichiers du mois' : 
             currentFolder?.year ? 'Fichiers de l\'année' : 
             currentFolder ? 'Tous les fichiers' :
             'Navigatez dans vos documents'}
          </p>
        </div>
                <nav className="flex items-center gap-2 mb-6 text-xs uppercase tracking-wider text-[#6B6B66]">
          <button 
            onClick={() => onBreadcrumbClick?.('root')}
            className="breadcrumb nav-item hover:text-[#121212] transition-colors cursor-pointer"
          >
            Tous les dossiers
          </button>
          
          {breadcrumbParts.map((part, index) => (
            <span key={index}>
              <span className="mx-2">/</span>
              <button 
                onClick={() => onBreadcrumbClick?.(part.level, part.folder)}
                className="breadcrumb nav-item hover:text-[#121212] transition-colors cursor-pointer"
              >
                {part.label}
              </button>
            </span>
          ))}
        </nav>
      </div>
    );
  }

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
