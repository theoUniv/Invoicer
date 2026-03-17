'use client';

import { DashboardHeader } from './DashboardHeader';
import { UploadPanel } from './UploadPanel';
import { InvoiceTable } from './InvoiceTable';
import { ViewToggle } from '@/components/ui';
import { useState } from 'react';

interface Invoice {
  id: string;
  date: string;
  vendor: string;
  amount: string;
  status: 'paid' | 'pending';
}

interface UploadItem {
  name: string;
  status: 'processing' | 'done';
}

interface DashboardContentProps {
  invoices: Invoice[];
  uploads: UploadItem[];
  onFileSelect: (file: File) => void;
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onDateFilterChange?: (value: string) => void;
  onViewInvoice?: (invoice: Invoice) => void;
}

export function DashboardContent({
  invoices,
  uploads,
  onFileSelect,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onViewInvoice
}: DashboardContentProps) {
  const [activeView, setActiveView] = useState<'list' | 'grid'>('list');

  return (
    <main className="flex flex-1 px-12 py-12 gap-16 max-w-[1600px] mx-auto w-full">
      
      <UploadPanel 
        uploads={uploads}
        onFileSelect={onFileSelect}
      />

      <section className="flex-1 flex flex-col">
        
        <DashboardHeader
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
          onDateFilterChange={onDateFilterChange}
        />

        <div className="flex justify-end mb-4">
          <ViewToggle 
            activeView={activeView}
            onViewChange={setActiveView}
          />
        </div>

        {activeView === 'list' ? (
          <InvoiceTable 
            invoices={invoices}
            onViewInvoice={onViewInvoice}
          />
        ) : (
          <div className="text-center py-8 text-[#8A8580]">
            Folders view coming soon...
          </div>
        )}

      </section>
    </main>
  );
}
