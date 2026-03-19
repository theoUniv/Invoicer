import { FolderGrid } from './FolderGrid';
import { FileType, FileData } from '@/lib/types/documents';

interface InvoiceFoldersProps {
  files?: FileData[];
  subFolders?: Array<{ type: FileType; year?: string; month?: string }>;
  currentFolder?: { type: FileType; year?: string; month?: string };
  onFolderSelect?: (folder: { type: FileType; year?: string; month?: string }) => void;
  onViewInvoice?: (file: FileData) => void;
}

export function InvoiceFolders({ 
  files = [], 
  subFolders = [], 
  currentFolder,
  onFolderSelect,
  onViewInvoice 
}: InvoiceFoldersProps) {
  return (
    <FolderGrid
      files={files}
      subFolders={subFolders}
      currentFolder={currentFolder}
      onFolderSelect={onFolderSelect || (() => {})}
      onViewFile={onViewInvoice || (() => {})}
    />
  );
}
