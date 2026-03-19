import filesData from '../data/files.json';
import { MinIOService } from './minio';

export type FileType = 'invoice' | 'contract' | 'quote' | 'expense';

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

let currentData: FilesData = filesData as FilesData;

const minioService = MinIOService.getInstance();

export async function getFilesData(): Promise<FilesData> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve(currentData);
    }, 100);
  });
}

export async function addUploadItem(file: File): Promise<FilesData> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const success = await minioService.uploadFile('raw', `invoices/${file.name}`, file);

        if (success) {
          const newUpload: UploadItem = {
            name: file.name,
            status: 'processing'
          };

          currentData.uploads = [...currentData.uploads, newUpload];
        }
      } catch (error) {
        console.error('Error uploading file to MinIO:', error);
      }

      resolve(currentData);
    }, 100);
  });
}

export async function updateUploadStatus(index: number, status: 'processing' | 'done'): Promise<FilesData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (currentData.uploads[index]) {
        currentData.uploads[index].status = status;
        
        // TOUT MODIFIER ICI AVEC LES VALEURS DE L'OCR / RANDOM TEMPORAIRE POUR SIMULATION
        if (status === 'done') {
          const completedUpload = currentData.uploads[index];
          const newFile: FileData = {
            id: `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', ''),
            vendor: 'Unknown Vendor',
            amount: `$${(Math.random() * 1000).toFixed(2)}`,
            status: 'pending',
            type: 'invoice',
            fileName: completedUpload.name
          };
          currentData.files.push(newFile);
          currentData.uploads.splice(index, 1);
        }
      }
      resolve(currentData);
    }, 300);
  });
}
