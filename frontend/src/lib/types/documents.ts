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
