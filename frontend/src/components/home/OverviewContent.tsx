'use client';

import { ViewToggle } from '@/components/ui';
import { useState, useEffect } from 'react';
import { DataTable, DataTableHeader, DataTableRow, DataTableCell, DataTableHeaderCell } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useTranslation';
import { FileData, FileType } from '@/lib/types/documents';
import { ExtractedInvoiceData } from '@/lib/utils/documentDetailTransform';
import { groupFilesByHierarchy, getTypesFromGroups, getYearsForType, getMonthsForTypeAndYear, normalizeDateString } from '@/lib/utils/dateUtils';
import { updateFileDatesWithExtractedData } from '@/lib/utils/fileDateUpdater';
import { KpiCards } from './KpiCards';
import { DashboardHeader } from './DashboardHeader';
import { InvoiceTable } from './InvoiceTable';
import { FolderTree } from './FolderTree';
import { InvoiceFolders } from './InvoiceFolders';

interface OverviewContentProps {
  files: FileData[];
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onDateFilterChange?: (value: string) => void;
  onViewInvoice?: (file: FileData) => void;
  getExtractedData?: (file: FileData) => ExtractedInvoiceData | null;
}

export function OverviewContent({
  files,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onViewInvoice,
  getExtractedData
}: OverviewContentProps) {
  const [activeView, setActiveView] = useState<'list' | 'folders'>('list');
  const [currentFolder, setCurrentFolder] = useState<{
    type: FileType;
    year?: string;
    month?: string;
  } | undefined>(undefined);

  const [updatedFiles, setUpdatedFiles] = useState<FileData[]>(files);

  useEffect(() => {
    if (getExtractedData) {
      const extractedDataMap = new Map<number, ExtractedInvoiceData>();

      files.forEach((file) => {
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

  const getFilteredFiles = () => {
    if (!currentFolder) {
      return updatedFiles;
    }

    return updatedFiles.filter(file => {
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
    const fileGroups = groupFilesByHierarchy(updatedFiles);
    
    if (!currentFolder) {
      const types = getTypesFromGroups(fileGroups);
      return types.map(type => ({ type }));
    }

    if (currentFolder.type && !currentFolder.year) {
      const years = getYearsForType(fileGroups, currentFolder.type);
      return years.map(year => ({ type: currentFolder.type, year }));
    }

    if (currentFolder.type && currentFolder.year && !currentFolder.month) {
      const months = getMonthsForTypeAndYear(fileGroups, currentFolder.type, currentFolder.year);
      return months.map(month => ({ type: currentFolder.type, year: currentFolder.year, month }));
    }

    return [];
  };

  return (
    <main className="flex flex-1 px-12 py-12 gap-16 max-w-[1600px] mx-auto w-full">
      <section className="flex-1 flex flex-col">
        <KpiCards files={files} />

        <DashboardHeader
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
          onDateFilterChange={onDateFilterChange}
          activeView={activeView}
          currentFolder={currentFolder}
          onBreadcrumbClick={handleBreadcrumbClick}
        />

        <div className={`flex justify-end mb-4 ${activeView === 'folders' ? '-mt-14' : ''}`}>
          <ViewToggle
            activeView={activeView}
            onViewChange={setActiveView}
          />
        </div>

        {activeView === 'list' ? (
          <InvoiceTable
            files={getFilteredFiles()}
            onViewInvoice={onViewInvoice}
            getExtractedData={getExtractedData}
          />
        ) : (
          <div className="flex">
            <FolderTree
              files={updatedFiles}
              onFolderSelect={handleFolderSelect}
              currentFolder={currentFolder}
            />
            <InvoiceFolders
              files={updatedFiles}
              subFolders={getSubFolders()}
              currentFolder={currentFolder}
              onFolderSelect={handleFolderSelect}
              onViewInvoice={onViewInvoice}
            />
          </div>
        )}
      </section>
    </main>
  );
}
