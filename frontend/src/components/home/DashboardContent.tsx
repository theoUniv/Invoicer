'use client';

import { ViewToggle } from '@/components/ui';
import { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { InvoiceTable } from './InvoiceTable';
import { InvoiceFolders } from './InvoiceFolders';
import { UploadPanel } from './UploadPanel';
import { useAppTranslation } from '@/hooks/useTranslation';
import { FileData, FileType, UploadItem } from '@/lib/types/documents';
import { groupFilesByHierarchy, getTypesFromGroups, getYearsForType, getMonthsForTypeAndYear, normalizeDateString } from '@/lib/utils/dateUtils';
import { ExtractedInvoiceData } from '@/lib/utils/documentDetailTransform';
import { updateFileDatesWithExtractedData } from '@/lib/utils/fileDateUpdater';

interface DashboardContentProps {
  files: FileData[];
  uploads: UploadItem[];
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onDateFilterChange?: (value: string) => void;
  onViewInvoice?: (file: FileData) => void;
  onUploadStart?: (item: UploadItem) => void;
  onUploadFinish?: (itemName: string) => void;
  onUploadComplete?: () => void;
  getExtractedData?: (file: FileData) => ExtractedInvoiceData | null;
}

export function DashboardContent({
  files,
  uploads,
  onFileSelect,
  isLoading = false,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onViewInvoice,
  onUploadStart,
  onUploadFinish,
  onUploadComplete,
  getExtractedData
}: DashboardContentProps) {
  const [activeView, setActiveView] = useState<'list' | 'folders'>('list');
  const [currentFolder, setCurrentFolder] = useState<{ type: FileType; year?: string; month?: string } | undefined>(undefined);
  const [updatedFiles, setUpdatedFiles] = useState<FileData[]>(files);
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>(files);

  useEffect(() => {
    if (getExtractedData) {
      const extractedDataMap = new Map<number, ExtractedInvoiceData>();
      files.forEach(file => {
        const extracted = getExtractedData(file);
        if (extracted) {
          const documentId = parseInt(file.id.replace('#', ''));
          extractedDataMap.set(documentId, extracted);
        }
      });
      
      if (extractedDataMap.size > 0) {
        const filesWithCorrectDates = updateFileDatesWithExtractedData(files, extractedDataMap);
        setUpdatedFiles(filesWithCorrectDates);
      } else {
        setUpdatedFiles(files);
      }
    } else {
      setUpdatedFiles(files);
    }
  }, [files, getExtractedData]);

  useEffect(() => {
    setFilteredFiles(updatedFiles);
  }, [updatedFiles]);

  const handleFolderSelect = (folder: { type: FileType; year?: string; month?: string } | undefined) => {
    setCurrentFolder(folder);
  };

  const handleBreadcrumbClick = (level: 'root' | 'type' | 'year' | 'month', folder?: { type: FileType; year?: string; month?: string }) => {
    if (level === 'root') {
      setCurrentFolder(undefined);
    } else if (level === 'type' && folder) {
      setCurrentFolder({ type: folder.type });
    } else if (level === 'year' && folder) {
      setCurrentFolder({ type: folder.type, year: folder.year });
    }
  };

  const handleFilteredFilesChange = useCallback((newFilteredFiles: FileData[]) => {
    setFilteredFiles(newFilteredFiles);
  }, []);

  const getFilteredFiles = () => {
    if (!currentFolder) {
      return filteredFiles;
    }

    return filteredFiles.filter(file => {
      if (file.type !== currentFolder.type) return false;
      
      if (currentFolder.year) {
        const fileDate = normalizeDateString(file.date);
        if (!fileDate) return false;
        const fileYear = fileDate.getFullYear().toString();
        if (fileYear !== currentFolder.year) return false;
      }
      
      if (currentFolder.month) {
        const fileDate = normalizeDateString(file.date);
        if (!fileDate) return false;
        const fileMonth = (fileDate.getMonth() + 1).toString().padStart(2, '0');
        if (fileMonth !== currentFolder.month) return false;
      }
      
      return true;
    });
  };

  const getSubFolders = () => {
    const baseFiles = currentFolder?.type
      ? updatedFiles.filter(file => file.type === currentFolder.type)
      : updatedFiles;

    const fileGroups = groupFilesByHierarchy(baseFiles);

    let subFolders: Array<{ type: FileType; year?: string; month?: string }> = [];
    
    if (!currentFolder) {
      const types = getTypesFromGroups(fileGroups);
      subFolders = types.map(type => ({ type }));
    } else if (currentFolder.type && !currentFolder.year) {
      const years = getYearsForType(fileGroups, currentFolder.type);
      subFolders = years.map(year => ({ type: currentFolder.type, year }));
    } else if (currentFolder.type && currentFolder.year && !currentFolder.month) {
      const months = getMonthsForTypeAndYear(fileGroups, currentFolder.type, currentFolder.year);
      subFolders = months.map(month => ({ type: currentFolder.type, year: currentFolder.year, month }));
    } else if (currentFolder.type && currentFolder.year && currentFolder.month) {
      subFolders = [];
    }
    
    return subFolders;
  };

  return (
    <main className="flex flex-1 px-12 py-12 gap-16 max-w-[1600px] mx-auto w-full">
      
      <UploadPanel
        uploads={uploads}
        onFileSelect={onFileSelect}
        onUploadComplete={onUploadComplete}
        onUploadStart={onUploadStart}
        onUploadFinish={onUploadFinish}
        showTree={activeView === 'folders'}
        files={filteredFiles}
        onFolderSelect={handleFolderSelect}
        currentFolder={currentFolder}
      />

      <section className="flex-1 flex flex-col">
        
        <DashboardHeader
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
          onDateFilterChange={onDateFilterChange}
          activeView={activeView}
          currentFolder={currentFolder}
          onBreadcrumbClick={handleBreadcrumbClick}
          files={files}
          onFilteredFilesChange={handleFilteredFilesChange}
        />

        <div className={`flex justify-end mb-4 ${activeView === 'folders' ? '-mt-14' : ''}`}>
          <ViewToggle 
            activeView={activeView}
            onViewChange={setActiveView}
          />
        </div>

        {activeView === 'list' ? (
          filteredFiles.length === 0 ? (
            <div className="flex items-center text-sm justify-center h-12 text-black">
              <p>Aucun fichier pour le moment</p>
            </div>
          ) : (
            <InvoiceTable 
              files={filteredFiles}
              isLoading={isLoading}
              onViewInvoice={onViewInvoice}
              getExtractedData={getExtractedData}
            />
          )
        ) : (
          getFilteredFiles().length === 0 ? (
            <div className="flex items-center text-sm justify-center h-12 text-black">
              <p>Aucun fichier pour le moment</p>
            </div>
          ) : (
            <InvoiceFolders 
              files={getFilteredFiles()}
              subFolders={getSubFolders()}
              currentFolder={currentFolder}
              onFolderSelect={handleFolderSelect}
              onViewInvoice={onViewInvoice}
            />
          )
        )}
      </section>
    </main>
  );
}
