import { useContextMenu } from '@/components/ui/ContextMenu';
import { FileData, FileType } from '@/lib/types/documents';
import { Download, Eye, File, FileText, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAppTranslation } from '@/hooks/useTranslation';
import { FileModal } from './FileModal';

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
  return months[month] || month;
};

const getFolderInfo = (folder: { type: FileType; year?: string; month?: string }, allFiles: FileData[], t: any) => {
  let label = '';
  let fileCount = 0;
  
  if (!folder.year) {
    label = getFolderLabel(folder.type, t);
    fileCount = allFiles.filter(f => f.type === folder.type).length;
  } else if (!folder.month) {
    label = folder.year;
    fileCount = allFiles.filter(f => 
      f.type === folder.type && 
      new Date(f.date).getFullYear().toString() === folder.year
    ).length;
  } else {
    label = getMonthLabel(folder.month, t);
    fileCount = allFiles.filter(f => 
      f.type === folder.type && 
      new Date(f.date).getFullYear().toString() === folder.year &&
      (new Date(f.date).getMonth() + 1).toString().padStart(2, '0') === folder.month
    ).length;
  }
  
  return { label, fileCount };
};

export function FolderGrid({ 
  files, 
  subFolders, 
  currentFolder, 
  onFolderSelect, 
  onViewFile 
}: FolderGridProps) {
  const { t } = useAppTranslation();
  const shouldShowFiles = currentFolder?.month !== undefined;
  
  const { showContextMenu, ContextMenuComponent } = useContextMenu();
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showModal, setShowModal] = useState(false);

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
        {subFolders.map((folder, index) => {
          const { label, fileCount } = getFolderInfo(folder, files, t);
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
        
        {shouldShowFiles && files.map((file, index) => (
          <div 
            key={`file-${index}`}
            className="file-card flex flex-col items-center text-center gap-3 p-6 rounded border border-transparent transition-all duration-200 cursor-pointer hover:bg-white/50 hover:border-[rgba(18,18,18,0.12)]"
            onClick={() => onViewFile(file)}
            onContextMenu={(e) => handleFileRightClick(e, file)}
          >
            <div className="w-20 h-20 bg-transparent border-none flex items-center justify-center relative">
              {getFileIcon(file.type)}
            </div>
            <span className="text-sm text-[#121212] break-all line-clamp-2 overflow-hidden">
              {file.fileName}
            </span>
            <span className="text-xs text-[#6B6B66] uppercase">
              {file.amount}
            </span>
          </div>
        ))}
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
