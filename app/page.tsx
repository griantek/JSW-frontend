'use client';

import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { Search } from 'lucide-react';
import { Filters } from '../components/Filters';
import { SearchResults } from '../components/SearchResults';
import { searchJournals } from './lib/api';
import type { Journal, FilterOptions } from './models';

export default function JournalSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [filters, setFilters] = useState<FilterOptions>({
    searchFields: [],
    publishers: [],
    databases: [],
    citeScoreRange: [0, 100],
    impactFactorRange: [0, 20],
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return; // Don't search if query is empty
    }

    try {
      setIsLoading(true);
      const results = await searchJournals(searchQuery, filters);
      setJournals(results);
      setHasSearched(true); // Mark that a search has been performed
    } catch (error) {
      console.error(error);
      // You could add error handling here
      setJournals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="flex gap-2">
          <Input
            placeholder="Search by Title, ISSN, or Aims & Scope"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow"
          />
          <Button 
            isLoading={isLoading}
            onClick={handleSearch}
            isDisabled={!searchQuery.trim()}
          >
            {!isLoading && <Search className="h-4 w-4" />}
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      <Filters filters={filters} onFiltersChange={setFilters} />

      <SearchResults 
        journals={journals}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasSearched={hasSearched}
      />
    </main>
  );
}