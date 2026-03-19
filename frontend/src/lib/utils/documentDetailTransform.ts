import { DocumentDetail, DocumentField } from '../types/documentDetail';

export interface ExtractedInvoiceData {
  invoiceNumber: string;
  issueDate: string;
  siret: string;
  tva: string;
  totalTtc: string;
  totalHt: string;
  totalTva: string;
  fields: DocumentField[];
  documentId: number;
  status: string;
}

export function extractInvoiceData(document: DocumentDetail): ExtractedInvoiceData | null {
  if (!document.versions.length || !document.versions[0].fields.length) {
    return null;
  }
  
  const fields = document.versions[0].fields;
  const fieldMap = new Map<string, string>();
  
  fields.forEach(field => {
    fieldMap.set(field.fieldName, field.fieldValue);
  });
  
  return {
    invoiceNumber: fieldMap.get('invoice_number') || '',
    issueDate: fieldMap.get('issue_date') || '',
    siret: fieldMap.get('siret') || '',
    tva: fieldMap.get('tva') || '',
    totalTtc: fieldMap.get('total_ttc') || '',
    totalHt: fieldMap.get('total_ht') || '',
    totalTva: fieldMap.get('total_tva') || '',
    fields,
    documentId: document.documentId,
    status: document.status
  };
}
