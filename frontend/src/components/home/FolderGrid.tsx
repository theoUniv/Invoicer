import { useContextMenu } from '@/components/ui/ContextMenu';
import { FileData, FileType } from '@/lib/types/documents';
import { Download, Eye, File, FileText, FolderOpen, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppTranslation } from '@/hooks/useTranslation';
import { FileModal } from './FileModal';
import { getDocumentDetail } from '@/lib/api';
import { extractInvoiceData } from '@/lib/utils/documentDetailTransform';
import { groupFilesByHierarchy, getFilesInGroup, countFilesInGroup, getTypesFromGroups, getYearsForType, getMonthsForTypeAndYear } from '@/lib/utils/dateUtils';
import { updateFileDatesWithExtractedData } from '@/lib/utils/fileDateUpdater';

interface FolderGridProps {
  files: FileData[];
  subFolders: Array<{ type: FileType; year?: string; month?: string }>;
  currentFolder?: { type: FileType; year?: string; month?: string };
  onFolderSelect: (folder: { type: FileType; year?: string; month?: string }) => void;
  onViewFile: (file: FileData) => void;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'invoice':
      return <FileText className="w-10 h-10 text-[#121212]" />;
    case 'quote':
      return <FileText className="w-10 h-10 text-[#121212]" />;
    default:
      return <File className="w-10 h-10 text-[#121212]" />;
  }
};

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

const getFolderInfo = (folder: { type: FileType; year?: string; month?: string }, groups: Record<string, Record<string, Record<string, FileData[]>>>, t: any) => {
  let label = '';
  let fileCount = 0;
  
  console.log('getFolderInfo called with:', { folder, groupsKeys: Object.keys(groups) });
  
  if (!folder.year) {
    label = getFolderLabel(folder.type, t);
    fileCount = countFilesInGroup(groups, folder.type);
  } else if (!folder.month) {
    label = folder.year;
    fileCount = countFilesInGroup(groups, folder.type, folder.year);
  } else {
    label = getMonthLabel(folder.month, t);
    fileCount = countFilesInGroup(groups, folder.type, folder.year, folder.month);
  }
  
  console.log('getFolderInfo result:', { label, fileCount });
  
  return { label, fileCount };
};

export function FolderGrid({ 
  files, 
  subFolders, 
  currentFolder, 
  onFolderSelect, 
  onViewFile 
}: FolderGridProps) {
  const { t, translations, currentLanguage } = useAppTranslation();
  const shouldShowFiles = currentFolder?.month !== undefined;
  
  const { showContextMenu, ContextMenuComponent } = useContextMenu();
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [extractedData, setExtractedData] = useState<Map<number, any>>(new Map());
  const [updatedFiles, setUpdatedFiles] = useState<FileData[]>(files);

  useEffect(() => {
    console.log('=== FILE DATE UPDATE ===');
    console.log('Original files count:', files.length);
    console.log('Extracted data count:', extractedData.size);
    
    if (extractedData.size > 0) {
      const filesWithCorrectDates = updateFileDatesWithExtractedData(files, extractedData);
      setUpdatedFiles(filesWithCorrectDates);
      
      const updatedCount = filesWithCorrectDates.filter((f: any, i: number) => 
        f.date !== files[i]?.date
      ).length;
      console.log(`✅ Updated ${updatedCount} files with extracted dates`);
      
    } else {
      console.log('⚠️ No extracted data yet, using original files');
      setUpdatedFiles(files);
    }
    console.log('========================');
  }, [files, extractedData]);

  const fileGroups = groupFilesByHierarchy(updatedFiles);
  
  const computeSubFolders = () => {
    let folders: Array<{ type: FileType; year?: string; month?: string }> = [];

    if (!currentFolder) {
      const types = getTypesFromGroups(fileGroups);
      folders = types.map((type) => ({ type }));
    } else if (currentFolder.type && !currentFolder.year) {
      const years = getYearsForType(fileGroups, currentFolder.type);
      folders = years.map((year) => ({ type: currentFolder.type, year }));
    } else if (currentFolder.type && currentFolder.year && !currentFolder.month) {
      const months = getMonthsForTypeAndYear(fileGroups, currentFolder.type, currentFolder.year);
      folders = months.map((month) => ({ type: currentFolder.type, year: currentFolder.year, month }));
    } else {
      folders = [];
    }

    return folders;
  };

  const computed = computeSubFolders();
  const effectiveSubFolders =
    computed.length > 0 ? computed : subFolders;

  const showSubFolders = effectiveSubFolders.length > 0;

  console.log('=== FOLDER GRID DEBUG ===');
  console.log('shouldShowFiles:', shouldShowFiles);
  console.log('showSubFolders:', showSubFolders);
  console.log('effectiveSubFolders:', effectiveSubFolders);
  console.log('currentFolder:', currentFolder);
  console.log('========================');
  
  const currentFolderFiles = currentFolder 
    ? getFilesInGroup(fileGroups, currentFolder.type, currentFolder.year, currentFolder.month)
    : updatedFiles;

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      const paidFiles = files.filter(file => 
        file.status === 'paid' && 
        file.id !== '#000001' && 
        file.id !== '#000002' &&
        !extractedData.has(parseInt(file.id.replace('#', '')))
      );

      if (paidFiles.length > 0) {
        const promises = paidFiles.map(async (file) => {
          const documentId = parseInt(file.id.replace('#', ''));
          try {
            const detail = await getDocumentDetail(documentId, translations, currentLanguage);
            const extracted = extractInvoiceData(detail.data, translations, currentLanguage);
            return { documentId, detail: detail.data, extracted };
          } catch (error) {
            console.error(`Error fetching detail for document ${documentId}:`, error);
            return { documentId, detail: null, extracted: null };
          }
        });

        const results = await Promise.all(promises);
        const newExtractedData = new Map<number, any>();
        
        results.forEach(({ documentId, detail, extracted }) => {
          if (extracted) {
            newExtractedData.set(documentId, extracted);
          }
        });

        if (newExtractedData.size > 0) {
          setExtractedData(prev => new Map([...prev, ...newExtractedData]));
        }
      }
    };

    if (files.length > 0) {
      fetchDocumentDetails();
    }
  }, [files, translations, currentLanguage]);

  const getExtractedDataForFile = (file: FileData) => {
    const documentId = parseInt(file.id.replace('#', ''));
    return extractedData.get(documentId) || null;
  };

  const getFileDataWithDetails = (file: FileData): FileData => {
    const extracted = getExtractedDataForFile(file);
    const updatedFile = { ...file };
    
    if (extracted && extracted.vendor && extracted.vendor !== 'Unknown Vendor') {
      updatedFile.vendor = extracted.vendor;
    }
    
    if (extracted && extracted.totalTtc && extracted.totalTtc !== '') {
      updatedFile.amount = extracted.totalTtc;
    }
    
    return updatedFile;
  };

  const handleFileRightClick = (e: React.MouseEvent, file: FileData) => {
    e.preventDefault();
    
    const menuItems = [
      {
        label: t('dashboard.folders.contextMenu.view'),
        icon: <Eye className="w-4 h-4" />,
        onClick: () => {
          setSelectedFile(file);
          setShowModal(true);
        }
      },
      {
        label: t('dashboard.folders.contextMenu.download'),
        icon: <Download className="w-4 h-4" />,
        onClick: async () => {
          if (file.id !== '#000001' && file.id !== '#000002') {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/documents/${file.id.replace('#', '')}/raw-file`);
              if (!response.ok) throw new Error('Download failed');
              
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = file.fileName;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (error) {
              console.error('Download error:', error);
              alert('Erreur lors du téléchargement');
            }
          } else {
            alert('Document de démonstration - pas de fichier réel');
          }
        }
      }
    ];

    showContextMenu(e, menuItems);
  };

  const handleModalView = (file: FileData) => {
    onViewFile(file);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-8">
        {showSubFolders && effectiveSubFolders.map((folder, index) => {
          const { label, fileCount } = getFolderInfo(folder, fileGroups, t);
          const isCurrentFolder = currentFolder && 
            currentFolder.type === folder.type && 
            currentFolder.year === folder.year && 
            currentFolder.month === folder.month;
          
          return (
            <div 
              key={`folder-${index}`}
              className={`folder-item file-card flex flex-col items-center text-center gap-3 p-6 rounded border border-transparent transition-all duration-200 cursor-pointer hover:bg-white/50 hover:border-[rgba(18,18,18,0.12)] ${
                isCurrentFolder 
                  ? 'bg-white/50 border-[rgba(18,18,18,0.12)]' 
                  : ''
              }`}
              onClick={() => onFolderSelect(folder)}
            >
              <div className="w-20 h-20 bg-transparent border-none flex items-center justify-center relative">
                <FolderOpen className="w-10 h-10 text-[#121212]" />
              </div>
              <span className="text-sm text-[#121212] break-all line-clamp-2 overflow-hidden font-medium">
                {label}
              </span>
              <span className="text-xs text-[#6B6B66] uppercase">
                {fileCount} {fileCount === 1 ? t('dashboard.folders.file') : t('dashboard.folders.files')}
              </span>
            </div>
          );
        })}
        
        {shouldShowFiles && currentFolderFiles.map((file, index) => {
          const fileWithDetails = getFileDataWithDetails(file);
          return (
            <div 
              key={`file-${index}`}
              className="file-card flex flex-col items-center text-center gap-3 p-6 rounded border border-transparent transition-all duration-200 cursor-pointer hover:bg-white/50 hover:border-[rgba(18,18,18,0.12)]"
              onClick={() => onViewFile(fileWithDetails)}
              onContextMenu={(e) => handleFileRightClick(e, fileWithDetails)}
            >
              <div className="w-20 h-20 bg-transparent border-none flex items-center justify-center relative">
                {getFileIcon(fileWithDetails.type)}
              </div>
              <span className="text-sm text-[#121212] break-all line-clamp-2 overflow-hidden">
                {fileWithDetails.fileName}
              </span>
              <span className="text-xs text-[#6B6B66] uppercase">
                {fileWithDetails.amount}
              </span>
            </div>
          );
        })}
      </div>

      {ContextMenuComponent}

      {showModal && selectedFile && (
        <FileModal 
          file={selectedFile}
          onClose={() => {
            setShowModal(false);
            setSelectedFile(null);
          }}
          onView={handleModalView}
        />
      )}
    </div>
  );
}
