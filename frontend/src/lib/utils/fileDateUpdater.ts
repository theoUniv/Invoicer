import { FileData } from '../types/documents';
import { ExtractedInvoiceData } from './documentDetailTransform';

export function updateFileDatesWithExtractedData(files: FileData[], extractedDataMap: Map<number, ExtractedInvoiceData>): FileData[] {
  console.log('=== UPDATE FILE DATES WITH EXTRACTED DATA ===');
  console.log('Files to update:', files.length);
  console.log('Extracted data available:', extractedDataMap.size);
  
  return files.map(file => {
    const documentId = parseInt(file.id.replace('#', ''));
    const extractedData = extractedDataMap.get(documentId);
    
    if (extractedData && extractedData.issueDate) {
      console.log(`✅ File ${file.id} (${documentId}): ${file.date} → ${extractedData.issueDate}`);
      
      return {
        ...file,
        date: extractedData.issueDate
      };
    } else {
      console.log(`⚠️ File ${file.id} (${documentId}): No extracted data, keeping ${file.date}`);
      return file;
    }
  });
}
