export interface DocumentField {
  fieldId: number;
  versionId: number;
  fieldName: string;
  fieldValue: string;
  validationStatus: 'unchecked' | 'validated' | 'rejected';
  validatedBy: number | null;
  validatedAt: string | null;
  validator: any | null;
}

export interface DocumentVersion {
  versionId: number;
  documentId: number;
  versionNumber: number;
  ocrText: string | null;
  extractedAt: string;
  processedBy: number | null;
  processor: any | null;
  fields: DocumentField[];
}

export interface DocumentDetail {
  documentId: number;
  documentTypeId: number;
  originalName: string;
  storagePath: string;
  uploadedAt: string;
  uploadedBy: number | null;
  status: string;
  documentType: {
    documentTypeId: number;
    name: string;
    description: string;
  };
  uploader: any | null;
  versions: DocumentVersion[];
  companyLinks: any[];
}

export interface DocumentDetailResponse {
  data: DocumentDetail;
}
