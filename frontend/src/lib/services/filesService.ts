import { getDocuments } from '../api/getDocuments';
import { getMyFiles } from '../api/getMyFiles';
import { uploadFile } from '../api/uploadFile';
import { getDocumentDetail } from '../api/getDocumentDetail';
import { documentToFileData } from '../utils/documentTransform';
import { extractInvoiceData } from '../utils/documentDetailTransform';
import { createDocumentVersion } from '../api/createDocumentVersion';
import { FilesData, FileData } from '../types/documents';
import { ExtractedInvoiceData } from '../utils/documentDetailTransform';

export async function getFilesData(params?: {
  status?: string;
  documentTypeId?: number;
  limit?: number;
  offset?: number;
}): Promise<FilesData> {
  try {
    const documentsResponse = await getDocuments(params);
    const files = documentsResponse.data.map(documentToFileData);

    return {
      files,
      uploads: []
    };
  } catch (error) {
    console.error('Error fetching documents:', error);

    // SI JAMAIS API DOWN, DONNEES FICTIVES
    const fallbackFiles: FileData[] = [
      {
        id: '#000001',
        date: '18 mars 2026',
        vendor: 'Entreprise Demo',
        amount: '—',
        status: 'pending',
        type: 'invoice',
        fileName: 'facture_demo.pdf'
      },
      {
        id: '#000002',
        date: '17 mars 2026',
        vendor: 'Fournisseur Test',
        amount: '—',
        status: 'paid',
        type: 'contract',
        fileName: 'contrat_test.pdf'
      }
    ];

    return {
      files: fallbackFiles,
      uploads: []
    };
  }
}

export async function getMyFilesData(params?: {
  status?: string;
  documentTypeId?: number;
  limit?: number;
  offset?: number;
}): Promise<FilesData> {
  try {
    const documentsResponse = await getMyFiles(params);
    const files = documentsResponse.data.map(documentToFileData);

    return {
      files,
      uploads: []
    };
  } catch (error) {
    console.error('Error fetching my files:', error);

    // SI JAMAIS API DOWN, DONNEES FICTIVES
    const fallbackFiles: FileData[] = [
      {
        id: '#000001',
        date: '18 mars 2026',
        vendor: 'Entreprise Demo',
        amount: '—',
        status: 'pending',
        type: 'invoice',
        fileName: 'facture_demo.pdf'
      },
      {
        id: '#000002',
        date: '17 mars 2026',
        vendor: 'Fournisseur Test',
        amount: '—',
        status: 'paid',
        type: 'contract',
        fileName: 'contrat_test.pdf'
      }
    ];

    return {
      files: fallbackFiles,
      uploads: []
    };
  }
}

export async function addUploadItem(file: File): Promise<FilesData> {
  return { files: [], uploads: [{ name: file.name, status: 'processing' }] };
}

export async function updateUploadStatus(index: number, status: 'processing' | 'done'): Promise<FilesData> {
  return { files: [], uploads: [] };
}

export async function getInvoiceDetail(documentId: number): Promise<ExtractedInvoiceData | null> {
  try {
    const documentDetail = await getDocumentDetail(documentId);
    return extractInvoiceData(documentDetail.data);
  } catch (error) {
    console.error('Error fetching invoice detail:', error);
    return null;
  }
}

export { uploadFile, createDocumentVersion };
