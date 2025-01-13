import { FilterOptions, Journal } from '../models';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

if (!API_URL || !API_KEY) {
  throw new Error('Missing required environment variables');
}

export async function searchJournals(query: string, filters: FilterOptions): Promise<Journal[]> {
  try {
    const requestBody = { filters: { ...filters, searchText: query } };

    const response = await fetch(`${API_URL}/api/journals/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${API_KEY}`,
        // 'Api-Version': API_VERSION || 'v1',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid response format');
    
    return data.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}