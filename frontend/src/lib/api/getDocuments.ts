import { DocumentsResponse } from '../types/documents';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let lastErrorTime = 0;
let errorCount = 0;

export async function getDocuments(params?: {
  status?: string;
  documentTypeId?: number;
  limit?: number;
  offset?: number;
}): Promise<DocumentsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.append('status', params.status);
  if (params?.documentTypeId !== undefined) searchParams.append('documentTypeId', params.documentTypeId.toString());
  if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
  if (params?.offset !== undefined) searchParams.append('offset', params.offset.toString());

  const url = `${API_BASE_URL}/documents${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    errorCount = 0;

    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    const now = Date.now();
    if (now - lastErrorTime < 10000) {
      errorCount++;
    } else {
      errorCount = 1;
    }
    lastErrorTime = now;

    if (errorCount <= 2) {
      console.error('Error fetching documents:', error);
    }

    throw error;
  }
}
