import { getAuthCookie } from '../auth';
import { DocumentDetailResponse } from '../types/documentDetail';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getDocumentDetail(documentId: number): Promise<DocumentDetailResponse> {
  const token = getAuthCookie();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/files/${documentId}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Document detail API response:', result);

    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching document detail:', error);
    throw error;
  }
}
