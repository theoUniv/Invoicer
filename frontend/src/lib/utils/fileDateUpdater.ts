import { FileData } from '../types/documents';
import { ExtractedInvoiceData } from './documentDetailTransform';

export function updateFileDatesWithExtractedData(files: FileData[], extractedDataMap: Map<number, ExtractedInvoiceData>): FileData[] {
  return files.map(file => {
    const documentId = parseInt(file.id.replace('#', ''));
    const extractedData = extractedDataMap.get(documentId);
    
    if (extractedData && extractedData.issueDate) {
      
      return {
        ...file,
        date: extractedData.issueDate
      };
    } else {
      return file;
    }
  });
}
