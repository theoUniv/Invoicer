'use client';

import { ViewToggle } from '@/components/ui';
import { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { InvoiceTable } from './InvoiceTable';
import { InvoiceFolders } from './InvoiceFolders';
import { KpiCards } from './KpiCards';
import { FolderTree } from './FolderTree';
import { FileData, FileType } from '@/lib/types/documents';
import { ExtractedInvoiceData } from '@/lib/utils/documentDetailTransform';

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
      return files;
    }

    return files.filter(file => {
      if (file.type !== currentFolder.type) return false;

      if (currentFolder.year) {
        const fileYear = new Date(file.date).getFullYear().toString();
        if (fileYear !== currentFolder.year) return false;
      }

      if (currentFolder.month) {
        const fileMonth = (new Date(file.date).getMonth() + 1).toString().padStart(2, '0');
        if (fileMonth !== currentFolder.month) return false;
      }

      return true;
    });
  };

  const getSubFolders = () => {
    if (!currentFolder) {
      const types = new Set<FileType>();
      files.forEach(file => types.add(file.type));
      return Array.from(types).map(type => ({ type }));
    }

    if (currentFolder.type && !currentFolder.year) {
      const years = new Set<string>();
      files.forEach(file => {
        if (file.type === currentFolder.type) {
          years.add(new Date(file.date).getFullYear().toString());
        }
      });
      return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
        .map(year => ({ type: currentFolder.type, year }));
    }

    if (currentFolder.type && currentFolder.year && !currentFolder.month) {
      const months = new Set<string>();
      files.forEach(file => {
        if (file.type === currentFolder.type) {
          const fileYear = new Date(file.date).getFullYear().toString();
          if (fileYear === currentFolder.year) {
            months.add((new Date(file.date).getMonth() + 1).toString().padStart(2, '0'));
          }
        }
      });
      return Array.from(months).sort((a, b) => parseInt(a) - parseInt(b))
        .map(month => ({ type: currentFolder.type, year: currentFolder.year, month }));
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
              files={files}
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
