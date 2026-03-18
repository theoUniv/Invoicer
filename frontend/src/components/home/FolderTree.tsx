'use client';

import { useAppTranslation } from '@/hooks/useTranslation';
import { ChevronRight, Folder } from 'lucide-react';
import { FileData, FileType } from '@/lib/files';
import { useState } from 'react';

interface FolderTreeProps {
  files: FileData[];
  onFolderSelect?: (folder: { type: FileType; year?: string; month?: string } | undefined) => void;
  currentFolder?: {
    type: FileType;
    year?: string;
    month?: string;
  };
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
  return months[month] || month;
};

const getYearsFromFiles = (files: FileData[]) => {
  const years = new Set<string>();
  files.forEach(file => {
    const year = new Date(file.date).getFullYear().toString();
    years.add(year);
  });
  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
};

const getMonthsFromFiles = (files: FileData[], year: string, type: FileType) => {
  const months = new Set<string>();
  files.forEach(file => {
    if (file.type === type) {
      const fileYear = new Date(file.date).getFullYear().toString();
      if (fileYear === year) {
        const month = new Date(file.date).getMonth() + 1;
        months.add(month.toString().padStart(2, '0'));
      }
    }
  });
  return Array.from(months).sort((a, b) => parseInt(a) - parseInt(b));
};

export function FolderTree({
  files,
  onFolderSelect,
  currentFolder
}: FolderTreeProps) {
  const { t } = useAppTranslation();
  const [expandedTypes, setExpandedTypes] = useState<Set<FileType>>(new Set());
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  const toggleType = (type: FileType) => {
    const newExpanded = new Set(expandedTypes);
    
    if (currentFolder?.type === type && !currentFolder?.year) {
      onFolderSelect?.(undefined);
      if (newExpanded.has(type)) {
        newExpanded.delete(type);
      }
    } else {
      onFolderSelect?.({ type });
      if (!newExpanded.has(type)) {
        newExpanded.add(type);
      }
    }
    
    setExpandedTypes(newExpanded);
  };

  const toggleYear = (yearKey: string) => {
    const newExpanded = new Set(expandedYears);
    const [type, year] = yearKey.split('-');
    
    if (currentFolder?.type === type && currentFolder?.year === year) {
      onFolderSelect?.({ type });
      if (newExpanded.has(yearKey)) {
        newExpanded.delete(yearKey);
      }
    } else {
      onFolderSelect?.({ type: type as FileType, year });
      if (!newExpanded.has(yearKey)) {
        newExpanded.add(yearKey);
      }
    }
    
    setExpandedYears(newExpanded);
  };

  const fileTypes: FileType[] = ['invoice', 'contract', 'quote', 'expense'];
  const years = getYearsFromFiles(files);

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col gap-6 mt-10">
      <div>
        <div className="mb-8">
          {fileTypes.map((type) => {
            const typeYears = getYearsFromFiles(files.filter(f => f.type === type));
            const isCurrentType = currentFolder?.type === type;
            const isExpanded = expandedTypes.has(type);

            return (
              <div key={type} className="mb-4">
                <div
                  className={`folder-item flex items-center gap-3 py-2 text-sm cursor-pointer transition-colors duration-200 ${isCurrentType && !currentFolder?.year ? 'text-[#121212] font-medium' : 'text-[#121212]'
                    }`}
                  onClick={() => {
                    onFolderSelect?.({ type });
                    toggleType(type);
                  }}
                >
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''
                      }`}
                  />
                  <Folder className="w-4 h-4 stroke-currentColor stroke-1.5" />
                  <span className={isCurrentType && !currentFolder?.year ? 'font-medium' : ''}>
                    {getFolderLabel(type, t)}
                  </span>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="ml-7 border-l border-[rgba(18,18,18,0.12)] pl-4">
                    {typeYears.map((year) => {
                      const yearMonths = getMonthsFromFiles(files, year, type);
                      const isCurrentYear = currentFolder?.year === year && currentFolder?.type === type;
                      const isYearExpanded = expandedYears.has(`${type}-${year}`);

                      return (
                        <div key={year}>
                          <div
                            className={`folder-item flex items-center gap-3 py-2 text-sm cursor-pointer transition-colors duration-200 ${isCurrentYear && !currentFolder?.month ? 'text-[#121212] font-medium' : 'text-[#121212]'
                              }`}
                            onClick={() => {
                              onFolderSelect?.({ type, year });
                              toggleYear(`${type}-${year}`);
                            }}
                          >
                            <ChevronRight
                              className={`w-4 h-4 transition-transform duration-300 ${isYearExpanded ? 'rotate-90' : ''
                                }`}
                            />
                            <span className={isCurrentYear && !currentFolder?.month ? 'font-medium' : ''}>
                              {year}
                            </span>
                          </div>

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isYearExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                              }`}
                          >
                            <div className="ml-7 border-l border-[rgba(18,18,18,0.12)] pl-4">
                              {yearMonths.map((month) => {
                                const isCurrentMonth = currentFolder?.month === month &&
                                  currentFolder?.year === year &&
                                  currentFolder?.type === type;

                                return (
                                  <div
                                    key={month}
                                    className={`folder-item flex items-center gap-3 py-2 text-sm cursor-pointer transition-colors duration-200 ${isCurrentMonth ? 'text-[#121212] font-medium' : 'text-[#6B6B66]'
                                      }`}
                                    onClick={() => {
                                      onFolderSelect?.({ type, year, month });
                                    }}
                                  >
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                    <span className={isCurrentMonth ? 'font-medium' : ''}>
                                      {getMonthLabel(month, t)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
