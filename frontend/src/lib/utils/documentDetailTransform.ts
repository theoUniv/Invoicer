import { DocumentDetail, DocumentField } from '../types/documentDetail';
import { formatDateWithoutHook } from './dateFormatter';

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

export function extractInvoiceData(document: DocumentDetail, translations?: any, language: string = 'fr'): ExtractedInvoiceData | null {
  if (!document.versions.length || !document.versions[0].fields.length) {
    return null;
  }
  
  const fields = document.versions[0].fields;
  const fieldMap = new Map<string, string>();
  
  fields.forEach(field => {
    fieldMap.set(field.fieldName, field.fieldValue);
  });
  
  const rawIssueDate = fieldMap.get('issue_date') || '';
  const formattedIssueDate = translations && rawIssueDate ? formatDateWithoutHook(rawIssueDate, translations, language) : rawIssueDate;
  
  return {
    invoiceNumber: fieldMap.get('invoice_number') || '',
    issueDate: formattedIssueDate,
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
