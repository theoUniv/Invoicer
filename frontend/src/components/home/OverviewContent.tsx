'use client';

import { ViewToggle } from '@/components/ui';
import { useCallback, useRef } from 'react';
import { FileData, FileType } from '@/lib/types/documents';
import { getMonthsForTypeAndYear, getTypesFromGroups, getYearsForType, groupFilesByHierarchy, normalizeDateString } from '@/lib/utils/dateUtils';
import { ExtractedInvoiceData } from '@/lib/utils/documentDetailTransform';
import { updateFileDatesWithExtractedData } from '@/lib/utils/fileDateUpdater';
import { useEffect, useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { FolderTree } from './FolderTree';
import { InvoiceFolders } from './InvoiceFolders';
import { InvoiceTable } from './InvoiceTable';
import { KpiCards } from './KpiCards';

interface OverviewContentProps {
  files: FileData[];
  isLoading?: boolean;
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onDateFilterChange?: (value: string) => void;
  onViewInvoice?: (file: FileData) => void;
  getExtractedData?: (file: FileData) => ExtractedInvoiceData | null;
}

export function OverviewContent({
  files,
  isLoading = false,
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
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>(files);
  const statusFilterRef = useRef<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    setFilteredFiles(updatedFiles);
  }, [updatedFiles]);

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

  const mapStatusFilterValue = (value: string): 'all' | 'paid' | 'pending' => {
    const v = (value ?? '').toLowerCase();

    if (v === 'all') return 'all';
    if (v === 'paid') return 'paid';
    if (v === 'pending') return 'pending';

    if (v.includes('pending') || v.includes('en attente') || v.includes('en attente'.toLowerCase())) return 'pending';
    if (v.includes('paid') || v.includes('pay')) return 'paid';

    return 'all';
  };

  const handleStatusFilterChange = (value: string) => {
    const next = mapStatusFilterValue(value);
    statusFilterRef.current = next;
    onStatusFilterChange?.(value);
  };

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

  const handleFilteredFilesChange = useCallback((newFilteredFiles: FileData[]) => {
    const statusFilter = statusFilterRef.current;

    if (statusFilter === 'all') {
      setFilteredFiles(newFilteredFiles);
      return;
    }

    const statusFilteredFiles = newFilteredFiles.filter(file => {
      const raw = (file.status ?? '').toLowerCase();

      if (statusFilter === 'paid') {
        return raw === 'paid' || raw === 'processed' || raw === 'completed';
      }

      return raw === 'pending' || raw === 'uploaded' || raw === 'processing';
    });

    setFilteredFiles(statusFilteredFiles);
  }, []);

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
        <KpiCards files={files} getExtractedData={getExtractedData} isLoading={isLoading} />

        <DashboardHeader
          onSearchChange={onSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
          onDateFilterChange={onDateFilterChange}
          activeView={activeView}
          currentFolder={currentFolder}
          onBreadcrumbClick={handleBreadcrumbClick}
          files={updatedFiles}
          onFilteredFilesChange={handleFilteredFilesChange}
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
            isLoading={isLoading}
            onViewInvoice={onViewInvoice}
            getExtractedData={getExtractedData}
          />
        ) : (
          <div className="flex">
            <FolderTree
              files={filteredFiles}
              onFolderSelect={handleFolderSelect}
              currentFolder={currentFolder}
            />
            <InvoiceFolders
              files={getFilteredFiles()}
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
