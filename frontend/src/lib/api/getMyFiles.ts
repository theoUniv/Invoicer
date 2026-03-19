import { getAuthCookie, removeAuthCookie } from '../auth';
import { DocumentsResponse } from '../types/documents';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let lastErrorTime = 0;
let errorCount = 0;

export async function getMyFiles(params?: {
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

  const url = `${API_BASE_URL}/files/myfiles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const token = getAuthCookie();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthCookie();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    errorCount = 0;

    return response.json();
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
      console.error('Error fetching my files:', error);
    }

    throw error;
  }
}
