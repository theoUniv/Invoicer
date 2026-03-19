'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OverviewContent } from '@/components/home';
import { getFilesData, getInvoiceDetail } from '@/lib/services/filesService';
import { FileData } from '@/lib/types/documents';
import { ExtractedInvoiceData } from '@/lib/utils/documentDetailTransform';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

export default function Overview() {
  const router = useRouter();
  const { user } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [extractedData, setExtractedData] = useState<Map<number, ExtractedInvoiceData>>(new Map());

  const roleName = user?.role?.name ? String(user.role.name).toLowerCase() : '';
  const isAdmin = roleName === 'admin' || roleName === 'administrator' || roleName.includes('admin');

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.replace('/home');
      return;
    }

    const loadData = async () => {
      try {
        const data = await getFilesData();
        setFiles(data.files);
        
        const processedFiles = data.files.filter(file => 
          file.status === 'paid'
        );
        
        const extractedPromises = processedFiles.map(async (file) => {
          const documentId = parseInt(file.id.replace('#', ''));
          try {
            const detail = await getInvoiceDetail(documentId);
            return { documentId, detail };
          } catch (error) {
            console.error(`Error fetching detail for document ${documentId}:`, error);
            return { documentId, detail: null };
          }
        });
        
        const results = await Promise.all(extractedPromises);
        const newExtractedData = new Map<number, ExtractedInvoiceData>();
        
        results.forEach(({ documentId, detail }) => {
          if (detail) {
            newExtractedData.set(documentId, detail);
          }
        });
        
        setExtractedData(newExtractedData);
      } catch (error) {
        console.error('Error loading data:', error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAdmin, router]);

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
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/documents/${file.id.replace('#', '')}/raw-file`, '_blank');
  };

  const getExtractedDataForFile = (file: FileData): ExtractedInvoiceData | null => {
    const documentId = parseInt(file.id.replace('#', ''));
    return extractedData.get(documentId) || null;
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-[#F4F1ED] pt-24" 
           style={{
             backgroundImage: 'radial-gradient(circle at 80% 90%, rgba(212, 197, 211, 1) 0%, transparent 50%), radial-gradient(circle at 10% 10%, rgba(220, 224, 228, 0.5) 0%, transparent 40%)',
             backgroundAttachment: 'fixed'
           }}>
        
        <OverviewContent
          files={files}
          isLoading={loading}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
          onDateFilterChange={handleDateFilterChange}
          onViewInvoice={handleViewInvoice}
          getExtractedData={getExtractedDataForFile}
        />

      </div>
    </AuthGuard>
  );
}
