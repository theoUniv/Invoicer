import { useAppTranslation } from '@/hooks/useTranslation';
import { FileData, FileType } from '@/lib/types/documents';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  files?: FileData[];
  onFilteredFilesChange?: (filteredFiles: FileData[]) => void;
}

const getFolderLabel = (type: FileType, t: any) => {
  switch (type) {
    case 'invoice':
      return t('dashboard.folders.invoices');
    case 'contract':
      return t('dashboard.folders.contracts');
    case 'quote':
      return t('dashboard.folders.quotes');
    case 'expense':
      return t('dashboard.folders.expenses');
    default:
      return t('dashboard.folders.documents');
  }
};

const getMonthLabel = (month: string, t: any) => {
  const months = t('dashboard.folders.months');

  if (months && typeof months === 'object' && !Array.isArray(months)) {
    return months[month] || month;
  }

  const monthMap: Record<string, string> = {
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
    '12': 'Décembre',
  };

  return monthMap[month] || month;
};

const searchFiles = (files: FileData[], searchTerm: string): FileData[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return files;
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  return files.filter(file => 
    file.id.toLowerCase().includes(normalizedSearchTerm) ||
    file.vendor.toLowerCase().includes(normalizedSearchTerm) ||
    file.amount.replace(/[$€£]/g, '').toLowerCase().includes(normalizedSearchTerm) ||
    file.status.toLowerCase().includes(normalizedSearchTerm) ||
    file.date.toLowerCase().includes(normalizedSearchTerm) ||
    file.fileName?.toLowerCase().includes(normalizedSearchTerm)
  );
};

export function DashboardHeader({
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  activeView = 'list',
  currentFolder,
  onBreadcrumbClick,
  files = [],
  onFilteredFilesChange
}: DashboardHeaderProps) {
  const { t } = useAppTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const handleStatusFilterChange = (value: string) => {
    const next = value as 'all' | 'paid' | 'pending';
    setStatusFilter(next);
    onStatusFilterChange?.(next);
  };

  useEffect(() => {
    const filteredFiles = searchFiles(files, searchTerm);

    const statusFilteredFiles = statusFilter === 'all'
      ? filteredFiles
      : filteredFiles.filter(file => {
          const raw = (file.status ?? '').toLowerCase();

          if (statusFilter === 'paid') {
            return raw === 'paid' || raw === 'processed' || raw === 'completed';
          }

          return raw === 'pending' || raw === 'uploaded' || raw === 'processing';
        });

    onFilteredFilesChange?.(statusFilteredFiles);
    onSearchChange?.(searchTerm);
  }, [searchTerm, files, statusFilter, onFilteredFilesChange, onSearchChange]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (activeView === 'folders') {
    const breadcrumbParts = [];

    if (currentFolder) {
      breadcrumbParts.push({
        label: getFolderLabel(currentFolder.type, t),
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
          label: getMonthLabel(currentFolder.month, t),
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
              (currentFolder.month ? getMonthLabel(currentFolder.month, t) :
                currentFolder.year ? currentFolder.year :
                  getFolderLabel(currentFolder.type, t)) :
              t('dashboard.folders.allFiles')
            }
            {currentFolder?.year && !currentFolder.month && ` ${currentFolder.year}`}
          </h1>
          <p className="text-xs uppercase tracking-wider text-[#6B6B66]">
            {currentFolder?.month ? t('dashboard.folders.descriptions.monthFiles') :
              currentFolder?.year ? t('dashboard.folders.descriptions.yearFiles') :
                currentFolder ? t('dashboard.folders.descriptions.allTypeFiles') :
                  t('dashboard.folders.descriptions.browseDocuments')}
          </p>
        </div>
        <nav className="flex items-center gap-2 mb-6 text-xs uppercase tracking-wider text-[#6B6B66] z-10 w-[80%]">
          <button
            onClick={() => onBreadcrumbClick?.('root')}
            className="breadcrumb nav-item hover:text-[#121212] transition-colors cursor-pointer"
          >
            {t('dashboard.folders.allFiles')}
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
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <select
          className="bg-transparent border-b border-[rgba(26,24,23,0.12)] py-2 text-sm text-[#1A1817] outline-none transition-colors focus:border-[#1A1817] w-30"
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
        >
          <option value="all">{t('dashboard.allStatus')}</option>
          <option value="paid">{t('dashboard.paid')}</option>
          <option value="pending">{t('dashboard.pending')}</option>
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
