'use client';
import React, { useState, useCallback } from 'react';
import { Input, Button, Spinner } from '@nextui-org/react';
import { Search } from 'lucide-react';
import debounce from 'lodash/debounce';
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
    searchFields: ['Title'], // Ensure 'title' is always included
    publishers: [],
    databases: [],
    citeScoreRange: [0, 100],
    impactFactorRange: [0, 20],
  });
  const [useCiteScore, setUseCiteScore] = useState(false);
  const [useImpactFactor, setUseImpactFactor] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string, searchFilters: Partial<FilterOptions>) => {
      if (!query.trim()) return;
      
      try {
        const results = await searchJournals(query, searchFilters as FilterOptions);
        // Batch state updates
        requestAnimationFrame(() => {
          setJournals(results);
          setHasSearched(true);
          setIsFiltersExpanded(false);
          setIsProcessing(false);
          setIsLoading(false);
        });
      } catch (error) {
        console.error(error);
        setJournals([]);
        setIsProcessing(false);
        setIsLoading(false);
      }
    }, 500), // Increased debounce time
    []
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setIsProcessing(true);
    
    const searchFilters: Partial<FilterOptions> = { ...filters };
    if (!useCiteScore) {
      delete searchFilters.citeScoreRange;
    }
    if (!useImpactFactor) {
      delete searchFilters.impactFactorRange;
    }
    
    debouncedSearch(searchQuery, searchFilters);
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="w-full max-w-3xl mx-auto mb-8">
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

      <Filters 
        filters={filters} 
        onFiltersChange={setFilters} 
        useCiteScore={useCiteScore}
        setUseCiteScore={setUseCiteScore}
        useImpactFactor={useImpactFactor}
        setUseImpactFactor={setUseImpactFactor}
        isExpanded={isFiltersExpanded}
        setIsExpanded={setIsFiltersExpanded}
        disabled={isProcessing}
      />

      {isProcessing ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <SearchResults 
          journals={journals}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasSearched={hasSearched}
        />
      )}
    </main>
  );
}