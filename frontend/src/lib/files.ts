import filesData from '../data/files.json';
import { MinIOService } from './minio';

export interface Invoice {
  id: string;
  date: string;
  vendor: string;
  amount: string;
  status: 'paid' | 'pending';
}

export interface UploadItem {
  name: string;
  status: 'processing' | 'done';
}

export interface FilesData {
  invoices: Invoice[];
  uploads: UploadItem[];
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
          const newInvoice: Invoice = {
            id: `#ANT-${String(Date.now()).slice(-4)}`,
            date: new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }).replace(',', ''),
            vendor: completedUpload.name.replace(/\.[^/.]+$/, ""),
            amount: `$${(Math.random() * 1000 + 50).toFixed(2)}`,
            status: Math.random() > 0.5 ? 'paid' : 'pending'
          };
          
          currentData.invoices = [newInvoice, ...currentData.invoices];
          currentData.uploads.splice(index, 1);
        }
      }
      resolve(currentData);
    }, 300);
  });
}
