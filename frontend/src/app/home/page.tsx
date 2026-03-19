'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardContent } from '@/components/home';
import { addUploadItem, FileData, getFilesData, getMyFilesData, updateUploadStatus, UploadItem } from '@/lib/files';
import { useEffect, useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getMyFilesData();
        setFiles(data.files);
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
        const data = await getMyFilesData();
        const processingIndex = data.uploads.findIndex(item => item.status === 'processing');
        
        if (processingIndex !== -1 && Math.random() > 0.7) {
          await updateUploadStatus(processingIndex, 'done');
          const updatedData = await getFilesData();
          setUploads(updatedData.uploads);
          setFiles(updatedData.files);
        }
      } catch (error) {
        console.error('Error updating upload status:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleUploadStart = (item: UploadItem) => {
    setUploads(prev => [...prev, item]);
  };

  const handleUploadFinish = (itemName: string) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.name === itemName 
          ? { ...upload, status: 'done' as const }
          : upload
      )
    );
    
    setTimeout(async () => {
      try {
        const data = await getMyFilesData();
        setFiles(data.files);
      } catch (error) {
        console.error('Error reloading files:', error);
      }
    }, 1000);
  };

  const handleUploadComplete = () => {
    setTimeout(() => {
      setUploads(prev => prev.filter(upload => upload.status === 'processing'));
    }, 3000);
  };

  const handleFileSelect = async (file: File) => {
    try {
      await addUploadItem(file);
      
      const data = await getMyFilesData();
      setUploads(data.uploads);
      
      setTimeout(async () => {
        const updatedData = await getMyFilesData();
        setUploads(updatedData.uploads);
        setFiles(updatedData.files);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleViewInvoice = (file: FileData) => {
    if (file.id !== '#000001' && file.id !== '#000002') {
      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/documents/${file.id.replace('#', '')}/raw-file`, '_blank');
    } else {
      alert('Document de démonstration - pas de fichier réel');
    }
  };

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-[#F4F1ED] pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1817] mx-auto mb-4"></div>
            <p className="text-[#8A8580]">Loading data...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-[#F4F1ED] pt-24" 
           style={{
             backgroundImage: 'radial-gradient(circle at 80% 90%, rgba(212, 197, 211, 1) 0%, transparent 50%), radial-gradient(circle at 10% 10%, rgba(220, 224, 228, 0.5) 0%, transparent 40%)',
             backgroundAttachment: 'fixed'
           }}>
        
        <DashboardContent
          files={files}
          uploads={uploads}
          onFileSelect={handleFileSelect}
          onViewInvoice={handleViewInvoice}
          onUploadStart={handleUploadStart}
          onUploadFinish={handleUploadFinish}
          onUploadComplete={handleUploadComplete}
        />

      </div>
    </AuthGuard>
  );
}