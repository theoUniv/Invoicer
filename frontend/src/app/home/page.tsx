'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardContent } from '@/components/home';
import { getMyFiles, uploadFile } from '@/lib/api';
import { documentToFileData } from '@/lib/utils/documentTransform';
import { FileData, UploadItem } from '@/lib/types/documents';
import { useEffect, useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getMyFiles();
        const files = data.data.map(documentToFileData);
        setFiles(files);
        setUploads([]);
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
        const hasProcessingUploads = uploads.some(item => item.status === 'processing');
        
        if (hasProcessingUploads) {
          const data = await getMyFiles();
          const files = data.data.map(documentToFileData);
          setFiles(files);
          
          setUploads(prev => 
            prev.map(upload => {
              const uploadAge = Date.now() - (upload as any).startTime;
              if (upload.status === 'processing' && uploadAge > 5000) {
                return { ...upload, status: 'done' as const };
              }
              return upload;
            })
          );
        }
      } catch (error) {
        console.error('Error checking upload status:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [uploads]);

  const handleUploadStart = (item: UploadItem) => {
    setUploads(prev => [...prev, { ...item, startTime: Date.now() }]);
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
        const data = await getMyFiles();
        const files = data.data.map(documentToFileData);
        setFiles(files);
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
      const uploadItem: UploadItem = {
        name: file.name,
        status: 'processing'
      };
      setUploads(prev => [...prev, uploadItem]);
      
      await uploadFile(file);
      
      setTimeout(async () => {
        const data = await getMyFiles();
        const files = data.data.map(documentToFileData);
        setFiles(files);
        
        setUploads(prev => 
          prev.map(upload => 
            upload.name === file.name 
              ? { ...upload, status: 'done' as const }
              : upload
          )
        );
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploads(prev => 
        prev.map(upload => 
          upload.name === file.name 
            ? { ...upload, status: 'done' as const }
            : upload
        )
      );
    }
  };

  const handleViewInvoice = (file: FileData) => {
    if (file.id !== '#000001' && file.id !== '#000002') {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${file.id.replace('#', '')}/raw-file`, '_blank');
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