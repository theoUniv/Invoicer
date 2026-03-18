'use client';

import { useState, useEffect } from 'react';
import { OverviewContent } from '@/components/home';
import { getFilesData, FileData } from '@/lib/files';

export default function Overview() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFilesData();
        setFiles(data.files);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearchChange = (value: string) => {
    console.log('Search:', value);
  };

  const handleStatusFilterChange = (value: string) => {
    console.log('Status filter:', value);
  };

  const handleDateFilterChange = (value: string) => {
    console.log('Date filter:', value);
  };

  const handleViewInvoice = (file: FileData) => {
    console.log('View file:', file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1ED] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1817] mx-auto mb-4"></div>
          <p className="text-[#8A8580]">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1ED] pt-24" 
         style={{
           backgroundImage: 'radial-gradient(circle at 80% 90%, rgba(212, 197, 211, 1) 0%, transparent 50%), radial-gradient(circle at 10% 10%, rgba(220, 224, 228, 0.5) 0%, transparent 40%)',
           backgroundAttachment: 'fixed'
         }}>
      
      <OverviewContent
        files={files}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onDateFilterChange={handleDateFilterChange}
        onViewInvoice={handleViewInvoice}
      />

    </div>
  );
}
