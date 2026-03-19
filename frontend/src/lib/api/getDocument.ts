import { getAuthCookie } from '../auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';


export async function getDocument(id: number): Promise<Document> {
  const url = `${API_BASE_URL}/files/${id}`;
  const token = getAuthCookie();

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}
