import { getAuthCookie, removeAuthCookie } from '../auth';
import { DocumentDetailResponse } from '../types/documentDetail';
import { formatDateWithoutHook } from '../utils/dateFormatter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getDocumentDetail(documentId: number, translations?: any, language: string = 'fr'): Promise<DocumentDetailResponse> {
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
      if (response.status === 401) {
        removeAuthCookie();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (translations && result.data) {
      result.data = formatDocumentDates(result.data, translations, language);
    }

    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching document detail:', error);
    throw error;
  }
}

function formatDocumentDates(document: any, translations: any, language: string = 'fr'): any {
  const formattedDoc = { ...document };
  
  if (formattedDoc.uploadedAt) {
    formattedDoc.uploadedAt = formatDateWithoutHook(formattedDoc.uploadedAt, translations, language);
  }
  
  if (formattedDoc.versions) {
    formattedDoc.versions = formattedDoc.versions.map((version: any) => ({
      ...version,
      extractedAt: formatDateWithoutHook(version.extractedAt, translations, language),
      validatedAt: version.validatedAt ? formatDateWithoutHook(version.validatedAt, translations, language) : version.validatedAt
    }));
  }
  
  return formattedDoc;
}
