import { useContextMenu } from '@/components/ui/ContextMenu';
import { FileData, FileType } from '@/lib/files';
import { Download, Eye, File, FileText, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
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

const getFolderInfo = (folder: { type: FileType; year?: string; month?: string }, allFiles: FileData[]) => {
  let label = '';
  let fileCount = 0;
  
  if (!folder.year) {
    label = getFolderLabel(folder.type);
    fileCount = allFiles.filter(f => f.type === folder.type).length;
  } else if (!folder.month) {
    label = folder.year;
    fileCount = allFiles.filter(f => 
      f.type === folder.type && 
      new Date(f.date).getFullYear().toString() === folder.year
    ).length;
  } else {
    label = getMonthLabel(folder.month);
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
  const shouldShowFiles = currentFolder?.month !== undefined;
  
  const { showContextMenu, ContextMenuComponent } = useContextMenu();
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileRightClick = (e: React.MouseEvent, file: FileData) => {
    e.preventDefault();
    
    const menuItems = [
      {
        label: 'Voir',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => {
          setSelectedFile(file);
          setShowModal(true);
        }
      },
      {
        label: 'Télécharger',
        icon: <Download className="w-4 h-4" />,
        onClick: () => {
          console.log('Télécharger:', file.fileName);
          alert(`Téléchargement de ${file.fileName} simulé`);
        }
      },
      {
        label: 'Supprimer',
        icon: <Trash2 className="w-4 h-4" />,
        danger: true,
        onClick: () => {
          if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${file.fileName}" ?`)) {
            console.log('Supprimer:', file.fileName);
            alert(`Suppression de ${file.fileName} simulée`);
          }
        }
      }
    ];

    showContextMenu(e, menuItems);
  };

  const handleModalView = (file: FileData) => {
    onViewFile(file);
  };

  const handleModalDelete = (file: FileData) => {
    console.log('Supprimer depuis modal:', file.fileName);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-8">
        {subFolders.map((folder, index) => {
          const { label, fileCount } = getFolderInfo(folder, files);
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
                {fileCount} {fileCount === 1 ? 'fichier' : 'fichiers'}
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
          onDelete={handleModalDelete}
        />
      )}
    </div>
  );
}
