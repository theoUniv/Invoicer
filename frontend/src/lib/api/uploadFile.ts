import { getAuthCookie } from '../auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/api" || 'http://localhost:3001/api';

export async function uploadFile(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('documentTypeId', '1');
    
    const token = getAuthCookie();
    
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de l\'upload' 
    };
  }
}
