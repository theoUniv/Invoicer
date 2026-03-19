import { getAuthCookie } from './auth';

export interface DocumentType {
  documentTypeId: number;
  name: string;
}

export interface Company {
  companyId: number;
  name: string;
  siret?: string;
}

export interface CompanyLink {
  company: Company;
}

export interface Document {
  documentId: number;
  originalName: string;
  status: string;
  uploadedAt: string;
  documentType: DocumentType;
  companyLinks: CompanyLink[];
}

export interface DocumentsResponse {
  data: Document[];
  pagination: {
    limit: number;
    offset: number;
  };
}

export type FileType = 'invoice' | 'contract' | 'quote' | 'expense' | 'other';

export interface FileData {
  id: string;
  date: string;
  vendor: string;
  amount: string;
  status: string;
  type: FileType;
  fileName: string;
}

export interface UploadItem {
  name: string;
  status: 'processing' | 'done';
}

export interface FilesData {
  files: FileData[];
  uploads: UploadItem[];
}

export interface Invoice {
  id: string;
  date: string;
  vendor: string;
  amount: string;
  status: 'paid' | 'pending';
}

const API_BASE_URL = 'http://72.60.37.180:3001/api';

let lastErrorTime = 0;
let errorCount = 0;

export async function getDocuments(params?: {
  status?: string;
  documentTypeId?: number;
  limit?: number;
  offset?: number;
}): Promise<DocumentsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.status) searchParams.append('status', params.status);
  if (params?.documentTypeId) searchParams.append('documentTypeId', params.documentTypeId.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  
  const url = `${API_BASE_URL}/documents${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Documents API response:', result);
    
    errorCount = 0;
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    
    const now = Date.now();
    if (now - lastErrorTime < 10000) {
      errorCount++;
    } else {
      errorCount = 1;
    }
    lastErrorTime = now;
    
    if (errorCount <= 2) {
      console.error('Error fetching documents:', error);
    }
    
    throw error;
  }
}

function documentToFileData(doc: Document): FileData {
  const vendor = doc.companyLinks && doc.companyLinks.length > 0 ? doc.companyLinks[0].company.name : 'Unknown Compagny';
  
  const date = new Date(doc.uploadedAt).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  
  const mapDocumentType = (docTypeName: string): FileType => {
    switch (docTypeName.toLowerCase()) {
      case 'invoice':
      case 'facture':
        return 'invoice';
      case 'contract':
      case 'contrat':
        return 'contract';
      case 'quote':
      case 'devis':
        return 'quote';
      case 'expense':
      case 'dépense':
        return 'expense';
      default:
        return 'other';
    }
  };
  
  const mapStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'processed':
      case 'completed':
        return 'paid';
      case 'uploaded':
      case 'processing':
      case 'pending':
        return 'pending';
      default:
        return status;
    }
  };
  
  return {
    id: `#${doc.documentId.toString().padStart(6, '0')}`,
    date,
    vendor,
    amount: '—',
    status: mapStatus(doc.status),
    type: mapDocumentType(doc.documentType.name),
    fileName: doc.originalName
  };
}

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

export async function getMyFiles(params?: {
  status?: string;
  documentTypeId?: number;
  limit?: number;
  offset?: number;
}): Promise<DocumentsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.status) searchParams.append('status', params.status);
  if (params?.documentTypeId) searchParams.append('documentTypeId', params.documentTypeId.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  
  const url = `${API_BASE_URL}/files/myfiles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const token = getAuthCookie();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    errorCount = 0;
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    const now = Date.now();
    if (now - lastErrorTime < 10000) {
      errorCount++;
    } else {
      errorCount = 1;
    }
    lastErrorTime = now;
    
    if (errorCount <= 2) {
      console.error('Error fetching my files:', error);
    }
    
    throw error;
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

export async function uploadFile(file: File): Promise<{ success: boolean; error?: string }> {
  const API_BASE_URL = 'http://72.60.37.180:3001/api';
  
  try {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('documentTypeId', '1');
    
    const token = getAuthCookie();
    
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de l\'upload' 
    };
  }
}

export async function addUploadItem(file: File): Promise<FilesData> {
  console.log('Upload legacy function called - to be implemented with real API');
  return { files: [], uploads: [{ name: file.name, status: 'processing' }] };
}

export async function updateUploadStatus(index: number, status: 'processing' | 'done'): Promise<FilesData> {
  console.log('Update upload status legacy function called - to be implemented');
  return { files: [], uploads: [] };
}
