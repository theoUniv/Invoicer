import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';


const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_MINIO_ENDPOINT!,
  region: process.env.NEXT_PUBLIC_MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_MINIO_ROOT_USER!,
    secretAccessKey: process.env.NEXT_PUBLIC_MINIO_ROOT_PASSWORD!,
  },
  forcePathStyle: true,
});

export interface InvoiceFile {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  url?: string;
}

export class MinIOService {
  private static instance: MinIOService;
  private rawBucket = 'raw';

  static getInstance(): MinIOService {
    if (!MinIOService.instance) {
      MinIOService.instance = new MinIOService();
    }
    return MinIOService.instance;
  }

  async uploadFile(bucket: string, key: string, file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
        ContentLength: file.size,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error uploading file:', error);
      return false;
    }
  }

  async getRawById(filename: string): Promise<any> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.rawBucket,
        Key: `invoices/${filename}`,
      });

      const response = await s3Client.send(command);
      const body = await response.Body?.transformToString();
      
      return body ? JSON.parse(body) : null;
    } catch (error) {
      console.error('Error getting raw file by ID:', error);
      return null;
    }
  }
}
