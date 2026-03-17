'use client';

import { useState, useEffect } from 'react';
import { DashboardContent } from '@/components/home';
import { getFilesData, addUploadItem, updateUploadStatus, Invoice, UploadItem } from '@/lib/files';

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFilesData();
        setInvoices(data.invoices);
        setUploads(data.uploads);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getFilesData();
        const processingIndex = data.uploads.findIndex(item => item.status === 'processing');
        
        if (processingIndex !== -1 && Math.random() > 0.7) {
          await updateUploadStatus(processingIndex, 'done');
          const updatedData = await getFilesData();
          setUploads(updatedData.uploads);
          setInvoices(updatedData.invoices);
        }
      } catch (error) {
        console.error('Error updating upload status:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = async (file: File) => {
    try {
      await addUploadItem(file);
      
      const data = await getFilesData();
      setUploads(data.uploads);
      
      setTimeout(async () => {
        const updatedData = await getFilesData();
        setUploads(updatedData.uploads);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    console.log('Search:', value);
  };

  const handleStatusFilterChange = (value: string) => {
    console.log('Status filter:', value);
  };

  const handleDateFilterChange = (value: string) => {
    console.log('Date filter:', value);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    console.log('View invoice:', invoice);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1ED] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1817] mx-auto mb-4"></div>
          <p className="text-[#8A8580]">Loading data...</p>
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
      
      <DashboardContent
        invoices={invoices}
        uploads={uploads}
        onFileSelect={handleFileSelect}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onDateFilterChange={handleDateFilterChange}
        onViewInvoice={handleViewInvoice}
      />

    </div>
  );
}