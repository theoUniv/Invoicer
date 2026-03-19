import { Document, FileData, FileType } from '../types/documents';

export function documentToFileData(doc: Document): FileData {
  const vendor = doc.companyLinks && doc.companyLinks.length > 0 ? doc.companyLinks[0].company.name : 'Unknown Vendor';
  
  const date = doc.uploadedAt;
  
  const mapDocumentType = (docTypeName: string): FileType => {
    switch (docTypeName.toLowerCase()) {
      case 'invoice':
      case 'facture':
        return 'invoice';
      case 'contract':
      case 'contrat':
        return 'contract';
      case 'devis':
        return 'devis';
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
        return 'processed';
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
