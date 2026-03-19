import { getAuthCookie } from '../auth';
import { DocumentVersion } from '../types/documentDetail';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function createDocumentVersion(
  documentId: number, 
  fields: { fieldName: string, fieldValue: string | null }[]
): Promise<DocumentVersion> {
  const token = getAuthCookie();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/versions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ fields })
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error creating document version:', error);
    throw error;
  }
}
