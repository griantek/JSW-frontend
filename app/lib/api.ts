import { FilterOptions, Journal } from '../models';

export async function searchJournals(query: string, filters: FilterOptions): Promise<Journal[]> {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters }),
    });
    
    if (!response.ok) throw new Error('Search failed');
    
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}