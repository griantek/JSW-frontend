import { FilterOptions, Journal } from '../models';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export async function searchJournals(query: string, filters: FilterOptions, sortOption: string, sortOrder: 'asc' | 'desc'): Promise<Journal[]> {
  try {
    const requestBody = {
      filters: { 
        ...filters, 
        searchText: query 
      },
      sorting: {
        field: sortOption,
        order: sortOrder
      }
    };
    
    // Add console.log to see the request body
    // console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only add API key if it exists
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_URL}/api/journals/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search failed:', response.status, response.statusText, errorText);
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid response format');
    
    return data.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}