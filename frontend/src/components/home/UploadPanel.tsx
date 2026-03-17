import { UploadArea } from '@/components/ui/UploadArea';
import { EmptyState } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useTranslation';
import { ChevronRight, Folder, Upload } from 'lucide-react';
import { FileData, FileType } from '@/lib/files';
import { useState } from 'react';

interface UploadItem {
  name: string;
  status: 'processing' | 'done';
}

interface UploadPanelProps {
  uploads: UploadItem[];
  onFileSelect: (file: File) => void;
  showTree?: boolean;
  files?: FileData[];
  onFolderSelect?: (folder: { type: FileType; year?: string; month?: string } | undefined) => void;
  currentFolder?: {
    type: FileType;
    year?: string;
    month?: string;
  };
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

export function UploadPanel({
  uploads,
  onFileSelect,
  showTree = false,
  files = [],
  onFolderSelect,
  currentFolder
}: UploadPanelProps) {
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
    <aside className="w-80 flex-shrink-0 flex flex-col gap-6">
      <div>
        <h2 className="font-['Playfair_Display'] text-2xl leading-tight tracking-[-0.02em] mb-2 text-black">
          {t('dashboard.uploadDocument')}
        </h2>
        <div className="text-xs uppercase tracking-[0.05em] text-[#8A8580]">
          {t('dashboard.acceptedFormats')}
        </div>
      </div>

      <UploadArea onFileSelect={onFileSelect} />

      {!showTree && (
        <div className="mt-8">
          <div className="text-xs uppercase tracking-[0.05em] text-[#8A8580] mb-4">
            {t('dashboard.processingQueue')}
          </div>
          {uploads.length === 0 ? (
            <EmptyState message={t('dashboard.noFilesInQueue')} />
          ) : (
            <ul className="list-none">
              {uploads.map((item, index) => (
                <li key={index} className="flex items-center justify-between py-3 border-b border-[rgba(26,24,23,0.12)] text-sm">
                  <span className={item.status === 'done' ? 'text-[#8A8580]' : 'text-black'}>{item.name}</span>
                  <div
                    className={`w-2 h-2 rounded-full border border-[#1A1817] ${item.status === 'done' ? 'bg-[#1A1817]' : 'bg-transparent'
                      }`}
                    title={item.status === 'done' ? 'Done' : 'Processing'}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showTree && (
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
                      {getFolderLabel(type)}
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
                                        {getMonthLabel(month)}
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
      )}
    </aside>
  );
}
